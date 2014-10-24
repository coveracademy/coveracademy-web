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
Bookshelf.plugin('virtuals');

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

var Contest = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'contest',
  getProgress: function() {
    if(this.get('finished') === 1) {
      return 'finished';
    } else {
      if(this.get('start_date') && this.get('end_date')) {
        var start = new Date(this.get('start_date'));
        var end = new Date(this.get('end_date'));
        var now = new Date();
        if(now < start) {
          return 'waiting';
        } else if(now > start && now < end) {
          return 'running';
        } else {
          return 'finished';
        }
      } else {
        return 'waiting';
      }
    }
  }
});

var Audition = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'audition',
  user: function() {
    return this.belongsTo(User, 'user_id');
  },
  contest: function() {
    return this.belongsTo(Contest, 'contest_id');
  }
});

var UserVote = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'user_vote',
  user: function() {
    return this.belongsTo(User, 'user_id');
  },
  audition: function() {
    return this.belongsTo(Audition, 'audition_id');
  }
});

module.exports = {
  User: User,
  Cover: Cover,
  PotentialCover: PotentialCover,
  MusicGenre: MusicGenre,
  Artist: Artist,
  Music: Music,
  Contest: Contest,
  Audition: Audition,
  UserVote: UserVote,
  Bookshelf: Bookshelf
}