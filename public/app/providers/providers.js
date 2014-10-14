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
      best_music_genre_covers: 'Best {{ musicGenre }} covers',
      by: 'By',
      by_lowercase: 'by',
      by_user: 'by',
      contact: 'Contact',
      cover_by: 'Cover by',
      cover_video_title: '{{ author }}\'s cover of "{{ music.title }}" by {{ artist.name }}',
      days: 'days',
      follow_us: 'Follow us',
      give_us_your_feedback: 'Give us your Feedback',
      help: 'Help',
      help_us_to_improve: 'Help us to further improve {{ siteName }}',
      hours: 'hours',
      indicate_cover: 'Do you know an amazing cover song?',
      indicate_cover_steps: 'Visit our Facebook page and leave us a message',
      join_contest: 'Join contest',
      join_contest_signin_google_account: 'Please sign in with your Google account to join the contest',
      join_contest_signin_youtube_account_title: 'This is your first time?',
      join_contest_signin_youtube_account: 'Please let us associate your YouTube account with your Google account',
      join_contest_paste_video_url: 'OK, now you just need to paste your cover video URL from YouTube below!',
      join_now: 'Join now!',
      latest_covers: 'Latest covers',
      latest_covers_week: 'Latest covers from this week',
      like_us_on_facebook: 'Like us on Facebook',
      minutes: 'minutes',
      more_covers: 'More covers',
      more_covers_by: 'More covers by',
      more_covers_of: 'More covers of',
      more_videos_of_the_contestants: 'More videos of the contestants',
      music_genre_artists: '{{ musicGenre }} artists',
      musics: 'musics',
      on_youtube: 'on YouTube',
      paste_here_the_video_url: 'Paste here the video URL',
      published: 'Published',
      results_for: 'results for',
      remaining_time: 'Remaining time:',
      search_for_musics_or_artists: 'Search for musics or artists',
      see_all_music_genre_artists: 'See all {{ musicGenre }} artists',
      see_the_best_covers: 'See the best covers',
      see_the_best_music_genre_covers: 'See the best {{ musicGenre }} covers',
      see_the_latest_covers: 'See the latest covers',
      see_the_latest_music_genre_covers: 'See the latest {{ musicGenre }} covers',
      see_the_rules: 'See the rules',
      share_on: 'Share on',
      signin_button: 'Sign in',
      signin_message: 'Please sign in with your social network account',
      support: 'Support',
      the_artist_or_band_name: 'The artist or band name',
      the_audition_video_description: 'Write something interesting about your video',
      the_audition_video_title: 'The audition title',
      the_best_music_genre_covers: 'The best {{ musicGenre }} covers',
      the_cover_author: 'The cover author',
      the_latest_music_genre_covers: 'The latest {{ musicGenre }} covers',
      the_music_title: 'The music title',
      this_contest_is_not_going_yet: 'This contest is not goind yet!',
      vote_now: 'Vote now!',
      votes: 'votes',
      we_need_more_contestants: 'We need {{ contestantsRemaining }} more contestants',
      you_voted: 'You voted!',
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
        authentication_required: 'You can\'t continue because you are logged out, please login to continue',
        audition_vote_cant_vote_yourself: 'You cant\'t vote yourself',
        page_not_found: 'Page not found',
        internal_error: 'Internal error',
        join_contest_video_not_owned_by_user: 'You can not join the contest using a video that are not owned by you',
        join_contest_video_url_not_valid: 'For now we support only Youtube videos =(',
        join_contest_user_already_in_contest: 'You are already participating in this contest. For questions please contact us',
        unexpected_error: 'An unexpected error happened, please try again later'
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
      by_user: 'por',
      contact: 'Contato',
      cover_by: 'Cover de',
      cover_video_title: 'Cover de {{ author }} da música "{{ music.title }}" de {{ artist.name }}',
      days: 'dias',
      follow_us: 'Siga-nos',
      give_us_your_feedback: 'Nos dê o seu Feedback',
      help_us_to_improve: 'Ajude-nos a melhorar ainda mais o {{ siteName }}',
      help: 'Ajude',
      hours: 'horas',
      indicate_cover: 'Você conhece um cover incrível?',
      indicate_cover_steps: 'Visite a nossa página no Facebook e nos deixe uma mensagem',
      join_contest: 'Entrar no concurso',
      join_contest_signin_google_account: 'Por favor acesse sua conta do Google para poder entrar no concurso',
      join_contest_signin_youtube_account_title: 'Essa é a sua primeira vez?',
      join_contest_signin_youtube_account: 'Por favor deixe-nos associar sua conta do YouTube com a sua conta do Google',
      join_contest_paste_video_url: 'OK, agora você só precisa colar a URL do vídeo do YouTube abaixo!',
      join_now: 'Participe agora!',
      latest_covers: 'Últimos covers',
      latest_covers_week: 'Últimos covers da semana',
      like_us_on_facebook: 'Curta no Facebook',
      minutes: 'minutos',
      more_covers: 'Mais covers',
      more_covers_by: 'Mais covers de',
      more_covers_of: 'Mais covers de',
      more_videos_of_the_contestants: 'Mais vídeos dos participantes do concurso',
      music_genre_artists: 'Artistas {{ musicGenre }}',
      musics: 'musicas',
      on_youtube: 'no YouTube',
      paste_here_the_video_url: 'Cole aqui a URL do vídeo',
      published: 'Publicado',
      results_for: 'resultados para',
      remaining_time: 'Tempo restante:',
      search_for_musics_or_artists: 'Busque por músicas ou artistas',
      see_all_music_genre_artists: 'Veja todos os artistas {{ musicGenre }}',
      see_the_best_covers: 'Veja os melhores covers',
      see_the_best_music_genre_covers: 'Veja os melhores covers {{ musicGenre }}',
      see_the_latest_covers: 'Veja os últimos covers',
      see_the_latest_music_genre_covers: 'Veja os últimos covers {{ musicGenre }}',
      see_the_rules: 'Veja as regras',
      share_on: 'Compartilhe no',
      signin_button: 'Acessar',
      signin_message: 'Por favor acesse com sua conta de rede social',
      support: 'Suporte',
      the_artist_or_band_name: 'O nome do artista ou da banda',
      the_audition_video_description: 'Escreva algo interessante sobre seu vídeo',
      the_audition_video_title: 'O título do vídeo',
      the_best_music_genre_covers: 'Os melhores covers {{ musicGenre }}',
      the_cover_author: 'O autor do cover',
      the_latest_music_genre_covers: 'Os últimos covers {{ musicGenre }}',
      the_music_title: 'O título da música',
      this_contest_is_not_going_yet: 'Este campeonato ainda não está acontecendo!',
      vote_now: 'Vote agora!',
      votes: 'votos',
      we_need_more_contestants: 'Nós precisamos de mais {{ contestantsRemaining }} participantes',
      you_voted: 'Você votou!',
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
        authentication_required: 'Você não pode continuar porque não está logado, por favor faça login para continuar',
        audition_vote_cant_vote_yourself: 'Você não pode votar em si mesmo',
        page_not_found: 'Página não encontrada',
        internal_error: 'Erro interno',
        join_contest_video_not_owned_by_user: 'Você não pode participar de um campeonato com um vídeo publicado em outra conta',
        join_contest_video_url_not_valid: 'Por enquanto suportamos apenas vídeos do YouTube =(',
        join_contest_user_already_in_contest: 'Você já está participando deste concurso. Caso tenha dúvidas entre em contato',
        unexpected_error: 'Um erro inesperado ocorreu, por favor tente novamente'
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
        music_genre: 'Covers {{ musicGenre }}',
        music_genre_rank: 'Os {{ rankType }} covers {{ musicGenre }}',
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