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
  registration_date timestamp default current_timestamp,
  primary key (id),
  unique key `uq_user_email` (`email`),
  unique key `uq_user_facebook_account` (`facebook_account`),
  unique key `uq_user_twitter_account` (`twitter_account`),
  unique key `uq_user_google_account` (`google_account`)
) engine = innodb default charset = utf8;

create table musical_genre (
  id   int(11) not null auto_increment,
  name varchar(50) not null,
  primary key (id)
) engine = innodb default charset = utf8;

create table music_artist (
  id   int(11) not null auto_increment,
  name varchar(50) not null,
  primary key (id)
) engine = innodb default charset = utf8;

create table music_title (
  id              int(11) not null auto_increment,
  name            varchar(50) not null,
  music_artist_id int(11) not null,
  primary key (id),
  key `fk_music_title_music_artist_id` (`music_artist_id`),
  constraint `fk_music_title_music_artist_id` foreign key (`music_artist_id`) references `music_artist` (`id`)
) engine = innodb default charset = utf8;

create table cover (
  id                int(11) not null auto_increment,
  user_id           int(11) not null,
  music_artist_id   int(11) not null,
  music_title_id    int(11) not null,
  url               varchar(255) not null,
  embed_url         varchar(255) not null,
  title             varchar(255) not null,
  duration          int(11) default null,
  video_id          varchar(255) default null,
  video_likes       int(11) default null,
  video_views       int(11) default null,
  video_author      varchar(255) default null,
  video_date        timestamp null default null,
  small_thumbnail   varchar(255) default null,
  medium_thumbnail  varchar(255) default null,
  large_thumbnail   varchar(255) default null,
  registration_date timestamp default current_timestamp,
  primary key (id),
  key `fk_cover_music_artist_id` (`music_artist_id`),
  key `fk_cover_music_title_id` (`music_title_id`),
  constraint `fk_cover_music_artist_id` foreign key (`music_artist_id`) references `music_artist` (`id`),
  constraint `fk_cover_music_title_id` foreign key (`music_title_id`) references `music_title` (`id`)
) engine = innodb default charset = utf8;

create table cover_musical_genre (
  id               int(11) not null auto_increment,
  cover_id         int(11) not null,
  musical_genre_id int(11) not null,
  primary key (id),
  key `fk_cover_musical_genre_cover_id` (`cover_id`),
  key `fk_cover_musical_genre_musical_genre_id` (`musical_genre_id`),
  constraint `fk_cover_musical_genre_cover_id` foreign key (`cover_id`) references `cover` (`id`),
  constraint `fk_cover_musical_genre_musical_genre_id` foreign key (`musical_genre_id`) references `musical_genre` (`id`)
) engine = innodb default charset = utf8;