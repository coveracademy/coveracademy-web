var _ = require('underscore');

function filter(data, attributes) {
  var filtered = {};
  attributes.forEach(function(attribute) {
    if(!_.isUndefined(data[attribute])) {
      filtered[attribute] = data[attribute];
    }
  });
  return filtered;
}

exports.modelsAttributes = {
  MusicEditableAttributes: ['title', 'artist_id', 'small_thumbnail', 'medium_thumbnail', 'large_thumbnail'],
  UserEditableAttributes: ['name', 'gender', 'biography', 'image', 'location']
}

exports.filterAttributes = function(modelName, data) {
  var result = null;
  var attributes = this.modelsAttributes[modelName];
  if(attributes) {
    if(_.isArray(data)) {
      result = [];
      _.forEach(data, function(singleData) {
        result.push(filter(singleData, attributes));
      });
    } else {
      result = filter(data, attributes)
    }
  }
  return result;
}

exports.getIds = function(collection) {
  var ids = [];
  collection.forEach(function(model) {
    ids.push(model.id);
  });
  return ids;
}