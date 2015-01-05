var properties = require('properties'),
    parse      = require('deasync')(properties.parse);

exports.load = function() {
  return parse(process.env.CONFIG_FILE || 'config.properties', {path: true, sections: true});
}