var settings = require('../configs/settings');
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
  idAttribute: 'id',
  tableName: 'user'
});

var MusicGenre = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'music_genre'
});

var Artist = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'artist',
  musicGenre: function() {
    return this.belongsTo(MusicGenre, 'music_genre_id');
  }
});

var Music = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'music',
  artist: function() {
    return this.belongsTo(Artist, 'artist_id');
  }
});

var Cover = Bookshelf.Model.extend({
  idAttribute: 'id',
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

var PotentialCover = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'potential_cover'
});

var Competition = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'competition'
});

var Audition = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'audition'
});

module.exports = {
  User: User,
  Cover: Cover,
  PotentialCover: PotentialCover,
  MusicGenre: MusicGenre,
  Artist: Artist,
  Music: Music,
  Competition: Competition,
  Audition: Audition,
  Bookshelf: Bookshelf
}