var Contest    = require('../models/models').Contest,
    Audition   = require('../models/models').Audition,
    UserVote   = require('../models/models').UserVote,
    Bookshelf  = require('../models/models').Bookshelf,
    settings   = require('../configs/settings'),
    slug       = require('../utils/slug'),
    modelUtils = require('../utils/modelUtils'),
    apiErrors  = require('./errors/apiErrors'),
    APIError   = require('./errors/apiErrors').APIError,
    youtube    = require('./third/youtube'),
    constants  = require('./constants'),
    Promise    = require('bluebird'),
    moment     = require('moment'),
    _          = require('underscore'),
    $          = this;

_.str = require('underscore.string');

var auditionRelated = {withRelated: ['user']};
var auditionWithContestRelated = {withRelated: ['contest', 'user']};
var userVoteWithAuditionAndContestRelated = {withRelated: ['audition', 'audition.contest']};

exports.getContest = function(id) {
  return Contest.forge({id: id}).fetch();
}

exports.listUnfinishedContests = function() {
  return Contest.collection().query(function(qb) {
    qb.where('finished', 0);
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
        resolve(winners);
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
      return {contest: contest, winners: winners};
    });
  });
}

var startContest = function(contest, transaction) {
  return new Promise(function(resolve, reject) {
    if(contest.getDetailedStatus() === 'waiting') {
      contest.set('start_date', moment().toDate());
      contest.set('end_date', moment().add(contest.get('duration') + 1, 'days').hours(0).minutes(0).seconds(0).toDate());
      contest.save({start_date: contest.get('start_date'), end_date: contest.get('end_date')}, {patch: true, transacting: transaction}).then(function(contest) {
        resolve(contest);
      }).catch(function(err) {
        reject(new APIError(400, 'contest.errorStarting', 'Error starting the contest', err));
      })
    } else {
      reject(new APIError(400, 'contest.alreadyHappening', 'The contest is already happening'));
    }
  });
}

var createAudition = function(user, auditionData, transaction) {
  return new Promise(function(resolve, reject) {
    youtube.getVideoInfos(auditionData.url).then(function(videoInfos) {
      if(videoInfos.channelId === user.get('youtube_account')) {
        var audition = Audition.forge(auditionData);
        audition.set('user_id', user.id);
        audition.set('url', videoInfos.url);
        audition.set('embed_url', videoInfos.embedUrl);
        audition.set('video_id', videoInfos.id);
        audition.set('small_thumbnail', videoInfos.thumbnails.small);
        audition.set('medium_thumbnail', videoInfos.thumbnails.medium);
        audition.set('large_thumbnail', videoInfos.thumbnails.large);
        audition.set('slug', slug.slugify(audition.get('title')) + '-' + slug.slugify(user.get('name')));
        audition.save(null, {transacting: transaction}).then(function(audition) {
          resolve(audition);
        }).catch(function(err) {
          if(err.code === 'ER_DUP_ENTRY') {
            reject(new APIError(400, 'contest.join.userAlreadyInContest', 'The user is already in contest', err));
          } else {
            reject(apiErrors.unexpectedError('Error adding audition in contest', err));
          }
        });
      } else {
        reject(new APIError(400, 'contest.join.videoNotOwnedByUser', 'This video URL is not owned by the user'));
      }
    }).catch(function(err) {
      reject(new APIError(400, 'contest.join.errorGettingVideoInfos', 'Error getting video information', err));
    });
  });
}

exports.joinContest = function(user, auditionData) {
  return new Promise(function(resolve, reject) {
    Bookshelf.transaction(function(transaction) {
      var result = {};
      return createAudition(user, auditionData, transaction).then(function(audition) {
        return audition.load(['contest']);
      }).then(function(audition) {
        var contest = audition.related('contest');
        result.audition = audition;
        if($.totalAuditions(audition) < parseInt(contest.get('minimum_contestants'))) {
          return startContest(contest, transaction);
        } else {
          return null;
        }
      }).then(function(contest) {
        return result.audition;
      });
    }).then(function(audition) {
      resolve(audition);
    }).catch(function(err) {
      reject(err);
    });
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
      qb.orderBy(Bookshelf.knex.raw('sum(user_vote.voting_power) desc'));
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

exports.getUserVotes = function(audition) {
  var collection = Audition.collection().add(audition);
  return $.getVotesByAudition(collection).then(function(votesByAudition) {
    return votesByAudition[audition.id];
  });
}

exports.getUserVote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve();
    } else {
      UserVote.forge({user_id: user.id, audition_id: audition.id}).fetch().then(function(userVote) {
        resolve(userVote);
      }).catch(function(err) {
        reject(apiErrors.unexpectedError('Error getting user vote', err));
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
                  reject(new APIError(400, 'audition.vote.userAlreadyVoted', 'The user already voted in audition', err));
                } else {
                  reject(apiErrors.unexpectedError('Error voting in audition', err));
                }
              });
            } else {
              reject(new APIError(400, 'audition.vote.canNotVoteForYourself', 'The user can not vote for yourself', err));
            }
          } else {
            reject(new APIError(400, 'audition.vote.contestWasFinished', 'The user can not vote anymore because the contest was finished'));
          }
        } else {
          reject(new APIError(400, 'audition.vote.reachVoteLimit', 'The user reached the vote limit of ' + constants.VOTE_LIMIT));
        }
      }).catch(function(err) {
        reject(apiErrors.unexpectedError('Error voting in audition', err));
      });
    }).catch(function(err) {
      reject(apiErrors.unexpectedError('Error voting in audition', err));
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
            reject(apiErrors.unexpectedError('Error removing vote in audition', err));
          });
        } else {
          reject(new APIError(400, 'audition.vote.contestWasFinished', 'The user can not vote anymore because the contest was finished'));
        }
      } else {
        reject(new APIError(400, 'audition.vote.userHasNotVoted', 'The user has not voted'));
      }
    }).catch(function(err) {
      reject(apiErrors.unexpectedError('Error removing vote in audition', err));
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