var settings = require('../configs/settings');
var knex = require('knex')({
  client: settings.database.dialect,
  debug: settings.debug,
  connection: {
    host: settings.database.host,
    port: settings.database.port,
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
  prizes: function() {
    return this.hasMany(Prize, 'contest_id').query(function(qb) {
      qb.orderBy('place', 'asc');
    });
  },
  sponsorsInContest: function() {
    return this.hasMany(SponsorInContest, 'contest_id');
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

var UserComment = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'user_comment',
  user: function() {
    return this.belongsTo(User, 'user_id');
  },
  audition: function() {
    return this.belongsTo(Audition, 'audition_id');
  },
  replies: function() {
    return this.hasMany(UserComment, 'comment_id').query(function(qb) {
      qb.orderBy('registration_date', 'asc');
    });
  }
});

var VerificationToken = Bookshelf.Model.extend({
  idAttribute: 'token',
  tableName: 'verification_token',
  user: function() {
    return this.belongsTo(User, 'user_id');
  }
});

var Prize = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'prize',
  contest: function() {
    return this.belongsTo(Contest, 'contest_id');
  },
  sponsor: function() {
    return this.belongsTo(Sponsor, 'sponsor_id');
  },
});

var Sponsor = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'sponsor'
});

var SponsorInContest = Bookshelf.Model.extend({
  idAttribute: 'id',
  tableName: 'sponsor_contest',
  sponsor: function() {
    return this.belongsTo(Sponsor, 'sponsor_id');
  },
  contest: function() {
    return this.belongsTo(Contest, 'contest_id');
  }
});

module.exports = {
  VerificationToken: VerificationToken,
  Artist: Artist,
  Audition: Audition,
  Bookshelf: Bookshelf,
  Contest: Contest,
  Cover: Cover,
  Music: Music,
  MusicGenre: MusicGenre,
  PotentialCover: PotentialCover,
  Sponsor: Sponsor,
  SponsorInContest: SponsorInContest,
  User: User,
  UserComment: UserComment,
  UserVote: UserVote
}