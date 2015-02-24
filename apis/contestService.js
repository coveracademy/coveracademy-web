"use strict"

var Contest     = require('../models/models').Contest,
    Audition    = require('../models/models').Audition,
    Sponsor     = require('../models/models').Sponsor,
    UserVote    = require('../models/models').UserVote,
    UserComment = require('../models/models').UserComment,
    User        = require('../models/models').User,
    Bookshelf   = require('../models/models').Bookshelf,
    settings    = require('../configs/settings'),
    logger      = require('../configs/logger'),
    slug        = require('../utils/slug'),
    entities    = require('../utils/entities'),
    mailService = require('./mailService'),
    messages    = require('./messages'),
    youtube     = require('./third/youtube'),
    constants   = require('./constants'),
    Promise     = require('bluebird'),
    moment      = require('moment'),
    _           = require('underscore'),
    $           = this;

_.str = require('underscore.string');

var auditionRelated = {withRelated: ['user']};
var auditionWithContestRelated = {withRelated: ['contest']};
var auditionWithContestAndUserRelated = {withRelated: ['contest', 'user']};
var contestWithSponsorsAndPrizesRelated = {withRelated: ['prizes', 'prizes.sponsor', 'sponsorsInContest', 'sponsorsInContest.sponsor']};
var userCommentRelated = {withRelated: ['user']};
var userCommentWithRepliesRelated = {withRelated: ['user', 'audition', 'replies', 'replies.user']};
var userCommentWithAuditionAndRepliesRelated = {withRelated: ['user', 'audition', 'replies', 'replies.user']};
var userVoteWithUserRelated = {withRelated: ['user']};
var userVoteWithAuditionAndContestRelated = {withRelated: ['audition', 'audition.contest']};
var userVoteWithAuditionUserRelated = {withRelated: ['audition', 'audition.user']};

exports.getContest = function(id) {
  return Contest.forge({id: id}).fetch(contestWithSponsorsAndPrizesRelated);
}

exports.getContestFromAudition = function(audition) {
  if(audition.related('contest') && audition.related('contest').id) {
    return Promise.resolve(audition.related('contest'));
  } else if(audition.get('contest_id')) {
    return $.getContest(audition.get('contest_id'));
  } else {
    return $.loadAudition(audition).then(function(audition) {
      return audition.related('contest');
    });
  }
}

exports.getPrizeForPlace = function(contest, place) {
  var prize = null;
  contest.related('prizes').forEach(function(currentPrize) {
    if(currentPrize.get('place') === place) {
      prize = currentPrize;
    }
  });
  return prize;
}

exports.latestContests = function(page, pageSize) {
  return Contest.collection().query(function(qb) {
    qb.orderBy('registration_date', 'desc');
    if(page && pageSize) {
      qb.offset((page - 1) * pageSize);
      qb.limit(pageSize);
    }
  }).fetch();
}

exports.listUnfinishedContests = function() {
  return Contest.collection().query(function(qb) {
    qb.where('progress', '!=', 'finished');
    qb.orderBy('registration_date', 'desc');
  }).fetch();
}

exports.listContestsToStart = function() {
  return Contest.collection().query(function(qb) {
    qb.where('progress', 'waiting');
    qb.orderBy('registration_date', 'desc');
  }).fetch();
}

exports.listContestsToFinish = function() {
  return Contest.collection().query(function(qb) {
    qb.where('progress', 'running');
    qb.orderBy('registration_date', 'desc');
  }).fetch();
}

