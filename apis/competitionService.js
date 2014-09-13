var Competition = require('../models/models').Cover,
    Audition    = require('../models/models').Audition,
    Bookshelf   = require('../models/models').Bookshelf,
    settings    = require('../configs/settings'),
    Promise     = require('bluebird'),
    _           = require('underscore'),
    $           = this;

_.str = require('underscore.string');

var listAuditions = function(rankType, competition, page, pageSize) {
  page = parseInt(page);
  pageSize = parseInt(pageSize);
  return Audition.collection().query(function(qb) {
    qb.where('competition_id', competition.id)
    .offset((page - 1) * pageSize)
    .limit(pageSize);
    if(rankType === 'latest') {
      qb.orderBy('registration_date', 'desc');
    } else {

    }
  }).fetch();
}

exports.getCompetition = function(id) {
  return Competition.forge({id: id}).fetch();
}

exports.latestAuditions = function(period, page, pageSize) {
  return listAuditions('latest', competition, page, pageSize);
}

exports.bestAuditions = function(competition, page, pageSize) {
  return listAuditions('best', competition, page, pageSize);
}

exports.totalAuditions = function(competition) {
  return new Promise(function(resolve, reject) {
    var qb = Bookshelf.knex('audition')
    .count('id as total_auditions')
    .where('competition_id', competition.id)
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