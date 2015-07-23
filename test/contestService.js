var contestService  = require('../apis/contestService'),
    messages        = require('../apis/internal/messages'),
    logger          = require('../configs/logger'),
    models          = require('../models'),
    datasets        = require('./datasets'),
    contestFixtures = require('./datasets/contestService'),
    Promise         = require('bluebird'),
    moment          = require('moment'),
    nock            = require('nock'),
    assert          = require('chai').assert,
    Bookshelf       = models.Bookshelf;

var postmanUrl = 'http://localhost:5000';

describe('contestService', function() {
  beforeEach(function() {
    return datasets.clean();
  });

  describe.only('#finishContest', function() {
    it('should finish the contest and select the winners according to valid votes', function() {
      return datasets.load([contestFixtures.severalUsers, contestFixtures.finishContestState]).then(function() {
        var contest = models.Contest.forge({id: 1});
        return contestService.finishContest(contest);
      }).then(function(contest) {
        assert.strictEqual(contest.get('progress'), 'finished');
        assert.strictEqual(contest.get('draw'), 0);
        return models.Contest.forge({id: contest.id}).fetch();
      }).then(function(contest) {
        assert.strictEqual(contest.get('progress'), 'finished');
        assert.strictEqual(contest.get('draw'), 0);
        return models.Audition.collection().fetch();
      }).then(function(auditions) {
        assert.strictEqual(auditions.at(0).id, 1);
        assert.strictEqual(auditions.at(0).get('place'), 1);
        assert.strictEqual(auditions.at(1).id, 2);
        assert.strictEqual(auditions.at(1).get('place'), 3);
        assert.strictEqual(auditions.at(2).id, 3);
        assert.strictEqual(auditions.at(2).get('place'), 2);
      });
    });
  });
});