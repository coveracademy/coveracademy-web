create table user (
  id                int(11) not null auto_increment,
  name              varchar(100) not null,
  gender            enum('MALE', 'FEMALE') default 'MALE',
  permission        enum('USER', 'MODERATOR', 'ADMIN') default 'USER',
  email             varchar(255) default null,
  photo_filename    varchar(255) default null,
  facebook_account  varchar(255) default null,
  twitter_account   varchar(255) default null,
  google_account    varchar(255) default null,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  unique key `uq_user_email` (`email`),
  unique key `uq_user_facebook_account` (`facebook_account`),
  unique key `uq_user_twitter_account` (`twitter_account`),
  unique key `uq_user_google_account` (`google_account`)
) engine = innodb default charset = utf8;

create table music_genre (
  id    int(11) not null auto_increment,
  name  varchar(50) not null,
  slug  varchar(50) not null,
  image varchar(50) default null,
  primary key (id)
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
  key `fk_music_artist_id` (`artist_id`),
  constraint `fk_music_artist_id` foreign key (`artist_id`) references `artist` (`id`)
) engine = innodb default charset = utf8;

create table cover (
  id                int(11) not null auto_increment,
  user_id           int(11) not null,
  artist_id         int(11) not null,
  music_id          int(11) not null,
  url               varchar(255) not null,
  embed_url         varchar(255) not null,
  title             varchar(255) not null,
  author            varchar(255) default null,
  duration          int(11) default null,
  video_id          varchar(255) default null,
  video_likes       int(11) default null,
  video_views       int(11) default null,
  video_date        timestamp null default null,
  small_thumbnail   varchar(255) default null,
  medium_thumbnail  varchar(255) default null,
  large_thumbnail   varchar(255) default null,
  registration_date timestamp not null default current_timestamp,
  primary key (id),
  key `fk_cover_artist_id` (`artist_id`),
  key `fk_cover_music_id` (`music_id`),
  constraint `fk_cover_artist_id` foreign key (`artist_id`) references `artist` (`id`),
  constraint `fk_cover_music_id` foreign key (`music_id`) references `music` (`id`)
) engine = innodb default charset = utf8;

create table potential_cover (
  id                int(11) not null auto_increment,
  artist            varchar(255) not null,
  music             varchar(255) not null,
  author            varchar(255) default null,
  url               varchar(255) not null,
  registration_date timestamp not null default current_timestamp,
  primary key (id)
) engine = innodb default charset = utf8;