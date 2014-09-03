angular
.module('coverChallengeApp.providers', [])
.provider('$languages', function() {
  var english = {
    id: 'en',
    image: 'en.png',
    table: {
      ABOUT: 'About',
      ADD_COVER: 'Add cover',
      ADD_NEW_COVER_VIDEO: 'Add a new cover video',
      ADDED: 'Added',
      ALL_ARTISTS: 'All artists',
      BEST_COVERS: 'Best covers',
      BEST_COVERS_WEEK: 'Best covers from this week',
      BY: 'By',
      BY_LOWERCASE: 'by',
      CONTACT: 'Contact',
      COVER_BY: 'Cover by',
      COVER_VIDEO_TITLE: '{{ author }}\'s cover of "{{ music.title }}" by {{ artist.name }}',
      FOLLOW_US: 'Follow us',
      GIVE_US_YOUR_FEEDBACK: 'Give us your Feedback',
      HELP_US_TO_IMPROVE: 'Help us to improve much more the Cover Challenge',
      LATEST_COVERS: 'Latest covers',
      LATEST_COVERS_WEEK: 'Latest covers from this week',
      MORE_COVERS: 'More covers',
      MORE_COVERS_BY: 'More covers by',
      MORE_COVERS_OF: 'More covers of',
      MUSIC_GENRE_ARTISTS: '{{ name }} artists',
      MUSICS: 'musics',
      ON_YOUTUBE: 'on YouTube',
      PASTE_HERE_THE_VIDEO_URL: 'Paste here the video URL',
      RESULTS_FOR: 'results for',
      SEARCH_FOR_MUSICS_OR_ARTISTS: 'Search for musics or artists',
      SEE_ALL_MUSIC_GENRE_ARTISTS: 'See all {{ name }} artists',
      SEE_THE_BEST_COVERS: 'See the best covers',
      SEE_THE_LATEST_COVERS: 'See the latest covers',
      SHARE_ON: 'Share on',
      SIGNIN_BUTTON: 'Sign in',
      SIGNIN_MESSAGE: 'Please sign in with your social network account',
      THE_ARTIST_OR_BAND_NAME: 'The artist or band name',
      THE_BEST_MUSIC_GENRE_COVERS: 'The best {{ name }} covers',
      THE_COVER_AUTHOR: 'The cover author',
      THE_LATEST_MUSIC_GENRE_COVERS: 'The latest {{ name }} covers',
      THE_MUSIC_TITLE: 'The music title',
      THE_PROJECT: 'The project',
      ALERTS: {
        NOT_AUTHORIZED: 'You are not authorized to access this section!',
        NOT_AUTHENTICATED: 'You are trying to access an privileged section, please sign in with your social account!',
        LOGIN_SUCCESS: 'You are authenticated now!',
        LOGIN_FAILED: 'Error authenticating, please try again!'
      },
      CONTACT_FORM: {
        EMAIL_SENDED: 'E-mail sended successfully, please wait for our contact',
        ERROR_SENDING_EMAIL: 'Error sending the e-mail, please try again lately',
        NAME: 'Name',
        MESSAGE: 'Message',
        SUBJECT: 'Subject'
      },
      MUSIC_GENRE: {
        ACOUSTIC: 'Acoustic',
        BLUES_OR_JAZZ: 'Blues of Jazz',
        COUNTRY: 'Country',
        ELECTRONIC: 'Electronic',
        POP: 'Pop',
        RAP_OR_HIP_HOP: 'Rap or Hip-Hop',
        REGGAE: 'Reggae',
        RHYTHM_AND_BLUES: 'Rhythm and blues',
        ROCK: 'Rock'
      }
    }
  };
  var portuguese = {
    id: 'pt',
    image: 'pt.png',
    table: {
      ABOUT: 'Sobre',
      ADD_COVER: 'Adicionar cover',
      ADD_NEW_COVER_VIDEO: 'Adicionar um novo vídeo de cover',
      ADDED: 'Adicionado',
      ALL_ARTISTS: 'Todos os artistas',
      BEST_COVERS: 'Melhores covers',
      BEST_COVERS_WEEK: 'Melhores covers da semana',
      BY: 'Por',
      BY_LOWERCASE: 'de',
      CONTACT: 'Contato',
      COVER_BY: 'Cover de',
      COVER_VIDEO_TITLE: 'Cover de {{ author }} da música "{{ music.title }}" de {{ artist.name }}',
      FOLLOW_US: 'Siga-nos',
      GIVE_US_YOUR_FEEDBACK: 'Nos dê o seu Feedback',
      HELP_US_TO_IMPROVE: 'Ajude-nos a melhorar cada vez mais o CoverChallenge',
      LATEST_COVERS: 'Últimos covers',
      LATEST_COVERS_WEEK: 'Últimos covers da semana',
      MORE_COVERS: 'Mais covers',
      MORE_COVERS_BY: 'Mais covers de',
      MORE_COVERS_OF: 'Mais covers de',
      MUSIC_GENRE_ARTISTS: 'Artistas de {{ name }}',
      MUSICS: 'musicas',
      ON_YOUTUBE: 'no YouTube',
      PASTE_HERE_THE_VIDEO_URL: 'Cole aqui a URL do vídeo',
      RESULTS_FOR: 'resultados para',
      SEARCH_FOR_MUSICS_OR_ARTISTS: 'Busque por músicas ou artistas',
      SEE_ALL_MUSIC_GENRE_ARTISTS: 'Veja todos os artistas de {{ name }}',
      SEE_THE_BEST_COVERS: 'Veja os melhores covers',
      SEE_THE_LATEST_COVERS: 'Veja os últimos covers',
      SHARE_ON: 'Compartilhe no',
      SIGNIN_BUTTON: 'Acessar',
      SIGNIN_MESSAGE: 'Por favor acesse com sua conta de rede social',
      THE_ARTIST_OR_BAND_NAME: 'O nome do artista ou da banda',
      THE_BEST_MUSIC_GENRE_COVERS: 'Os melhores covers de {{ name }}',
      THE_COVER_AUTHOR: 'O autor do cover',
      THE_LATEST_MUSIC_GENRE_COVERS: 'Os últimos covers de {{ name }}',
      THE_MUSIC_TITLE: 'O título da música',
      THE_PROJECT: 'O projeto',
      ALERTS: {
        NOT_AUTHORIZED: 'Você não tem autorização para acessar esta seção!',
        NOT_AUTHENTICATED: 'Você está tentando acessar uma seção privilegiada, por favor acesse sua conta de rede social!',
        LOGIN_SUCCESS: 'Você está autenticado agora!',
        LOGIN_FAILED: 'Erro ao autenticar, por favor tente novamente!'
      },
      CONTACT_FORM: {
        EMAIL_SENDED: 'E-mail enviado com sucesso, aguarde o nosso contato',
        ERROR_SENDING_EMAIL: 'Erro ao enviar o e-mail, por favor tente novamente mais tarde',
        NAME: 'Nome',
        MESSAGE: 'Mensagem',
        SUBJECT: 'Assunto'
      },
      MUSIC_GENRE: {
        ACOUSTIC: 'Acústico',
        BLUES_OR_JAZZ: 'Blues ou Jazz',
        COUNTRY: 'Country',
        ELECTRONIC: 'Eletrônica',
        POP: 'Pop',
        RAP_OR_HIP_HOP: 'Rap ou Hip-Hop',
        REGGAE: 'Reggae',
        RHYTHM_AND_BLUES: 'Rhythm and blues',
        ROCK: 'Rock'
      }
    }
  };
  var languages = [english, portuguese];

  this.getLanguages = function() {
    return languages;
  };
  this.getPreferredLanguage = function() {
    return portuguese;
  };
  this.getFallbackLanguage = function() {
    return portuguese;
  };
  this.$get = function() {
    return {
      all: languages,
      contains: function(languageId) {
        for(index in languages) {
          if(languages[index].id === languageId) {
            return true;
          }
        }
        return false;
      }
    }
  };
});