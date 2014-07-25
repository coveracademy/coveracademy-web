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

var MusicalGenre = Bookshelf.Model.extend({
  tableName: 'musical_genre'
});

var MusicArtist = Bookshelf.Model.extend({
  tableName: 'music_artist'
});

var MusicTitle = Bookshelf.Model.extend({
  tableName: 'music_title'
});

var Cover = Bookshelf.Model.extend({
  tableName: 'cover',
  musicArtist: function() {
    return this.belongsTo(MusicArtist, 'music_artist_id')
  },
  musicTitle: function() {
    return this.belongsTo(MusicTitle, 'music_title_id')
  },
  musicalGenres: function() {
    return this.belongsToMany(MusicalGenre, 'cover_musical_genre', 'cover_id', 'musical_genre_id');
  },
  addedByUser: function() {
    return this.belongsTo(User, 'added_by_user_id')
  }
});

module.exports = {
  User: User,
  Cover: Cover,
  MusicalGenre: MusicalGenre,
  MusicArtist: MusicArtist,
  MusicTitle: MusicTitle,
  Bookshelf: Bookshelf
}