var getPotentialWinners = function(contest) {
  return new Promise(function(resolve, reject) {
    var auditionWithScore = Bookshelf.knex.select('audition.*', Bookshelf.knex.raw('sum(user_vote.voting_power) as score')).from('audition').join('user_vote', 'audition.id', 'user_vote.audition_id').where('audition.contest_id', contest.id).groupBy('audition.id');
    var scores = Bookshelf.knex.sum('user_vote.voting_power as score').from('user_vote').join('audition', 'user_vote.audition_id', 'audition.id').join('contest', 'audition.contest_id', 'contest.id').where('contest.id', contest.id).groupBy('audition_id');
    var topScores = Bookshelf.knex.distinct('score').from(scores.as('scores')).orderBy('score', 'desc').limit(3);
    var winners = Bookshelf.knex.select('*').from(auditionWithScore.as('audition_with_score')).join(topScores.as('top_scores'), 'audition_with_score.score', 'top_scores.score').orderBy('audition_with_score.score', 'desc');

    var place = 1;
    var previousWinner = null;
    var potentialWinners = Audition.collection();
    winners.then(function(winnersRows) {
      winnersRows.forEach(function(winner) {
        var potentialWinner = Audition.forge(winner);
        potentialWinners.add(potentialWinner);
        if(previousWinner && potentialWinner.get('score') !== previousWinner.get('score')) {
          place++;
        }
        potentialWinner.set('place', place);
        previousWinner = potentialWinner;
      });

      resolve(potentialWinners);
    }).catch(function(err) {
      reject(err)
    });
  });
}

var chooseWinners = function(contest, transaction) {
  return new Promise(function(resolve, reject) {
    var savePromises = [];
    getPotentialWinners(contest).then(function(potentialWinners) {
      potentialWinners.forEach(function(winner) {
        winner.unset('score')
        savePromises.push(winner.save({place: winner.get('place')}, {patch: true, transacting: transaction}));
      });
      Promise.all(savePromises).then(function(winners) {
        var winnersCollection = Audition.collection();
        winnersCollection.set(winners);
        resolve(winnersCollection);
      }).catch(function(err) {
        reject(err);
      });
    }).catch(function(err) {
      reject(err);
    });
  });
}

var hasDraw = function(potentialWinners) {
  if(potentialWinners.length > 3) {
    return true;
  }
  var busyPlaces = {};
  var draw = false;
  potentialWinners.forEach(function(potentialWinner) {
    if(busyPlaces[potentialWinner.get('place')]) {
      draw = true;
    }
    busyPlaces[potentialWinner.get('place')] = true;
  });
  return draw;
}

exports.finishContest = function(contest) {
  return Bookshelf.transaction(function(transaction) {
    if(contest.get('progress') !== 'running') {
      throw messages.apiError('contest.notReadyToFinish', 'The contest is not ready to finish');
    }
    if(new Date() < contest.get('end_date')) {
      throw messages.apiError('contest.notReadyToFinish', 'The contest is not ready to finish');
    }
    return getPotentialWinners(contest).then(function(potentialWinners) {
      if(hasDraw(potentialWinners)) {
        contest.set('end_date', moment(contest.get('end_date')).add(constants.HOURS_TO_ADD_WHEN_CONTEST_DRAW, 'hours').toDate());
        contest.set('draw', 1);
        return contest.save({end_date: contest.get('end_date'), draw: contest.get('draw')}, {patch: true, transacting: transaction}).then(function(contest) {
          return true;
        });
      } else {
        contest.set('progress', 'finished');
        contest.set('draw', 0);
        return contest.save({progress: contest.get('progress'), draw: contest.get('draw')}, {patch: true, transacting: transaction}).then(function(contest) {
          return chooseWinners(contest, transaction).then(function(winners) {
            return false;
          });
        });
      }
    }).then(function(draw) {
      if(draw === true) {
        mailService.contestDraw(contest).catch(function(err) {
          logger.error('Error sending "contest draw" email: ' + err.message);
        });
      } else {
        mailService.contestFinish(contest).catch(function(err) {
          logger.error('Error sending "contest finish" email: ' + err.message);
        });
      }
      return;
    });
  });
}

