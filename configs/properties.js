"use strict"

var properties = require('properties'),
    parse      = require('deasync')(properties.parse);

exports.load = function() {
  return parse(process.env.CONFIG_FILE || 'config.properties', {path: true, sections: true});
}

exports.getValue = function(config, key, defaultValue) {
  var value = config;
  var found = true;
  var splits = key.split('.');
  for(var i = 0; i < splits.length; i++) {
    var split = splits[i];
    if(!value[split]) {
      found = false;
      break;
    }
    value = value[split];
  }
  return found ? value : defaultValue;
}