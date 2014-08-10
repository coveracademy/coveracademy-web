var settings  = require('../configs/settings');

var knex = require('knex')({
  client: settings.database.dialect,
  debug: settings.database.debug,
  connection: {
    host: settings.database.host,
    user: settings.database.user,
    password: settings.database.password,
    database: settings.database.schema,
    charset: settings.database.charset
  }
});

var Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('virtuals')

var User = Bookshelf.Model.extend({
  tableName: 'user'
});

var MusicGenre = Bookshelf.Model.extend({
  tableName: 'music_genre'
});

var Artist = Bookshelf.Model.extend({
  tableName: 'artist',
  musicGenre: function() {
    return this.belongsTo(MusicGenre, 'music_genre_id');
  }
});

var Music = Bookshelf.Model.extend({
  tableName: 'music',
  artist: function() {
    return this.belongsTo(Artist, 'artist_id');
  }
});

var Cover = Bookshelf.Model.extend({
  tableName: 'cover',
  artist: function() {
    return this.belongsTo(Artist, 'artist_id');
  },
  music: function() {
    return this.belongsTo(Music, 'music_id');
  },
  addedByUser: function() {
    return this.belongsTo(User, 'added_by_user_id');
  }
});

module.exports = {
  User: User,
  Cover: Cover,
  MusicGenre: MusicGenre,
  Artist: Artist,
  Music: Music,
  Bookshelf: Bookshelf
}