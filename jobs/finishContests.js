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
    contestService.finishContests(finishedContests).then(function(finishedContests) {
      console.log(finishedContests.size() + ' contests was finished');
    });
  });
}

var sched = later.parse.recur().on(0).minute();
var interval = later.setInterval(finishContests, sched);