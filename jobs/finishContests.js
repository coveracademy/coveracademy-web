var contestService = require('../apis/contestService'),
    Contest        = require('../models/models').Contest,
    later          = require('later');

var finishContests = function() {
  console.log('Finishing contests');
  contestService.listUnfinishedContests().then(function(contests) {
    var finishedContests = Contest.collection();
    contests.forEach(function(contest) {
      if(new Date() >= new Date(contest.get('end_date'))) {
        finishedContests.add(contest);
      }
    });
    finishedContests.forEach(function(finishedContest) {
      contestService.finishContest(finishedContest).then(function(result) {
        console.log('Contest ' + result.contest.id + ' was finished');
      }).catch(function(err) {
        console.log('Error finishing contest ' + finishedContest.id + ': ' + err.message);
      });
    });
  });
}

var sched = later.parse.recur().on(22).minute();
var interval = later.setInterval(finishContests, sched);