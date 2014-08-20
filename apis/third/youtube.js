var oembed  = require('./oembed'),
    Promise = require('bluebird'),
    _       = require('underscore'),
    _s      = require('underscore.string');

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
  if (_s.include(id, ';')) {
    var pieces = id.split(';');
    if (_s.include(pieces[1], '%')) {
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
  } else if (_s.include(id, '#')) {
    // id might look like '93LvTKF_jW0#t=1'
    // and we want '93LvTKF_jW0'
    id = id.split('#')[0];
  }
  return id;
}

exports.getVideoInfos = function(uri) {
  return new Promise(function(resolve, reject) {
    oembed.get(uri).then(function(oembedData) {
      var videoInfos = {};
      if(isYoutubeURL(oembedData.url) === true) {
        videoInfos.id = getIdFromURL(oembedData.url);
        videoInfos.url = youtubeVideoUrlPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.embedUrl = youtubeVideoEmbedUrlPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.title = oembedData.meta.title;
        videoInfos.description = oembedData.meta.description;
        videoInfos.duration = oembedData.meta.duration;
        videoInfos.views = oembedData.meta.views;
        videoInfos.likes = oembedData.meta.likes;
        videoInfos.author = oembedData.meta.author;
        videoInfos.date = new Date(oembedData.meta.date);

        videoInfos.thumbnails = {};
        videoInfos.thumbnails.small = youtubeVideoSmallThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.thumbnails.medium = youtubeVideoMediumThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
        videoInfos.thumbnails.large = youtubeVideoLargeThumbnailPattern.replace('[VIDEO_ID]', videoInfos.id);
        resolve(videoInfos);
      } else {
        reject(new Error('This is not a Youtube URL'));
      }
    }).catch(function(err) {
      reject(err);
    });
  });
}