exports.startContest = function(contest) {
  return new Promise(function(resolve, reject) {
    if(contest.get('progress') === 'waiting') {
      $.totalAuditions(contest).then(function(totalAuditions) {
        var start = contest.get('start_date');
        var end = contest.get('end_date');
        var now = new Date();
        if(totalAuditions >= contest.get('minimum_contestants')) {
          if(start && end && now >= start) {
            contest.set('progress', 'running');
            contest.save({progress: contest.get('progress')}, {patch: true}).then(function(contestSaved) {
              resolve(contest);
              mailService.contestStart(contest).catch(function(err) {
                logger.error('Error sending "contest start" email: ' + err.message);
              });
            }).catch(function(err) {
              reject(messages.unexpectedError('Error starting the contest', err));
            });
          } else if(!start || now >= start) {
            var momentToStart = moment(now);
            var foundTimeToStart = constants.TIMES_TO_START_THE_CONTEST.some(function(hourToStart) {
              if(momentToStart.hour() < hourToStart) {
                momentToStart.hour(hourToStart);
                return true;
              } else {
                return false;
              }
            });
            if(foundTimeToStart === false) {
              momentToStart.add(1, 'days').hour(constants.TIMES_TO_START_THE_CONTEST[0]);
            }
            start = momentToStart.toDate();
            contest.set('start_date', moment(start).minutes(0).second(0).toDate());
            contest.set('end_date', moment(contest.get('start_date')).add(contest.get('duration'), 'days').hours(constants.TIME_TO_FINISH_THE_CONTEST).minutes(0).second(0).toDate());
            contest.save({start_date: contest.get('start_date'), end_date: contest.get('end_date')}, {patch: true}).then(function(contest) {
              resolve(contest);
            }).catch(function(err) {
              reject(messages.unexpectedError('Error starting the contest', err));
            });
          }
        } else {
          reject(messages.apiError('contest.notReady', 'The contest is not ready to start'));
        }
      }).catch(function(err) {
        reject(messages.unexpectedError('Error starting the contest', err));
      });
    } else if(contest.get('progress') === 'running') {
      reject(messages.apiError('contest.alreadyStarted', 'The contest was already started'));
    } else {
      reject(messages.apiError('contest.alreadyFinished', 'The contest was already finished'));
    }
  });
}

exports.submitAudition = function(user, contest, auditionData) {
  return new Promise(function(resolve, reject) {
    if(user.get('verified') === 0) {
      reject(messages.apiError('contest.join.userNotVerified', 'The user can not submit his audidion because he is not verified'));
      return;
    }
    Contest.forge({id: contest.id}).fetch().then(function(contestFetched) {
      if(contestFetched.get('progress') === 'finished') {
        reject(messages.apiError('contest.join.alreadyFinished', 'The contest was already finished'));
        return;
      }
      youtube.getVideoInfos(auditionData.url).then(function(videoInfos) {
        if(videoInfos.channelId !== user.get('youtube_account')) {
          reject(messages.apiError('contest.join.videoNotOwnedByUser', 'This video URL is not owned by the user'));
          return;
        }
        if(videoInfos.date < contestFetched.get('acceptance_date') || (contestFetched.get('end_date') && videoInfos.date > contestFetched.get('end_date'))) {
           reject(messages.apiError('contest.join.videoDateIsNotValid', 'The date of this video can not be older than acceptance date or younger than the contest end'));
          return;
        }
        var audition = Audition.forge(auditionData);
        audition.set('approved', 0);
        audition.set('contest_id', contestFetched.id);
        audition.set('user_id', user.id);
        audition.set('url', videoInfos.url);
        audition.set('embed_url', videoInfos.embedUrl);
        audition.set('video_id', videoInfos.id);
        audition.set('small_thumbnail', videoInfos.thumbnails.small);
        audition.set('medium_thumbnail', videoInfos.thumbnails.medium);
        audition.set('large_thumbnail', videoInfos.thumbnails.large);
        audition.set('slug', slug.slugify(audition.get('title')) + '-' + slug.slugify(user.get('name')));
        audition.save().then(function(auditionSaved) {
          resolve(auditionSaved);
          mailService.auditionSubmit(user, contestFetched, auditionSaved).catch(function(err) {
            logger.error('Error sending "audition submit" email to user %d: ' + err.message, user.id);
          });
        }).catch(function(err) {
          if(err.code === 'ER_DUP_ENTRY') {
            reject(messages.apiError('contest.join.userAlreadyInContest', 'The user is already in contest', err));
          } else {
            reject(messages.unexpectedError('Error submitting audition', err));
          }
        });
      }).catch(function(err) {
        reject(messages.unexpectedError('Error submitting audition', err));
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error submitting audition', err));
    });
  });
}

exports.approveAudition = function(audition) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      return $.getAudition(audition.id).bind({}).then(function(audition) {
        this.audition = audition;
        audition.set('approved', 1);
        return audition.save({approved: audition.get('approved')}, {patch: true, transacting: transaction});
      }).then(function(audition) {
        return audition.related('user').save({contestant: 1}, {patch: true, transacting: transaction})
      }).then(function(contest) {
        return this.audition;
      });
    }).then(function(audition) {
      resolve(audition);
      // When an audition is approved, an email is sent to audition's owner
      mailService.auditionApproved(audition).catch(function(err) {
        logger.error('Error sending "audition approved" email to audition %d owner: ' + err.message, audition.id);
      });
      // When an audition is approved, we try to start the contest
      $.getContestFromAudition(audition).then(function(contest) {
        return $.startContest(contest);
      }).catch(function(err) {
        // Ignore
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error approving audition', err));
    });
  });
}

