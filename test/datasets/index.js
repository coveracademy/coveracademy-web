var knex           = require('../../models').Bookshelf.knex,
    settings       = require('../../configs/settings'),
    PromiseWrapper = require('../../utils/promise').PromiseWrapper,
    tables         = require('./tables'),
    Promise        = require('bluebird'),
    _              = require('underscore');

exports.clean = function() {
  return new Promise(function(resolve, reject) {
    var wrappers = [];
    tables.forEach(function(table) {
      wrappers.push(new PromiseWrapper(knex(table).del()));
      wrappers.push(new PromiseWrapper(knex.schema.raw('alter table ' + table + ' auto_increment = 1')));
    });
    Promise.resolve(wrappers).each(function(wrapper) {
      return wrapper.value();
    }).then(function(results) {
      resolve();
    });
  });
};

exports.load = function(fixtures) {
  return new Promise(function(resolve, reject) {
    var wrappers = [];
    if(_.isArray(fixtures)) {
      fixtures.forEach(function(fixture) {
        for(var key in fixture) {
          wrappers.push(new PromiseWrapper(knex(key).insert(fixture[key])));
        }
      });
    } else {
      for(var key in fixtures) {
        wrappers.push(new PromiseWrapper(knex(key).insert(fixtures[key])));
      }
    }
    Promise.resolve(wrappers).each(function(wrapper) {
      return wrapper.value();
    }).then(function(a) {
      resolve();
    }).catch(function(err){
      reject(err);
    });
  });
};