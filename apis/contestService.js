var Contest     = require('../models/models').Contest,
    Audition    = require('../models/models').Audition,
    UserVote    = require('../models/models').UserVote,
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
var auditionWithContestRelated = {withRelated: ['contest', 'user']};
var contestRelated = {withRelated: ['prizes']};
var userVoteWithUserRelated = {withRelated: ['user']};
var userVoteWithAuditionAndContestRelated = {withRelated: ['audition', 'audition.contest']};
var userVoteWithAuditionUserRelated = {withRelated: ['audition', 'audition.user']};

exports.getContest = function(id) {
  return Contest.forge({id: id}).fetch(contestRelated);
}

exports.getContestFromAudition = function(audition) {
  if(audition.related('contest')) {
    return Promise.resolve(audition.related('contest'));
  } else if(audition.get('contest_id')) {
    return $.getContest(audition.get('contest_id'));
  } else {
    return $.getAudition(audition.id).then(function(auditionFetched) {
      return auditionFetched.related('contest');
    });
  }
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
    qb.where('finished', 0);
    qb.orderBy('registration_date', 'desc');
  }).fetch();
}

exports.listContestsToStart = function() {
  return Contest.collection().query(function(qb) {
    qb.leftJoin('audition', 'contest.id', 'audition.contest_id')
    .where('contest.finished', 0)
    .where(function() {
      this.andWhere(function() {
        this.whereNotNull('contest.start_date').where('contest.start_date', '<=', new Date());
      })
      .orWhere(function() {
        this.whereNull('contest.start_date');
      });
    })
    .whereNull('contest.end_date')
    .groupBy('audition.contest_id')
    .havingRaw('count(audition.contest_id) >= contest.minimum_contestants');
  }).fetch();
}

exports.listContestsToFinish = function() {
  return Contest.collection().query(function(qb) {
    qb.where('finished', 0);
    qb.whereNotNull('end_date');
    qb.where('end_date', '<', new Date());
  }).fetch();
}

var chooseWinners = function(contest, transaction) {
  return new Promise(function(resolve, reject) {
    var auditionWithScore = Bookshelf.knex.select('audition.*', Bookshelf.knex.raw('sum(user_vote.voting_power) as score')).from('audition').join('user_vote', 'audition.id', 'user_vote.audition_id').where('audition.contest_id', contest.id).groupBy('audition.id');
    var scores = Bookshelf.knex.sum('user_vote.voting_power as score').from('user_vote').join('audition', 'user_vote.audition_id', 'audition.id').join('contest', 'audition.contest_id', 'contest.id').where('contest.id', contest.id).groupBy('audition_id');
    var topScores = Bookshelf.knex.distinct('score').from(scores.as('scores')).orderBy('score', 'desc').limit(3);
    var winners = Bookshelf.knex.select('*').from(auditionWithScore.as('audition_with_score')).join(topScores.as('top_scores'), 'audition_with_score.score', 'top_scores.score').orderBy('audition_with_score.score', 'desc');
    var place = 1;
    var previousWinner = null;
    var savePromises = [];
    winners.then(function(winnersRows) {
      winnersRows.forEach(function(winner) {
        var audition = Audition.forge(winner);
        audition.unset('score');
        if(previousWinner && winner.score !== previousWinner.score) {
          place++;
        }
        savePromises.push(audition.save({place: place}, {patch: true, transacting: transaction}));
        previousWinner = winner;
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

exports.finishContest = function(contest) {
  return Bookshelf.transaction(function(transaction) {
    return contest.save({finished: 1}, {patch: true, transacting: transaction}).then(function(contest) {
      return chooseWinners(contest, transaction);
    }).then(function(winners) {
      return;
    });
  });
}

exports.startContest = function(contest) {
  return new Promise(function(resolve, reject) {
    if(contest.getProgress() === 'waiting') {
      $.totalAuditions(contest).then(function(totalAuditions) {
        var start = contest.get('start_date');
        var now = new Date();
        if(totalAuditions >= contest.get('minimum_contestants') && (!start || now > start)) {
          if(!start || now > start) {
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
          }
          contest.set('start_date', moment(start).minutes(0).second(0).toDate());
          contest.set('end_date', moment(contest.get('start_date')).add(contest.get('duration'), 'days').hours(constants.TIME_TO_FINISH_THE_CONTEST).minutes(0).second(0).toDate());
          contest.save({start_date: contest.get('start_date'), end_date: contest.get('end_date')}, {patch: true}).then(function(contest) {
            resolve(contest);
            mailService.contestStart(contest).catch(function(err) {
              logger.error('Error sending "contest start" email: ' + err.message);
            });
          }).catch(function(err) {
            reject(messages.unexpectedError('Error starting the contest', err));
          });
        } else {
          resolve();
        }
      }).catch(function(err) {
        reject(messages.unexpectedError('Error starting the contest', err));
      });
    } else if(contest.getProgress() === 'running') {
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
      if(contestFetched.getProgress() === 'finished') {
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
    audition.set('approved', 1);
    audition.save({approved: audition.get('approved')}, {patch: true}).then(function(auditionSaved) {
      resolve(auditionSaved);
      $.getContestFromAudition(auditionSaved).then(function(contest) {
        return $.startContest(contest);
      });
      mailService.auditionApproved(auditionSaved).catch(function(err) {
        logger.error('Error sending "audition approved" email to audition %d owner: ' + err.message, auditionSaved.id);
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
    $.getAudition(audition.id).then(function(auditionLoaded) {
      this.user = auditionLoaded.related('user').clone();
      this.contest = auditionLoaded.related('contest').clone();
      return auditionLoaded.destroy();
    }).then(function() {
      mailService.auditionDisapproved(this.user, this.contest, reason).catch(function(err) {
        logger.error('Error sending "audition disapproved" email to user %d: ' + err.message, this.user.id);
      });
      resolve();
    }).catch(function(err) {
      reject(messages.unexpectedError('Error disapproving audition', err));
    }).bind({});
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

exports.getAudition = function(id) {
  return Audition.forge({id: id}).fetch(auditionWithContestRelated);
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
  }).fetch(auditionWithContestRelated);
}

exports.listAuditionsToReview = function() {
  return Audition.collection().query(function(qb) {
    qb.join('contest', 'audition.contest_id', 'contest.id');
    qb.where('approved', 0);
    qb.where('contest.finished', 0);
  }).fetch();
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

exports.vote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    if(user.get('verified') === 0) {
      reject(messages.apiError('audition.vote.userNotVerified', 'The user can not vote because he is not verified'));
      return;
    }
    audition.fetch(auditionWithContestRelated).then(function(auditionFetched) {
      var contest = auditionFetched.related('contest');
      $.countUserVotes(user, contest).then(function(totalAuditionsVotes) {
        if(totalAuditionsVotes >= constants.VOTE_LIMIT) {
          reject(messages.apiError('audition.vote.reachVoteLimit', 'The user reached the vote limit of ' + constants.VOTE_LIMIT));
          return;
        }
        if(contest.getProgress() === 'finished') {
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
      if(userVote.related('audition').related('contest').getProgress() === 'finished') {
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