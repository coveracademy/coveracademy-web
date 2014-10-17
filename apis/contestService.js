var Contest      = require('../models/models').Contest,
    Audition     = require('../models/models').Audition,
    AuditionVote = require('../models/models').AuditionVote,
    Bookshelf    = require('../models/models').Bookshelf,
    settings     = require('../configs/settings'),
    slug         = require('../utils/slug'),
    modelUtils   = require('../utils/modelUtils'),
    apiErrors    = require('./errors/apiErrors'),
    APIError     = require('./errors/apiErrors').APIError,
    youtube      = require('./third/youtube'),
    Promise      = require('bluebird'),
    moment       = require('moment'),
    _            = require('underscore'),
    $            = this;

_.str = require('underscore.string');

var auditionsRelated = {withRelated: ['user']};
var auditionsWithContestRelated = {withRelated: ['contest', 'user']};

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

    }
  }).fetch(auditionsRelated);
}

exports.getContest = function(id) {
  return Contest.forge({id: id}).fetch();
}

var startContest = function(contest, transaction) {
  return new Promise(function(resolve, reject) {
    if(contest.getStatus() === 'waiting') {
      contest.set('start_date', moment().toDate());
      contest.set('end_date', moment().add(contest.get('duration') + 1, 'days').hours(0).minutes(0).seconds(0).toDate());
      contest.save({start_date: contest.get('start_date'), end_date: contest.get('end_date')}, {patch: true, transacting: transaction}).then(function(contest) {
        resolve(contest);
      }).catch(function(err) {
        reject(new APIError(400, 'contest.errorStarting', 'Error starting the contest'));
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
            reject(new APIError(400, 'contest.join.userAlreadyInContest', 'The user is already in contest'));
          } else {
            reject(apiErrors.fromDatabaseError('audition', err, 'Error adding audition in contest'));
          }
        });
      } else {
        reject(new APIError(400, 'contest.join.videoNotOwnedByUser', 'This video URL is not owned by the user'));
      }
    }).catch(function(err) {
      reject(new APIError(400, 'contest.join.errorGettingVideoInfos', 'Error getting video information'));
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

exports.getAudition = function(id) {
  return Audition.forge({id: id}).fetch(auditionsWithContestRelated);
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

exports.getVotesByAudition = function(auditions) {
  return new Promise(function(resolve, reject) {
    if(auditions.isEmpty()) {
      resolve({});
    } else {
      Bookshelf.knex('audition_vote')
      .select(Bookshelf.knex.raw('audition_id, count(*) as votes'))
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

exports.getAuditionVotes = function(audition) {
  var collection = Audition.collection().add(audition);
  return $.getVotesByAudition(collection).then(function(votesByAudition) {
    return votesByAudition[audition.id];
  });
}

exports.getAuditionVote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    if(!user) {
      resolve();
    } else {
      AuditionVote.forge({user_id: user.id, audition_id: audition.id}).fetch().then(function(auditionVote) {
        resolve(auditionVote);
      }).catch(function(err) {
        reject(new APIError(400, 'audition.vote.unknown'));
      });
    }
  });
}

exports.vote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    audition.load(['user']).then(function(audition) {
      if(user.id === audition.related('user').id) {
        var auditionVote = AuditionVote.forge({user_id: user.id, audition_id: audition.id});
        auditionVote.save().then(function(auditionVote) {
          resolve(auditionVote);
        }).catch(function(err) {
          if(err.code === 'ER_DUP_ENTRY') {
            reject(new APIError(400, 'audition.vote.userAlreadyVoted'));
          } else {
            reject(new APIError(400, 'audition.vote.unknown'));
          }
        });
      } else {
        reject(new APIError(400, 'audition.vote.canNotVoteForYourself'));
      }
    }).catch(function(err) {
      reject(new APIError(400, 'audition.vote.unknown'));
    })
  });
}

exports.removeVote = function(user, audition) {
  return new Promise(function(resolve, reject) {
    AuditionVote.forge({user_id: user.id, audition_id: audition.id}).fetch().then(function(auditionVote) {
      if(auditionVote) {
        auditionVote.destroy().then(function(auditionVote) {
          resolve();
        })
      } else {
        reject(new APIError(400, 'audition.vote.userHasNotVoted'));
      }
    }).catch(function(err) {
      reject(new APIError(400, 'audition.vote.unknown'));
    });
  });
}

exports.isContestant = function(user, contest) {
  return new Promise(function(resolve, reject) {
    if(user) {
      Bookshelf.knex('audition')
      .select(Bookshelf.knex.raw('count(*) as total_auditions'))
      .join('contest', 'audition.contest_id', 'contest.id')
      .where('user_id', user.id)
      .where('contest_id', contest.id)
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