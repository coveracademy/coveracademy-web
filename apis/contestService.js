var Contest   = require('../models/models').Contest,
    Audition  = require('../models/models').Audition,
    Bookshelf = require('../models/models').Bookshelf,
    settings  = require('../configs/settings'),
    Promise   = require('bluebird'),
    _         = require('underscore'),
    $         = this;

_.str = require('underscore.string');

var auditionsRelated = {withRelated: ['user', 'music', 'artist']};
var auditionsWithContestRelated = {withRelated: ['contest', 'user', 'music', 'artist']};

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

exports.votesByAudition = function(auditions) {
  return new Promise(function(resolve, reject) {
    resolve({});
  });
}