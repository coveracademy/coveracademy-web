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

exports.slugify = function(str) {
  var slugified = '';
  if(str) {
    slugified = slug(str).toLowerCase();
  }
  return slugified;
}