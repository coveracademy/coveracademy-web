var settings   = require('../../configs/settings'),
    youtubeAPI = require('youtube-api');

youtubeAPI.authenticate({
  type: 'key',
  key: settings.googleAPIKey
});

// youtubeAPI.videos.getRating({
//     id: "MJL_bChiTI0"
// }, function (err, data) {
//     console.log(err || data);
// });

module.exports = youtubeAPI;