create table user (
  id                int(11) not null auto_increment,
  name              varchar(100) not null,
  email             varchar(255) not null,
  permission        enum('user', 'admin') default 'user',
  gender            enum('male', 'female') default 'male',
  biography         varchar(255) default null,
  username          varchar(255) default null,
  city              varchar(255) default null,
  state             varchar(255) default null,
  facebook_account  varchar(255) default null,
  facebook_picture  varchar(255) default null,
  twitter_account   varchar(255) default null,
  twitter_picture   varchar(255) default null,
  google_account    varchar(255) default null,
  google_picture    varchar(255) default null,
  youtube_account   varchar(255) default null,
  profile_picture   varchar(20) default null,
  voting_power      decimal(6, 3) default 1.000,
  verified          tinyint(1) default 0,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_user_username` (`username`),
  unique key `uq_user_email` (`email`),
  unique key `uq_user_facebook_account` (`facebook_account`),
  unique key `uq_user_twitter_account` (`twitter_account`),
  unique key `uq_user_google_account` (`google_account`),
  unique key `uq_user_youtube_account` (`youtube_account`)
) engine = innodb default charset = utf8;

create table music_genre (
  id       int(11) not null auto_increment,
  name     varchar(50) not null,
  slug     varchar(50) not null,
  image    varchar(50) not null,
  i18n_key varchar(50) not null,
  primary key (id),
  unique key `uq_music_genre_name` (`name`),
  unique key `uq_music_genre_i18n_key` (`i18n_key`),
  unique key `uq_music_genre_slug` (`slug`)
) engine = innodb default charset = utf8;

create table artist (
  id                int(11) not null auto_increment,
  name              varchar(100) not null,
  slug              varchar(100) not null,
  music_genre_id    int(11) default null,
  small_thumbnail   varchar(255) default null,
  medium_thumbnail  varchar(255) default null,
  large_thumbnail   varchar(255) default null,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_artist_name` (`name`),
  unique key `uq_artist_slug` (`slug`),
  key `fk_artist_music_genre_id` (`music_genre_id`),
  constraint `fk_artist_music_genre_id` foreign key (`music_genre_id`) references `music_genre` (`id`)
) engine = innodb default charset = utf8;

create table music (
  id                int(11) not null auto_increment,
  title             varchar(255) not null,
  slug              varchar(255) not null,
  artist_id         int(11) not null,
  small_thumbnail   varchar(255) default null,
  medium_thumbnail  varchar(255) default null,
  large_thumbnail   varchar(255) default null,
  last_cover_date   timestamp null,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_music_slug` (`slug`),
  key `fk_music_artist_id` (`artist_id`),
  constraint `fk_music_artist_id` foreign key (`artist_id`) references `artist` (`id`)
) engine = innodb default charset = utf8;

create table cover (
  id                int(11) not null auto_increment,
  user_id           int(11) not null,
  artist_id         int(11) not null,
  music_id          int(11) not null,
  slug              varchar(255) not null,
  url               varchar(255) not null,
  embed_url         varchar(255) not null,
  author            varchar(255) not null,
  score             decimal(17, 16) not null,
  duration          int(11) not null,
  video_id          varchar(255) not null,
  video_title       varchar(255) not null,
  video_likes       int(11) not null,
  video_dislikes    int(11) not null,
  video_views       int(11) not null,
  video_date        timestamp null default null,
  small_thumbnail   varchar(255) default null,
  medium_thumbnail  varchar(255) default null,
  large_thumbnail   varchar(255) default null,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_cover_url` (`url`),
  key `fk_cover_user_id` (`user_id`),
  key `fk_cover_artist_id` (`artist_id`),
  key `fk_cover_music_id` (`music_id`),
  constraint `fk_cover_user_id` foreign key (`user_id`) references `user` (`id`),
  constraint `fk_cover_artist_id` foreign key (`artist_id`) references `artist` (`id`),
  constraint `fk_cover_music_id` foreign key (`music_id`) references `music` (`id`)
) engine = innodb default charset = utf8;

create table potential_cover (
  id                int(11) not null auto_increment,
  artist            varchar(255) not null,
  music             varchar(255) not null,
  author            varchar(255) not null,
  url               varchar(255) not null,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_potential_cover_url` (`url`)
) engine = innodb default charset = utf8;

create table contest (
  id                  int(11) not null auto_increment,
  name                varchar(255) not null,
  slug                varchar(255) not null,
  description         text not null,
  image               varchar(255) not null,
  minimum_contestants int(4) not null,
  acceptance_date     date not null,
  start_date          timestamp null default null,
  end_date            timestamp null default null,
  registration_date   timestamp not null default current_timestamp,
  duration            int(2) not null,
  finished            tinyint(1) default 0,
  primary key (id),
  unique key `uq_contest_slug` (`slug`)
) engine = innodb default charset = utf8;

create table audition (
  id                int(11) not null auto_increment,
  contest_id        int(11) not null,
  user_id           int(11) not null,
  slug              varchar(255) not null,
  url               varchar(255) not null,
  embed_url         varchar(255) not null,
  video_id          varchar(255) not null,
  title             varchar(255) not null,
  description       text not null,
  small_thumbnail   varchar(255) default null,
  medium_thumbnail  varchar(255) default null,
  large_thumbnail   varchar(255) default null,
  place             int(1) default null,
  approved          tinyint(1) default 0,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_audition_url` (`url`),
  unique key `uq_audition_contest_id_user_id` (`contest_id`, `user_id`),
  key `fk_audition_contest_id` (`contest_id`),
  key `fk_audition_user_id` (`user_id`),
  constraint `fk_audition_contest_id` foreign key (`contest_id`) references `contest` (`id`),
  constraint `fk_audition_user_id` foreign key (`user_id`) references `user` (`id`)
) engine = innodb default charset = utf8;

create table user_vote (
  id                int(11) not null auto_increment,
  user_id           int(11) not null,
  audition_id       int(11) not null,
  voting_power      decimal(6, 3) default 1.000,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_user_vote_user_id_audition_id` (`user_id`, `audition_id`),
  constraint `fk_user_vote_user_id` foreign key (`user_id`) references `user` (`id`),
  constraint `fk_user_vote_audition_id` foreign key (`audition_id`) references `audition` (`id`)
) engine = innodb default charset = utf8;

create table verification_token (
  token             varchar(255) not null,
  user_id           int(11) not null,
  expiration_date   timestamp not null,
  registration_date timestamp not null default current_timestamp,
  primary key (token),
  constraint `fk_verification_token_user_id` foreign key (`user_id`) references `user` (`id`)
) engine = innodb default charset = utf8;