var Contest     = require('../models/models').Contest,
    Audition    = require('../models/models').Audition,
    UserVote    = require('../models/models').UserVote,
    User        = require('../models/models').User,
    Bookshelf   = require('../models/models').Bookshelf,
    settings    = require('../configs/settings'),
    slug        = require('../utils/slug'),
    modelUtils  = require('../utils/modelUtils'),
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
var userVoteWithUserRelated = {withRelated: ['user']};
var userVoteWithAuditionAndContestRelated = {withRelated: ['audition', 'audition.contest']};

exports.getContest = function(id) {
  return Contest.forge({id: id}).fetch();
}

exports.listContestsToStart = function() {
  return Contest.collection().query(function(qb) {
    qb.leftJoin('audition', 'contest.id', 'audition.contest_id')
    .where('contest.finished', 0)
    .whereNotNull('contest.start_date')
    .where('contest.start_date', '<=', new Date())
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

var incrementVotingPowers = function(auditions, transaction) {
  return $.getUsersVotes(auditions).then(function(usersVotes) {
    var usersWithVotingPowerIncremented = [];
    var usersPromises = [];
    var usersVotesSortedByAuditionPlace = usersVotes.sortBy(function(userVote) {
      return auditions.get(userVote.get('audition_id')).get('place');
    });
    usersVotes.reset();
    usersVotes.set(usersVotesSortedByAuditionPlace);
    usersVotes.forEach(function(userVote) {
      var audition = auditions.get(userVote.get('audition_id'));
      var user = userVote.related('user');
      if(!_.contains(usersWithVotingPowerIncremented, user.id)) {
        var increment = 0;
        if(audition.get('place') === 1) {
          increment = constants.POWER_VOTING_INCREMENT_FOR_THE_GOLD_MEDAL_VOTER;
        } else if(audition.get('place') === 2) {
          increment = constants.POWER_VOTING_INCREMENT_FOR_THE_SILVER_MEDAL_VOTER;
        } else if(audition.get('place') === 3) {
          increment = constants.POWER_VOTING_INCREMENT_FOR_THE_BRONZE_MEDAL_VOTER;
        }
        user.set('voting_power', user.get('voting_power') + increment);
        usersWithVotingPowerIncremented.push(user.id);
        usersPromises.push(user.save({voting_power: user.get('voting_power')}, {patch: true, transacting: transaction}));
      }
    });
    return Promise.all(usersPromises);
  });
}

exports.finishContest = function(contest) {
  return Bookshelf.transaction(function(transaction) {
    return contest.save({finished: 1}, {patch: true, transacting: transaction}).then(function(contest) {
      return chooseWinners(contest, transaction);
    }).then(function(winners) {
      return incrementVotingPowers(winners);
    }).then(function(voters) {
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
            start = now;
          }
          contest.set('start_date', start);
          contest.set('end_date', moment(start).add(contest.get('duration') + 1, 'days').hours(0).minutes(0).seconds(0).toDate());
          contest.save({start_date: contest.get('start_date'), end_date: contest.get('end_date')}, {patch: true}).then(function(contest) {
            resolve(contest);
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

var createAudition = function(user, contest, auditionData) {
  return new Promise(function(resolve, reject) {
    youtube.getVideoInfos(auditionData.url).then(function(videoInfos) {
      if(videoInfos.channelId === user.get('youtube_account')) {
        if(videoInfos.date > contest.get('registration_date') && (_.isUndefined(contest.get('end_date')) || _.isNull(contest.get('end_date')) || videoInfos.date < contest.get('end_date'))) {
          var audition = Audition.forge(auditionData);
          audition.set('contest_id', contest.id);
          audition.set('user_id', user.id);
          audition.set('url', videoInfos.url);
          audition.set('embed_url', videoInfos.embedUrl);
          audition.set('video_id', videoInfos.id);
          audition.set('small_thumbnail', videoInfos.thumbnails.small);
          audition.set('medium_thumbnail', videoInfos.thumbnails.medium);
          audition.set('large_thumbnail', videoInfos.thumbnails.large);
          audition.set('slug', slug.slugify(audition.get('title')) + '-' + slug.slugify(user.get('name')));
          audition.save().then(function(audition) {
            resolve(audition);
          }).catch(function(err) {
            if(err.code === 'ER_DUP_ENTRY') {
              reject(messages.apiError('contest.join.userAlreadyInContest', 'The user is already in contest', err));
            } else {
              reject(messages.unexpectedError('Error adding audition in contest', err));
            }
          });
        } else {
          reject(messages.apiError('contest.join.videoDateIsNotValid', 'The date of this video can not be older or younger than the contest'));
        }
      } else {
        reject(messages.apiError('contest.join.videoNotOwnedByUser', 'This video URL is not owned by the user'));
      }
    }).catch(function(err) {
      reject(messages.apiError('contest.join.errorGettingVideoInfos', 'Error getting video information', err));
    });
  });
}

exports.joinContest = function(user, auditionData) {
  return new Promise(function(resolve, reject) {
    Contest.forge({id: auditionData.contest_id}).fetch().then(function(contest) {
      this.contest = contest;
      if(contest.getProgress() === 'finished') {
        throw messages.apiError('contest.join.alreadyFinished', 'The contest was already finished');
      } else {
        return createAudition(user, contest, auditionData);
      }
    }).then(function(audition) {
      this.audition = audition;
      $.startContest(this.contest).then(function(contest) {
        return contest;
      }).catch(function(err) {
        return;
      });
    }).then(function(contest) {
      resolve({audition: this.audition, contest: this.contest});
    }).catch(function(err) {
      reject(err);
    }).bind({});
  });
}

exports.getWinnerAuditions = function(contest) {
  return Audition.collection().query(function(qb) {
    qb.where('contest_id', contest.id);
    qb.where('place', '<=', '3');
    qb.orderBy('place', 'asc');
  }).fetch(auditionRelated);
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
    qb.orderBy('registration_date', 'desc');
  }).fetch(auditionWithContestRelated);
}

var listAuditions = function(rankType, contest, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Audition.collection().query(function(qb) {
    qb.where('contest_id', contest.id)
    .offset((page - 1) * pageSize)
    .limit(pageSize);
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

exports.totalAuditions = function(contest) {
  return new Promise(function(resolve, reject) {
    var qb = Bookshelf.knex('audition')
    .count('id as total_auditions')
    .where('contest_id', contest.id)
    .then(function(rows) {
      resolve(parseInt(rows[0].total_auditions));
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.getScoreByAudition = function(auditions) {
  return new Promise(function(resolve, reject) {
    if(auditions.isEmpty()) {
      resolve({});
    } else {
      Bookshelf.knex('user_vote')
      .select(Bookshelf.knex.raw('audition_id, sum(voting_power) as score'))
      .whereIn('audition_id', modelUtils.getIds(auditions))
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
      .whereIn('audition_id', modelUtils.getIds(auditions))
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
    qb.whereIn('audition_id', modelUtils.getIds(auditions));
  }).fetch(userVoteWithUserRelated);
}

exports.getUserVote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve();
    } else {
      UserVote.forge({user_id: user.id, audition_id: audition.id}).fetch().then(function(userVote) {
        resolve(userVote);
      }).catch(function(err) {
        reject(messages.unexpectedError('Error getting user vote', err));
      });
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
    audition.fetch(auditionWithContestRelated).then(function(auditionFetched) {
      var contest = auditionFetched.related('contest');
      $.countUserVotes(user, contest).then(function(totalAuditionsVotes) {
        if(totalAuditionsVotes < constants.VOTE_LIMIT) {
          if(contest.getProgress() !== 'finished') {
            var auditionOwner = auditionFetched.related('user');
            if(user.id !== auditionOwner.id) {
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
            } else {
              reject(messages.apiError('audition.vote.canNotVoteForYourself', 'The user can not vote for yourself', err));
            }
          } else {
            reject(messages.apiError('audition.vote.contestWasFinished', 'The user can not vote anymore because the contest was finished'));
          }
        } else {
          reject(messages.apiError('audition.vote.reachVoteLimit', 'The user reached the vote limit of ' + constants.VOTE_LIMIT));
        }
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
      if(userVote) {
        var contest = userVote.related('audition').related('contest');
        if(contest.getProgress() !== 'finished') {
          var userVoteClone = userVote.clone();
          userVote.destroy().then(function() {
            resolve(userVoteClone);
          }).catch(function(err) {
            reject(messages.unexpectedError('Error removing vote in audition', err));
          });
        } else {
          reject(messages.apiError('audition.vote.contestWasFinished', 'The user can not vote anymore because the contest was finished'));
        }
      } else {
        reject(messages.apiError('audition.vote.userHasNotVoted', 'The user has not voted'));
      }
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
      .then(function(totalAuditionsResult) {
        resolve(parseInt(totalAuditionsResult[0].total_auditions) > 0 ? true : false);
      }).catch(function(err) {
        reject(err);
      });
    } else {
      resolve(false);
    }
  });
}