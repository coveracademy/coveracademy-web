var Contest    = require('../models/models').Contest,
    Audition   = require('../models/models').Audition,
    Bookshelf  = require('../models/models').Bookshelf,
    settings   = require('../configs/settings'),
    slug       = require('../utils/slug'),
    modelUtils = require('../utils/modelUtils'),
    apiErrors  = require('./errors/apiErrors'),
    APIError   = require('./errors/apiErrors').APIError,
    youtube    = require('./third/youtube'),
    Promise    = require('bluebird'),
    _          = require('underscore'),
    $          = this;

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

exports.joinContest = function(user, auditionData) {
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
        audition.set('slug', slug.slugify(audition.get('video_title')) + '-' + slug.slugify(user.get('name')));
        audition.save().then(function(audition) {
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
      reject(new APIError(400, 'contest.join.errorGettingVideoInfos'));
    });
  });
}

exports.getAudition = function(id) {
  return Audition.forge({id: id}).fetch(auditionsWithContestRelated);
}

exports.latestAuditions = function(period, page, pageSize) {
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
      resolve(rows[0].total_auditions);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.getVotesByAudition = function(auditions) {
  return new Promise(function(resolve, reject) {
    Bookshelf.knex('audition_user_vote')
    .select(Bookshelf.knex.raw('audition_id, count(*) as votes'))
    .whereIn('audition_id', modelUtils.getIds(auditions))
    .groupBy('audition_id')
    .then(function(usersVotesCounts) {
      var votesByAudition = {};
      usersVotesCounts.forEach(function(usersVotesCount) {
        votesByAudition[usersVotesCount.audition_id] = usersVotesCount.votes;
      });
      resolve(votesByAudition);
    }).catch(function(err) {
      reject(err);
    });
  });
}

exports.getAuditionVideoInfos = function(url) {
  return youtube.getVideoInfos(url);
}

exports.getAuditionVotes = function(audition) {
  return $.getVotesByAudition([audition]).then(function(votesByAudition) {
    return votesByAudition[audition.id];
  });
}