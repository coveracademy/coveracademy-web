var settings   = require('../../configs/settings'),
    APIError   = require('../errors/apiErrors').APIError,
    youtubeAPI = require('youtube-api'),
    Promise    = require('bluebird'),
    _          = require('underscore'),
    $          = this;

_.str = require('underscore.string');

youtubeAPI.authenticate({
  type: 'key',
  key: settings.googleAPIKey
});

var youtubeRegexp = "https?:\\/\\/(?:[0-9A-Z-]+\\.)?(?:youtu\\.be\\/|youtube(?:-nocookie)?\\.com\\S*[^\\w\\s-])([\\w-]{11})(?=[^\\w-]|$)(?![?=&+%\\w.-]*(?:['\"][^<>]*>|<\\/a>))[?=&+%\\w.-]*";
var youtubeVideoUrlPattern = 'https://www.youtube.com/watch?v=[VIDEO_ID]';
var youtubeVideoEmbedUrlPattern = 'https://www.youtube.com/embed/[VIDEO_ID]';
var youtubeVideoSmallThumbnailPattern = 'https://i.ytimg.com/vi/[VIDEO_ID]/default.jpg';
var youtubeVideoMediumThumbnailPattern = 'https://i.ytimg.com/vi/[VIDEO_ID]/mqdefault.jpg';
var youtubeVideoLargeThumbnailPattern = 'https://i.ytimg.com/vi/[VIDEO_ID]/hqdefault.jpg';

function getYoutubeRegExp() {
  return new RegExp(youtubeRegexp, "ig");
}

function isYoutubeURL(url) {
  return getYoutubeRegExp().test(url);
}

function getIdFromURL(url) {
  var id = url.replace(getYoutubeRegExp(), '$1');
  if (_.str.include(id, ';')) {
    var pieces = id.split(';');
    if (_.str.include(pieces[1], '%')) {
      // links like this:
      // "http://www.youtube.com/attribution_link?a=pxa6goHqzaA&amp;u=%2Fwatch%3Fv%3DdPdgx30w9sU%26feature%3Dshare"
      // have the real query string URI encoded behind a ';'.
      // at this point, `id is 'pxa6goHqzaA;u=%2Fwatch%3Fv%3DdPdgx30w9sU%26feature%3Dshare'
      var uriComponent = decodeURIComponent(id.split(';')[1]);
      id = ('http://youtube.com' + uriComponent).replace(youtubeRegexp, '$1');
    } else {
      // https://www.youtube.com/watch?v=VbNF9X1waSc&amp;feature=youtu.be
      // `id` looks like 'VbNF9X1waSc;feature=youtu.be' currently.
      // strip the ';feature=youtu.be'
      id = pieces[0];
    }
  } else if (_.str.include(id, '#')) {
    // id might look like '93LvTKF_jW0#t=1'
    // and we want '93LvTKF_jW0'
    id = id.split('#')[0];
  }
  return id;
}

var getVideoData = function(videoId, parts) {
  return new Promise(function(resolve, reject) {
    var partsString = '';
    for(index in parts) {
      partsString += parts[index];
      if(index < parts.length - 1) {
        partsString += ',';
      }
    }
    youtubeAPI.videos.list({
      part: partsString,
      id: videoId
    }, function(err, data) {
      if(err) {
        reject(err);
      } else {
        if(data.items.length > 0) {
          resolve(data.items[0]);
        } else {
          reject(new Error('Video not found'));
        }
      }
    });
  });
}

var getSecondsFromDuration = function(duration) {
  var regex = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  var result = null;
  if(regex.test(duration)) {
    var matches = regex.exec(duration);
    var minutes = matches[2] ? parseInt(matches[2]) : 0;
    var seconds = matches[3] ? parseInt(matches[3]) : 0;
    result = (minutes * 60) + seconds;
  }
  return result;
}

exports.getVideoInfos = function(uri) {
  return new Promise(function(resolve, reject) {
    if(isYoutubeURL(uri) === true) {
      var videoId = getIdFromURL(uri);
      getVideoData(videoId, ['snippet', 'statistics', 'contentDetails']).then(function(videoData) {
        var videoInfos = {};
        videoInfos.id = videoData.id;
        videoInfos.url = youtubeVideoUrlPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.embedUrl = youtubeVideoEmbedUrlPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.title = videoData.snippet.title;
        videoInfos.description = videoData.snippet.description;
        videoInfos.duration = getSecondsFromDuration(videoData.contentDetails.duration);
        videoInfos.views = parseInt(videoData.statistics.viewCount);
        videoInfos.likes = parseInt(videoData.statistics.likeCount);
        videoInfos.dislikes = parseInt(videoData.statistics.dislikeCount);
        videoInfos.channelId = videoData.snippet.channelId;
        videoInfos.channelTitle = videoData.snippet.channelTitle;
        videoInfos.date = new Date(videoData.snippet.publishedAt);

        videoInfos.thumbnails = {};
        videoInfos.thumbnails.small = youtubeVideoSmallThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.thumbnails.medium = youtubeVideoMediumThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.thumbnails.large = youtubeVideoLargeThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
        resolve(videoInfos);
      }).catch(function(err) {
        reject(err);
      });
    } else {
      reject(new APIError(400, 'contest.join.videoURLNotValid', 'This is not a YouTube video URL'));
    }
  });
}

// exports.getVideoInfos = function(uri) {
//   return new Promise(function(resolve, reject) {
//     if(isYoutubeURL(oembedData.url) === true) {
//       oembed.get(uri).then(function(oembedData) {
//         var videoInfos = {};
//         videoInfos.id = getIdFromURL(oembedData.url);
//         videoInfos.url = youtubeVideoUrlPattern.replace('[VIDEO_ID]', videoInfos.id);
//         videoInfos.embedUrl = youtubeVideoEmbedUrlPattern.replace('[VIDEO_ID]', videoInfos.id);
//         videoInfos.title = oembedData.meta.title;
//         videoInfos.description = oembedData.meta.description;
//         videoInfos.duration = oembedData.meta.duration;
//         videoInfos.views = oembedData.meta.views;
//         videoInfos.likes = oembedData.meta.likes;
//         videoInfos.author = oembedData.meta.author;
//         videoInfos.date = new Date(oembedData.meta.date);

//         videoInfos.thumbnails = {};
//         videoInfos.thumbnails.small = youtubeVideoSmallThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
//         videoInfos.thumbnails.medium = youtubeVideoMediumThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
//         videoInfos.thumbnails.large = youtubeVideoLargeThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
//         resolve(videoInfos);
//       }).catch(function(err) {
//         reject(err);
//       });
//     } else {
//       reject(new Error('This is not a YouTube URL'));
//     }
//   });
// }