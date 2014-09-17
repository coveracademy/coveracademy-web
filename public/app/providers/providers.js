angular
.module('coverAcademy.providers', [])
.provider('$languages', function() {
  var english = {
    id: 'en',
    image: 'en.png',
    table: {
      about: 'About',
      add_cover: 'Add cover',
      add_new_cover_video: 'Add a new cover video',
      added: 'Added',
      all_artists: 'All artists',
      best_covers: 'Best covers',
      best_covers_week: 'Best covers from this week',
      best_music_genre_covers: 'Best {{ name }} covers',
      by: 'By',
      by_lowercase: 'by',
      contact: 'Contact',
      cover_by: 'Cover by',
      cover_video_title: '{{ author }}\'s cover of "{{ music.title }}" by {{ artist.name }}',
      follow_us: 'Follow us',
      give_us_your_feedback: 'Give us your Feedback',
      help_us_to_improve: 'Help us to further improve the {{ siteName }}',
      latest_covers: 'Latest covers',
      latest_covers_week: 'Latest covers from this week',
      latest_music_genre_covers: 'Latest {{ name }} covers',
      more_covers: 'More covers',
      more_covers_by: 'More covers by',
      more_covers_of: 'More covers of',
      music_genre_artists: '{{ name }} artists',
      musics: 'musics',
      on_youtube: 'on YouTube',
      paste_here_the_video_url: 'Paste here the video URL',
      results_for: 'results for',
      search_for_musics_or_artists: 'Search for musics or artists',
      see_all_music_genre_artists: 'See all {{ name }} artists',
      see_the_best_covers: 'See the best covers',
      see_the_best_music_genre_covers: 'See the best {{ name }} covers',
      see_the_latest_music_genre_covers: 'See the latest {{ name }} covers',
      share_on: 'Share on',
      signin_button: 'Sign in',
      signin_message: 'Please sign in with your social network account',
      the_artist_or_band_name: 'The artist or band name',
      the_best_music_genre_covers: 'The best {{ name }} covers',
      the_cover_author: 'The cover author',
      the_latest_music_genre_covers: 'The latest {{ name }} covers',
      the_music_title: 'The music title',
      alerts: {
        not_authorized: 'You are not authorized to access this section!',
        not_authenticated: 'You are trying to access an privileged section, please sign in with your social account!',
        login_success: 'You are authenticated now!',
        login_failed: 'Error authenticating, please try again!'
      },
      contact_form: {
        email_sended: 'E-mail sended successfully, please wait for our contact',
        error_sending_email: 'Error sending the e-mail, please try again lately',
        name: 'Name',
        message: 'Message',
        subject: 'Subject'
      },
      errors: {
        page_not_found: 'Page not found',
        internal_error: 'Internal error'
      },
      music_genre: {
        acoustic: 'Acoustic',
        blues_or_jazz: 'Blues of Jazz',
        country: 'Country',
        electronic: 'Electronic',
        pop: 'Pop',
        rap_or_hip_hop: 'Rap or Hip-Hop',
        reggae: 'Reggae',
        rhytm_and_blues: 'Rhythm and blues',
        rock: 'Rock'
      },
      rank_type: {
        best: 'best',
        latest: 'latest'
      },
      seo: {
        admin: 'Administration console',
        add_cover: 'Add a new cover',
        artist: 'The {{ rankType }} covers of musics by {{ artist }}',
        artists_all: 'All artists',
        artists_music_genre: '{{ musicGenre }} artists',
        contact: 'Contact us, give us your feedback',
        cover: '{{ author }}\'s cover of "{{ music }}" by {{ artist }}',
        covers_rank: 'The {{ rankType }} covers from this week',
        index: 'The best covers in one place',
        music: 'The {{ rankType }} covers of "{{ music }}" by {{ artist }}',
        music_genre: '{{ musicGenre }} cover songs',
        music_genre_rank: 'The {{ rankType }} {{ musicGenre }} cover songs',
        search: 'Search results for "{{ searchQuery }}"'
      }
    }
  };
  var portuguese = {
    id: 'pt-br',
    image: 'pt-br.png',
    table: {
      about: 'Sobre',
      add_cover: 'Adicionar cover',
      add_new_cover_video: 'Adicionar um novo vídeo de cover',
      added: 'Adicionado',
      all_artists: 'Todos os artistas',
      best_covers: 'Melhores covers',
      best_covers_week: 'Melhores covers da semana',
      by: 'Por',
      by_lowercase: 'de',
      contact: 'Contato',
      cover_by: 'Cover de',
      cover_video_title: 'Cover de {{ author }} da música "{{ music.title }}" de {{ artist.name }}',
      follow_us: 'Siga-nos',
      give_us_your_feedback: 'Nos dê o seu Feedback',
      help_us_to_improve: 'Ajude-nos a melhorar ainda mais o {{ siteName }}',
      latest_covers: 'Últimos covers',
      latest_covers_week: 'Últimos covers da semana',
      more_covers: 'Mais covers',
      more_covers_by: 'Mais covers de',
      more_covers_of: 'Mais covers de',
      music_genre_artists: 'Artistas de {{ name }}',
      musics: 'musicas',
      on_youtube: 'no YouTube',
      paste_here_the_video_url: 'Cole aqui a URL do vídeo',
      results_for: 'resultados para',
      search_for_musics_or_artists: 'Busque por músicas ou artistas',
      see_all_music_genre_artists: 'Veja todos os artistas de {{ name }}',
      see_the_best_covers: 'Veja os melhores covers',
      see_the_latest_covers: 'Veja os últimos covers',
      share_on: 'Compartilhe no',
      signin_button: 'Acessar',
      signin_message: 'Por favor acesse com sua conta de rede social',
      the_artist_or_band_name: 'O nome do artista ou da banda',
      the_best_music_genre_covers: 'Os melhores covers de {{ name }}',
      the_cover_author: 'O autor do cover',
      the_latest_music_genre_covers: 'Os últimos covers de {{ name }}',
      the_music_title: 'O título da música',
      alerts: {
        not_authorized: 'Você não tem autorização para acessar esta seção!',
        not_authenticated: 'Você está tentando acessar uma seção privilegiada, por favor acesse sua conta de rede social!',
        login_success: 'Você está autenticado agora!',
        login_failed: 'Erro ao autenticar, por favor tente novamente!'
      },
      contact_form: {
        email_sended: 'E-mail enviado com sucesso, aguarde o nosso contato',
        error_sending_email: 'Erro ao enviar o e-mail, por favor tente novamente mais tarde',
        name: 'Nome',
        message: 'Mensagem',
        subject: 'Assunto'
      },
      errors: {
        page_not_found: 'Página não encontrada',
        internal_error: 'Erro interno'
      },
      music_genre: {
        acoustic: 'Acústico',
        blues_or_jazz: 'Blues ou Jazz',
        country: 'Country',
        electronic: 'Eletrônica',
        pop: 'Pop',
        rap_or_hip_hop: 'Rap ou Hip-Hop',
        reggae: 'Reggae',
        rhytm_and_blues: 'Rhythm and blues',
        rock: 'Rock'
      },
      rank_type: {
        best: 'melhores',
        latest: 'últimos'
      },
      seo: {
        admin: 'Console de administração',
        add_cover: 'Adicione um novo cover',
        artist: 'Os {{ rankType }} covers das músicas de {{ artist }}',
        artists_all: 'Todos os artistas',
        artists_music_genre: 'Artistas {{ musicGenre }}',
        contact: 'Entre em contato, nos dê o seu feedback',
        cover: 'Cover de {{ author }} da música "{{ music }}" de {{ artist }}',
        covers_rank: 'Os {{ rankType }} covers da semana',
        index: 'Os melhores covers em um só lugar',
        music: 'Os {{ rankType }} covers da música "{{ music }}" de {{ artist }}',
        music_genre: 'Covers de {{ musicGenre }}',
        music_genre_rank: 'Os {{ rankType }} covers de {{ musicGenre }}',
        search: 'Resultados da busca por "{{ searchQuery }}"'
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