exports.disapproveAudition = function(audition, reason) {
  return new Promise(function(resolve, reject) {
    if(!reason || reason.trim().length === 0) {
      reject(reject(messages.apiError('audition.disapprove.reasonMustBeProvided', 'The reason must be provided', err)));
      return;
    }
    $.loadAudition(audition).bind({}).then(function(audition) {
      this.user = audition.related('user').clone();
      this.contest = audition.related('contest').clone();
      return audition.destroy();
    }).then(function() {
      mailService.auditionDisapproved(this.user, this.contest, reason).catch(function(err) {
        logger.error('Error sending "audition disapproved" email to user %d: ' + err.message, this.user.id);
      });
      resolve();
    }).catch(function(err) {
      reject(messages.unexpectedError('Error disapproving audition', err));
    });
  });
}

exports.getWinnerAuditions = function(obj) {
  if(entities.isCollection(obj)) {
    return new Promise(function(resolve, reject) {
      Bookshelf.knex('audition')
      .whereIn('contest_id', entities.getIds(obj))
      .where('place', '<=', '3')
      .orderBy('place', 'asc')
      .then(function(rows) {
        var winnerAuditions = {};
        var allAuditions = Audition.collection();
        rows.forEach(function(row) {
          if(!winnerAuditions[row.contest_id]) {
            winnerAuditions[row.contest_id] = Audition.collection();
          }
          var audition = Audition.forge(row);
          winnerAuditions[row.contest_id].add(audition);
          allAuditions.add(audition);
        });
        return allAuditions.load(auditionRelated.withRelated).then(function() {
          resolve(winnerAuditions);
        });
      }).catch(function(err) {
        reject(err);
      });
    });
  } else {
    return Audition.collection().query(function(qb) {
      qb.where('contest_id', obj.id);
      qb.where('place', '<=', '3');
      qb.orderBy('place', 'asc');
    }).fetch(auditionRelated);
  }
}

exports.getAudition = function(id, related) {
  return Audition.forge({id: id}).fetch(related ? {withRelated: related} : auditionWithContestAndUserRelated);
}

exports.loadAudition = function(audition, related) {
  return audition.fetch(related ? {withRelated: related} : auditionWithContestAndUserRelated);
}

exports.getUserAudition = function(user, contest) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve();
    } else {
      resolve(Audition.forge({user_id: user.id, contest_id: contest.id}).fetch(auditionRelated));
    }
  });
}

exports.getUserAuditions = function(user) {
  return Audition.collection().query(function(qb) {
    qb.where('user_id', user.id);
    qb.where('approved', 1);
    qb.orderBy('registration_date', 'desc');
  }).fetch(auditionWithContestAndUserRelated);
}

exports.listAuditionsToReview = function() {
  return Audition.collection().query(function(qb) {
    qb.join('contest', 'audition.contest_id', 'contest.id');
    qb.where('approved', 0);
    qb.where('contest.progress', '!=', 'finished');
  }).fetch(auditionWithContestRelated);
}

var listAuditions = function(rankType, contest, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Audition.collection().query(function(qb) {
    qb.where('contest_id', contest.id);
    qb.where('approved', 1);
    if(page && pageSize) {
      qb.offset((page - 1) * pageSize);
      qb.limit(pageSize);
    }
    if(rankType === 'latest') {
      qb.orderBy('registration_date', 'desc');
    } else {
      qb.leftJoin('user_vote', 'audition.id', '=', 'user_vote.audition_id');
      qb.groupBy('audition.id');
      qb.orderBy(Bookshelf.knex.raw('sum(user_vote.voting_power)'), 'desc');
    }
  }).fetch(auditionRelated);
}

