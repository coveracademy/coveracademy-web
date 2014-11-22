var contestService = require('../apis/contestService'),
    Contest        = require('../models/models').Contest,
    later          = require('later');

var startContests = function() {
  console.log('Starting contests');
  contestService.listContestsToStart().then(function(contests) {
    contests.forEach(function(contest) {
      contestService.startContest(contest).then(function(contest) {
        console.log('Contest ' + contest.id + ' started successfully');
      }).catch(function(err) {
        console.log('Error starting contest ' + contest.id + ': ' + err.message);
      });
    });
  });
}

var finishContests = function() {
  console.log('Finishing contests');
  contestService.listContestsToFinish().then(function(contests) {
    contests.forEach(function(contest) {
      contestService.finishContest(contest).then(function() {
        console.log('Contest ' + contest.id + ' was finished');
      }).catch(function(err) {
        console.log('Error finishing contest ' + contest.id + ': ' + err.message);
      });
    });
  });
}

var sched = later.parse.recur().on(28).minute();
var finishContestsInterval = later.setInterval(finishContests, sched);
var startContestsInterval = later.setInterval(startContests, sched);