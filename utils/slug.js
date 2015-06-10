'use strict';

var slug = require('slug');
slug.charmap['$'] = 's';
slug.charmap['.'] = ' ';
slug.charmap[':'] = ' ';
slug.charmap['('] = ' ';
slug.charmap[')'] = ' ';
slug.charmap['{'] = ' ';
slug.charmap['}'] = ' ';
slug.charmap['['] = ' ';
slug.charmap[']'] = ' ';
slug.charmap['"'] = ' ';
slug.charmap['’'] = ' ';
slug.charmap[','] = ' ';
slug.charmap['!'] = ' ';
slug.charmap['@'] = ' ';
slug.charmap['&'] = 'and';
slug.charmap['\''] = ' ';

var usernameRegexp = new RegExp('^[a-z0-9.]{5,20}$');

exports.slugify = function(str) {
  var slugified = '';
  if(str) {
    slugified = slug(str).toLowerCase();
  }
  return slugified;
};