exports.latestAuditions = function(contest, page, pageSize) {
  return listAuditions('latest', contest, page, pageSize);
}

exports.bestAuditions = function(contest, page, pageSize) {
  return listAuditions('best', contest, page, pageSize);
}

exports.randomAuditions = function(contest, size) {
  return $.latestAuditions(contest).then(function(auditions) {
    if(size > auditions.length) {
      size = auditions.length;
    }
    var randomAuditions = Audition.collection();
    _.range(size).forEach(function() {
      randomAuditions.add(auditions.at(_.random(auditions.length - 1)));
    });
    return randomAuditions;
  });
}

exports.totalAuditions = function(obj) {
  return new Promise(function(resolve, reject) {
    if(entities.isCollection(obj)) {
      var qb = Bookshelf.knex('audition')
      .select('contest_id')
      .count('id as total_auditions')
      .whereIn('contest_id', entities.getIds(obj))
      .where('approved', 1)
      .groupBy('contest_id')
      .then(function(rows) {
        var totalAuditions = {};
        rows.forEach(function(row) {
          totalAuditions[row.contest_id] = row.total_auditions;
        });
        resolve(totalAuditions);
      }).catch(function(err) {
        reject(err);
      });
    } else {
      var qb = Bookshelf.knex('audition')
      .count('id as total_auditions')
      .where('contest_id', obj.id)
      .where('approved', 1)
      .then(function(rows) {
        resolve(rows[0].total_auditions);
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}

exports.getScoreByAudition = function(auditions) {
  return new Promise(function(resolve, reject) {
    if(auditions.isEmpty()) {
      resolve({});
    } else {
      Bookshelf.knex('user_vote')
      .select(Bookshelf.knex.raw('audition_id, sum(voting_power) as score'))
      .whereIn('audition_id', entities.getIds(auditions))
      .groupBy('audition_id')
      .then(function(scoreCounts) {
        var scoreByAudition = {};
        scoreCounts.forEach(function(scoreCount) {
          scoreByAudition[scoreCount.audition_id] = scoreCount.score;
        });
        resolve(scoreByAudition);
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}

exports.getVotesByAudition = function(auditions) {
  return new Promise(function(resolve, reject) {
    if(auditions.isEmpty()) {
      resolve({});
    } else {
      Bookshelf.knex('user_vote')
      .select('audition_id')
      .count('id as votes')
      .whereIn('audition_id', entities.getIds(auditions))
      .groupBy('audition_id')
      .then(function(votesCounts) {
        var votesByAudition = {};
        votesCounts.forEach(function(votesCount) {
          votesByAudition[votesCount.audition_id] = votesCount.votes;
        });
        resolve(votesByAudition);
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}

exports.getAuditionVideoInfos = function(url) {
  return youtube.getVideoInfos(url);
}

exports.getAuditionScore = function(audition) {
  var collection = Audition.collection().add(audition);
  return $.getScoreByAudition(collection).then(function(scoreByAudition) {
    return scoreByAudition[audition.id];
  });
}

exports.getAuditionVotes = function(audition) {
  var collection = Audition.collection().add(audition);
  return $.getVotesByAudition(collection).then(function(votesByAudition) {
    return votesByAudition[audition.id];
  });
}

exports.getUsersVotes = function(auditions) {
  return UserVote.collection().query(function(qb) {
    qb.whereIn('audition_id', entities.getIds(auditions));
  }).fetch(userVoteWithUserRelated);
}

exports.getUserVote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve();
    } else {
      resolve(UserVote.forge({user_id: user.id, audition_id: audition.id}).fetch());
    }
  });
}

exports.getUserVotes = function(user, contest) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve();
    } else {
      var promise = UserVote.collection().query(function(qb) {
        qb.join('audition', 'user_vote.audition_id', 'audition.id');
        qb.where('audition.contest_id', contest.id);
        qb.where('user_vote.user_id', user.id);
        qb.orderBy('user_vote.registration_date', 'asc');
      }).fetch(userVoteWithAuditionUserRelated);
      resolve(promise);
    }
  });
}

exports.countUserVotes = function(user, contest) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve(0);
    } else {
      Bookshelf.knex('user_vote')
      .count('user_vote.id as total_votes')
      .join('audition', 'user_vote.audition_id', 'audition.id')
      .where('user_vote.user_id', user.id)
      .where('audition.contest_id', contest.id)
      .then(function(countRows) {
        resolve(countRows[0].total_votes);
      }).catch(function(err) {
        reject(err);
      });
    }
  });
}

exports.totalVotes = function(contests) {
  return new Promise(function(resolve, reject) {
    var qb = Bookshelf.knex('user_vote')
    .select('contest.id')
    .count('user_vote.id as total_votes')
    .join('audition', 'user_vote.audition_id', 'audition.id')
    .join('contest', 'audition.contest_id', 'contest.id')
    .whereIn('contest.id', entities.getIds(contests))
    .groupBy('contest.id')
    .then(function(rows) {
      var totalVotes = {};
      rows.forEach(function(row) {
        totalVotes[row.id] = row.total_votes;
      });
      resolve(totalVotes);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.vote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    if(user.get('verified') === 0) {
      reject(messages.apiError('audition.vote.userNotVerified', 'The user can not vote because he is not verified'));
      return;
    }
    audition.fetch(auditionWithContestAndUserRelated).then(function(auditionFetched) {
      var contest = auditionFetched.related('contest');
      $.countUserVotes(user, contest).then(function(totalAuditionsVotes) {
        if(totalAuditionsVotes >= constants.VOTE_LIMIT) {
          reject(messages.apiError('audition.vote.reachVoteLimit', 'The user reached the vote limit of ' + constants.VOTE_LIMIT));
          return;
        }
        if(contest.get('progress') === 'finished') {
          reject(messages.apiError('audition.vote.contestWasFinished', 'The user can not vote anymore because the contest was finished'));
          return;
        }
        if(user.id === auditionFetched.related('user').id) {
          reject(messages.apiError('audition.vote.canNotVoteForYourself', 'The user can not vote for yourself'));
          return;
        }
        if(auditionFetched.get('approved') === 0) {
          reject(messages.apiError('audition.vote.auditionNotApproved', 'The user can not vote in audition not approved'));
          return;
        }
        var userVote = UserVote.forge({user_id: user.id, audition_id: auditionFetched.id, voting_power: user.get('voting_power')});
        userVote.save().then(function(userVote) {
          resolve(userVote);
        }).catch(function(err) {
          if(err.code === 'ER_DUP_ENTRY') {
            reject(messages.apiError('audition.vote.userAlreadyVoted', 'The user already voted in audition', err));
          } else {
            reject(messages.unexpectedError('Error voting in audition', err));
          }
        });
      }).catch(function(err) {
        reject(messages.unexpectedError('Error voting in audition', err));
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error voting in audition', err));
    });
  });
}

exports.removeVote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    UserVote.forge({user_id: user.id, audition_id: audition.id}).fetch(userVoteWithAuditionAndContestRelated).then(function(userVote) {
      if(!userVote) {
        reject(messages.apiError('audition.vote.userHasNotVoted', 'The user has not voted'));
        return;
      }
      if(userVote.related('audition').related('contest').get('progress') === 'finished') {
        reject(messages.apiError('audition.vote.contestWasFinished', 'The user can not vote anymore because the contest was finished'));
        return;
      }
      var userVoteCloned = userVote.clone();
      userVote.destroy().then(function() {
        resolve(userVoteCloned);
      }).catch(function(err) {
        reject(messages.unexpectedError('Error removing vote in audition', err));
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error removing vote in audition', err));
    });
  });
}

exports.comment = function(user, audition, message) {
  return new Promise(function(resolve, reject) {
    if(user.get('verified') === 0) {
      reject(messages.apiError('audition.comment.userNotVerified', 'The user can not comment because he is not verified'));
      return;
    }
    $.loadAudition(audition, []).then(function(audition) {
      if(audition.get('approved') === 0) {
        reject(messages.apiError('audition.comment.auditionNotApproved', 'The user can not comment in audition not approved'));
        return;
      }
      var comment = UserComment.forge({user_id: user.id, audition_id: audition.id, message: message});
      return comment.save().then(function(comment) {
        return $.getComment(comment.id);
      }).then(function(comment) {
        resolve(comment);
        mailService.auditionComment(user, comment).catch(function(err) {
          logger.error('Error sending "audition comment" email: ' + err.message);
        });
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error commenting in audition', err));
    });
  });
}

exports.replyComment = function(user, commentId, message) {
  return new Promise(function(resolve, reject) {
    $.getComment(commentId).then(function(comment) {
      var reply = UserComment.forge({user_id: user.id, audition_id: comment.related('audition').id, comment_id: comment.id, message: message});
      return reply.save().then(function(reply) {
        return $.getComment(reply.id);
      }).then(function(reply) {
        resolve(reply);
        mailService.auditionReplyComment(user, reply).catch(function(err) {
          logger.error('Error sending "audition reply comment" email: ' + err.message);
        });
      });
    }).catch(function(err) {
      reject(messages.unexpectedError('Error replying comment in audition', err));
    });
  });
};

exports.listComments = function(audition) {
  return UserComment.collection().query(function(qb) {
    qb.where('audition_id', audition.id);
    qb.whereNull('comment_id');
    qb.orderBy('registration_date', 'desc');
  }).fetch(userCommentWithRepliesRelated);
};

exports.getComment = function(id, related) {
  return UserComment.forge({id: id}).fetch(related ? {withRelated: related} : userCommentWithAuditionAndRepliesRelated);
};

exports.removeComment = function(user, id) {
  return $.getComment(id).then(function(comment) {
    if(!user || (user.id !== comment.get('user_id') && user.id !== comment.related('audition').get('user_id'))) {
      throw messages.apiError('audition.comment.noPermissionToRemove', 'The comment can not be remove becaus user has no permission');
    }
    var commentClone = comment.clone();
    return comment.destroy().then(function() {
      return commentClone;
    });
  });
};

exports.isContestant = function(user, contest) {
  return new Promise(function(resolve, reject) {
    if(user) {
      Bookshelf.knex('audition')
      .count('audition.id as total_auditions')
      .join('contest', 'audition.contest_id', 'contest.id')
      .where('audition.user_id', user.id)
      .where('audition.contest_id', contest.id)
      .then(function(rows) {
        resolve(rows[0].total_auditions > 0 ? true : false);
      }).catch(function(err) {
        reject(err);
      });
    } else {
      resolve(false);
    }
  });
}

exports.listContestants = function(contest) {
  return $.latestAuditions(contest).then(function(auditions) {
    var users = User.collection();
    auditions.forEach(function(audition) {
      users.add(audition.related('user'));
    });
    return users;
  });
}

exports.listNonContestants = function(contest) {
  return $.listContestants(contest).bind({}).then(function(contestants) {
    this.contestants = contestants;
    return User.fetchAll();
  }).then(function(users) {
    var nonContestants = User.collection();
    var contestantsArray = this.contestants.toArray();
    users.forEach(function(user) {
      var contains = _.some(contestantsArray, function(contestant) {
        return contestant.id === user.id;
      });
      if(!contains) {
        nonContestants.add(user);
      }
    });
    return nonContestants;  
  });
}

exports.getSponsorsOfUnfinishedContests = function() {
  return Sponsor.collection().query(function(qb) {
    qb.join('sponsor_contest', 'sponsor_contest.sponsor_id', 'sponsor.id');
    qb.join('contest', 'sponsor_contest.contest_id', 'contest.id');
    qb.where('contest.progress', '!=', 'finished');
  }).fetch();
}

exports.updateContest = function(user, contest) {
  return new Promise(function(resolve, reject) {
    if(user.get('permission') !== 'admin') {
      reject(messages.apiError('contest.edit.noPermission', 'The contest informations cannot be edited because user has no permission'));
      return;
    }
    if(contest.get('name')) {
      contest.set('slug', slug.slugify(contest.get('name')));
    }
    resolve(contest.save());
  });
}

exports.latestContestants = function(page, pageSize) {
  return User.collection().query(function(qb) {
    qb.where('contestant', 1);
    qb.orderBy('registration_date', 'desc');
    if(page && pageSize) {
      qb.offset((page - 1) * pageSize);
      qb.limit(pageSize);
    }
  }).fetch();
}