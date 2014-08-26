angular
.module('coverChallengeApp.providers', [])
.provider('$languages', function() {
  var english = {
    id: 'en',
    table: {
      SEARCH_INPUT_PLACEHOLDER: 'Search for musics or artists',
      SIGNIN_BUTTON: 'Sign in',
      SIGNIN_MESSAGE: 'Please sign in with your social network account',
      BEST_COVERS_WEEK: 'Best covers from this week',
      LATEST_COVERS_WEEK: 'Latest covers from this week',
      BEST_COVERS: 'Best covers',
      LATEST_COVERS: 'Latest covers',
      MORE_COVERS: 'More covers',
      SEE_THE_BEST_COVERS: 'See the best covers',
      SEE_THE_LATEST_COVERS: 'See the latest covers',
      SEE_ALL_MUSIC_GENRE_ARTISTS: 'See all {{ name }} artists',
      THE_BEST_MUSIC_GENRE_COVERS: 'The best {{ name }} covers',
      THE_LATEST_MUSIC_GENRE_COVERS: 'The latest {{ name }} covers',
      MORE_COVERS_OF: 'More covers of',
      MORE_COVERS_BY: 'More covers by',
      COVER_BY: 'Cover by',
      BY: 'By',
      BY_LOWERCASE: 'by',
      MUSIC_GENRE_ARTISTS: '{{ name }} artists',
      ALL_ARTISTS: 'All artists',
      COVER_VIDEO_TITLE: ''
    }
  };
  var portuguese = {
    id: 'pt',
    table: {
      SEARCH_INPUT_PLACEHOLDER: 'Busque por músicas ou artistas',
      SIGNIN_BUTTON: 'Acessar',
      SIGNIN_MESSAGE: 'Por favor acesse com sua conta de rede social',
      BEST_COVERS_WEEK: 'Melhores covers da semana',
      LATEST_COVERS_WEEK: 'Últimos covers da semana',
      BEST_COVERS: 'Melhores covers',
      LATEST_COVERS: 'Últimos covers',
      MORE_COVERS: 'Mais covers',
      SEE_THE_BEST_COVERS: 'Veja os melhores covers',
      SEE_THE_LATEST_COVERS: 'Veja os últimos covers',
      SEE_ALL_MUSIC_GENRE_ARTISTS: 'Veja todos os artistas de {{ name }}',
      THE_BEST_MUSIC_GENRE_COVERS: 'Os melhores covers de {{ name }}',
      THE_LATEST_MUSIC_GENRE_COVERS: 'Os últimos covers de {{ name }}',
      MORE_COVERS_OF: 'Mais covers de',
      MORE_COVERS_BY: 'Mais covers de',
      COVER_BY: 'Cover de',
      BY: 'Por',
      BY_LOWERCASE: 'de',
      MUSIC_GENRE_ARTISTS: 'Artistas de {{ name }}',
      ALL_ARTISTS: 'Todos os artistas',
      COVER_VIDEO_TITLE: ''
    }
  };
  var supportedLanguages = [english, portuguese];

  this.getLanguages = function() {
    return supportedLanguages;
  };

  this.$get = function() {
    return supportedLanguages;
  };
});