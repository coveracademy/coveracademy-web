angular
.module('coverAcademy.providers', [])
.provider('$languages', function() {
  var english = {
    id: 'en',
    image: 'en.png',
    table: {
      add_cover: 'Add cover',
      add_new_cover_video: 'Add a new cover video',
      added: 'Added',
      all_artists: 'All artists',
      and_we_have_no_winners: 'And we have no winners',
      auditions: 'Auditions',
      back_to_the_contest_page: 'Back to the contest page',
      be_the_first_to_join_the_contest: 'Be the first to join the contest!',
      best_auditions: 'Best auditions',
      best_covers: 'Best covers',
      best_covers_week: 'Best covers from this week',
      by: 'By',
      by_lowercase: 'by',
      by_user: 'by',
      cover_by: 'Cover by',
      cover_video_title: '{{ author }}\'s cover of "{{ music.title }}" by {{ artist.name }}',
      contest_finished: 'Contest finished',
      days: 'days',
      edit_profile: 'Edit profile',
      first_place: '1st Place',
      first_place_description: 'The author of the audition with the highest score at the end of the contest will win 1st place. The prize money will grow with every new singer entry.',
      give_us_your_feedback: 'Give us your Feedback',
      help_us_to_improve: 'Help us to further improve Cover Academy',
      help_sharing: 'Help sharing',
      hours: 'hours',
      indicate_cover: 'Do you know an amazing cover song?',
      indicate_cover_steps: 'Visit our Facebook page and leave us a message',
      informations_saved_successfully: 'Informations saved successfully',
      join_contest: 'Join contest',
      join_contest_signin_account: 'Sign in with your account to join the contest',
      join_contest_signin_youtube_account_title: 'Is this your first time?',
      join_contest_signin_youtube_account: 'Please let us connect your account with YouTube',
      join_contest_paste_video_url: 'You just need to paste below the URL of your YouTube video!',
      join_now: 'Join now!',
      latest_auditions: 'Latest auditions',
      latest_covers: 'Latest covers',
      latest_covers_week: 'Latest covers from this week',
      member_since: 'Member since',
      minutes: 'minutes',
      more_covers: 'More covers',
      more_covers_by: 'More covers by',
      more_covers_of: 'More covers of',
      music_genre_artists: '{{ musicGenre }} artists',
      musics: 'musics',
      on_youtube: 'on YouTube',
      or: 'or',
      paste_here_the_video_url: 'Paste here the video URL',
      please_dont_share_this_audition_yet: 'Please dont share this audition yet',
      points: 'points',
      published: 'Published',
      results_for: 'results for',
      remaining_time: 'Remaining time',
      remaining_votes: 'Remaining {{ remaining_votes }} votes',
      search_for_musics_or_artists: 'Search for musics or artists',
      second_place: '2nd Place',
      second_place_description: 'The author of the audition with the second highest score at the end of the contest will win 2nd place. The prize money will grow with every new singer entry.',
      see_all_music_genre_artists: 'See all {{ musicGenre }} artists',
      see_the_best_auditions: 'See the best auditions',
      see_the_best_covers: 'See the best covers',
      see_the_best_music_genre_covers: 'See the best {{ musicGenre }} covers',
      see_the_latest_auditions: 'See the latest auditions',
      see_the_latest_covers: 'See the latest covers',
      see_the_latest_music_genre_covers: 'See the latest {{ musicGenre }} covers',
      see_the_guideline: 'See the guideline',
      see_the_prizes: 'See the prizes',
      share_on: 'Share on',
      share_this_contest: 'Share this contest',
      signin_button: 'Sign in',
      signin_message: 'Please sign in with your social network account',
      the_artist_or_band_name: 'The artist or band name',
      the_audition_description: 'Write something interesting about your video',
      the_audition_title: 'The audition title',
      the_best_music_genre_covers: 'The best {{ musicGenre }} covers',
      the_cover_author: 'The cover author',
      the_latest_music_genre_covers: 'The latest {{ musicGenre }} covers',
      the_music_title: 'The music title',
      the_publish_date_must_be_since: 'Remember, the publish date of the video on YouTube should be since',
      third_place: '3rd Place',
      third_place_description: 'The author of the audition with the third highest score at the end of the contest will win 3rd place. The prize money will grow with every new singer entry.',
      this_contest_is_not_happening_yet: 'This contest is not happening yet!',
      this_contest_was_finished: 'This contest was finished!',
      time_remaining_to_start: 'Remaining time to start',
      view_details: 'View details',
      vote_now: 'Vote now!',
      votes: 'votes',
      voting_power: 'Voting power',
      watch_the_audition: 'Watch the audition',
      watch_your_audition: 'Watch your audition',
      we_need_more_contestants_to_begin_the_contest: 'We need {{ contestantsRemaining }} more contestants to begin the contest',
      winners: 'Winners',
      won_a_gold_medal: 'won a <span class="label label-gold">Gold</span> medal',
      won_a_silver_medal: 'won a <span class="label label-silver">Silver</span> medal',
      won_a_bronze_medal: 'won a <span class="label label-bronze">Bronze</span> medal',
      you_are_already_in_the_contest: 'You\'re already in the contest',
      you_are_participating: 'You are participating!',
      you_participated: 'You participated!',
      you_voted: 'You voted!',
      your_audition: 'Your audition',
      your_votes: 'Your votes',
      alerts: {
        changes_saved_successfully: 'Changes saved successfully',
        congratulations_now_you_are_in_the_contest: 'Congratulations, now you are in the contest. Good luck!',
        login_failed: 'Error authenticating, please try again!',
        login_success: 'You are authenticated now!',
        not_authenticated: 'You are trying to access an privileged section, please sign in with your social account!',
        not_authorized: 'You are not authorized to access this section!',
        thank_you_for_voting: 'Thank you for voting, help {{ user }} to win the contest by sharing this page!'
      },
      errors: {
        authentication_required: 'You are not logged in, please login to continue',
        page_not_found: 'Page not found',
        internal_error: 'Internal error',
        join_contest_already_finished: 'The contest was already finished =(',
        join_contest_video_date_is_not_valid: 'The video can not be older or younger than the contest',
        join_contest_video_not_owned_by_user: 'You can not join the contest using a video that are not owned by you',
        join_contest_user_already_in_contest: 'You are already participating in this contest. For questions please contact us',
        unexpected_error: 'An unexpected error happened, please try again later',
        user_auth_account_not_found: 'Account not found, please check your email and password',
        user_auth_password_with_fewer_characteres: 'The password must contains at least 6 characteres',
        user_vote_can_not_vote_for_yourself: 'You can not vote for yourself',
        user_vote_contest_was_finished: 'You can\'t vote because this contest was already finished',
        user_vote_reach_vote_limit: 'You reach the maximum of votes per contest',
        youtube_video_url_not_valid: 'For now we support only Youtube videos =('
      },
      forms: {
        biography: 'Biography',
        cancel: 'Cancel',
        check_email: 'Check email',
        city: 'City',
        click_here_to_see_your_profile: 'Click here to see your profile',
        confirm: 'Confirm',
        confirm_your_password: 'Confirm your password',
        email_sended: 'E-mail sended successfully, please wait for our contact',
        error_sending_email: 'Error sending the e-mail, please try again lately',
        female: 'Female',
        gender: 'Gender',
        let_us_see_if_we_know_your_email: 'Let us see if we know your email.',
        location: 'Location',
        male: 'Male',
        message: 'Message',
        name: 'Name',
        now_you_are_connected_with: 'Now you are connected with',
        ok_we_know_your_email: 'Ok {{ user }}, we know your email. Please confirm with your password.',
        password: 'Password',
        picture: 'Picture',
        register: 'Register',
        save: 'Save',
        save_changes: 'Save changes',
        state: 'State',
        subject: 'Subject',
        tell_something_about_you: 'Tell something about you',
        thank_you: 'Thank you {{ user }}!',
        use_facebook_picture: 'Use Facebook picture',
        use_google_picture: 'Use Google picture',
        use_twitter_picture: 'Use Twitter picture',
        wait_a_moment_you_will_be_redirected: 'Wait a moment, you will be redirected to where you were in 10 seconds',
        we_dont_know_your_email: 'We don\'t know your email, please continue with your registration.',
        welcome_to: 'Welcome to Cover Academy',
        what_is_your_name: 'What is your name?',
        where_are_you: 'Where are you?',
        write_something_about_your_passion_for_music: 'Write something about your passion for music',
        you_are_connecting_with: 'You are connecting with'
      },
      menus: {
        about: 'About',
        contact: 'Contact',
        contest: 'Contest',
        contestant: 'Contestant',
        covers: 'Covers',
        follow_us: 'Follow us',
        guideline: 'Guideline',
        like_us_on_facebook: 'Like us on Facebook',
        logout: 'Logout',
        privacy_policy: 'Privacy policy',
        profile: 'Profile',
        settings: 'Settings',
        social_networks: 'Social networks',
        support: 'Support',
        terms_of_use: 'Terms of use',
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
        title: {
          admin: 'Administration console',
          add_cover: 'Add a new cover',
          artist: 'The {{ rankType }} covers of musics by {{ artist }}',
          artists_all: 'All artists',
          artists_music_genre: '{{ musicGenre }} artists',
          contact: 'Contact us, give us your feedback',
          cover: '{{ author }}\'s cover of "{{ music }}" by {{ artist }}',
          covers: 'The best covers in one place',
          covers_rank: 'The {{ rankType }} covers from this week',
          guideline: 'Read our contest guideline and find out how to participate!',
          index: 'Join our music contest now!',
          join_contest: 'Join the contest now!',
          music: 'The {{ rankType }} covers of "{{ music }}" by {{ artist }}',
          music_genre: '{{ musicGenre }} cover songs',
          music_genre_rank: 'The {{ rankType }} {{ musicGenre }} cover songs',
          privacy_policy: 'Privacy policy',
          search: 'Search results for "{{ searchQuery }}"',
          terms_of_use: 'Terms of use'
        },
        description: {
          contest: 'Cover Academy is the first website in Brazil to promote online music competitions. Join and compete for prizes or be a judge and help us pick the winners.',
          guideline: '@:seo.description.contest',
          join_contest: '@:seo.description.contest'
        },
        keywords: {
          contest: 'singing contest, music contest, singing competition, music competition, singing battle, music battle, cover battle, cover competition, cover contest, music contest, music competition, online music contest, online singing contest, online music competition, online singing competition, talent show, cover music, cover song',
          guideline: '@:seo.keywords.contest',
          join_contest: '@:seo.keywords.contest'
        }
      }
    }
  };
  var portuguese = {
    id: 'pt-br',
    image: 'pt-br.png',
    table: {
      add_cover: 'Adicionar cover',
      add_new_cover_video: 'Adicionar um novo vídeo de cover',
      added: 'Adicionado',
      all_artists: 'Todos os artistas',
      and_we_have_no_winners: 'E não tivemos nenhum vencedor',
      auditions: 'Audições',
      back_to_the_contest_page: 'Volte para a página da competição',
      be_the_first_to_join_the_contest: 'Seja o primeiro a entrar na competição!',
      best_auditions: 'Melhores audições',
      best_covers: 'Melhores covers',
      best_covers_week: 'Melhores covers da semana',
      by: 'Por',
      by_lowercase: 'de',
      by_user: 'por',
      cover_by: 'Cover de',
      cover_video_title: 'Cover de {{ author }} da música "{{ music.title }}" de {{ artist.name }}',
      contest_finished: 'Competição finalizada',
      days: 'dias',
      edit_profile: 'Editar perfil',
      first_place: 'Primeiro lugar',
      first_place_description: 'O autor da audição com a maior pontuação no final do concurso vencerá em primeiro lugar. O prêmio em dinheiro aumentará com a entrada de novos competidores.',
      give_us_your_feedback: 'Nos dê o seu Feedback',
      help_us_to_improve: 'Ajude-nos a melhorar ainda mais o Cover Academy',
      help_sharing: 'Ajude compartilhando',
      hours: 'horas',
      indicate_cover: 'Você conhece um cover incrível?',
      indicate_cover_steps: 'Visite a nossa página no Facebook e nos deixe uma mensagem',
      informations_saved_successfully: 'Informações foram salvas com sucesso',
      join_contest: 'Entrar na competição',
      join_contest_signin_account: 'Acesse sua conta para poder entrar na competição',
      join_contest_signin_youtube_account_title: 'Essa é a sua primeira vez?',
      join_contest_signin_youtube_account: 'Por favor, deixe-nos conectar a sua conta com o YouTube',
      join_contest_paste_video_url: 'Você só precisa colar abaixo a URL do seu vídeo no YouTube!',
      join_now: 'Participe agora!',
      latest_auditions: 'Audições mais recentes',
      latest_covers: 'Últimos covers',
      latest_covers_week: 'Últimos covers da semana',
      member_since: 'Membro há',
      minutes: 'minutos',
      more_covers: 'Mais covers',
      more_covers_by: 'Mais covers de',
      more_covers_of: 'Mais covers de',
      music_genre_artists: 'Artistas {{ musicGenre }}',
      musics: 'músicas',
      on_youtube: 'no YouTube',
      or: 'ou',
      paste_here_the_video_url: 'Cole aqui a URL do vídeo',
      please_dont_share_this_audition_yet: 'Por favor, ainda não compartilhe esta apresentação',
      points: 'pontos',
      published: 'Publicado',
      results_for: 'resultados para',
      remaining_time: 'Tempo restante',
      remaining_votes: 'Restam {{ remaining_votes }} votos',
      search_for_musics_or_artists: 'Busque por músicas ou artistas',
      second_place: 'Segundo lugar',
      second_place_description: 'O autor da audição com a segunda maior pontuação no final do concurso vencerá em segundo lugar. O prêmio em dinheiro aumentará com a entrada de novos competidores.',
      see_all_music_genre_artists: 'Veja todos os artistas {{ musicGenre }}',
      see_the_best_auditions: 'Veja as melhores audições',
      see_the_best_covers: 'Veja os melhores covers',
      see_the_best_music_genre_covers: 'Veja os melhores covers {{ musicGenre }}',
      see_the_latest_auditions: 'Veja as audições mais recentes',
      see_the_latest_covers: 'Veja os últimos covers',
      see_the_latest_music_genre_covers: 'Veja os últimos covers {{ musicGenre }}',
      see_the_guideline: 'Veja o guia',
      see_the_prizes: 'Veja os prêmios',
      share_on: 'Compartilhe no',
      share_this_contest: 'Compartilhe esta competição',
      signin_button: 'Acessar',
      signin_message: 'Por favor acesse com sua conta de rede social',
      the_artist_or_band_name: 'O nome do artista ou da banda',
      the_audition_description: 'Escreva algo interessante sobre seu vídeo',
      the_audition_title: 'O título do vídeo',
      the_best_music_genre_covers: 'Os melhores covers {{ musicGenre }}',
      the_cover_author: 'O autor do cover',
      the_latest_music_genre_covers: 'Os últimos covers {{ musicGenre }}',
      the_music_title: 'O título da música',
      the_publish_date_must_be_since: 'Lembre-se, a data de publicação do vídeo no YouTube deve ser a partir de',
      third_place: 'Terceiro lugar',
      third_place_description: 'O autor da audição com a terceira maior pontuação no final do concurso vencerá em terceiro lugar. O prêmio em dinheiro aumentará com a entrada de novos competidores.',
      this_contest_is_not_happening_yet: 'Esta competição ainda não está acontecendo!',
      this_contest_was_finished: 'Esta competição acabou!',
      time_remaining_to_start: 'Tempo restante para iniciar',
      view_details: 'Ver detalhes',
      vote_now: 'Vote agora!',
      votes: 'votos',
      voting_power: 'Poder de voto',
      watch_the_audition: 'Assista ao vídeo',
      watch_your_audition: 'Assista ao seu vídeo',
      we_need_more_contestants_to_begin_the_contest: 'Precisamos de mais {{ contestantsRemaining }} participantes para iniciar a competição',
      winners: 'Vencedores',
      won_a_gold_medal: 'ganhou uma medalha de <span class="label label-gold">Ouro</span>',
      won_a_silver_medal: 'ganhou uma medalha de <span class="label label-silver">Prata</span>',
      won_a_bronze_medal: 'ganhou uma medalha de <span class="label label-bronze">Bronze</span>',
      you_are_already_in_the_contest: 'Você já está na competição',
      you_are_participating: 'Você está participando!',
      you_participated: 'Você participou!',
      you_voted: 'Você votou!',
      your_audition: 'Sua audição',
      your_votes: 'Seus votos',
      alerts: {
        changes_saved_successfully: 'Alterações atualizadas com sucesso',
        congratulations_now_you_are_in_the_contest: 'Parabéns, agora você está participando da competição. Boa sorte!',
        login_failed: 'Erro ao autenticar, por favor tente novamente!',
        login_success: 'Você está autenticado agora!',
        not_authenticated: 'Você está tentando acessar uma seção privilegiada, por favor acesse sua conta de rede social!',
        not_authorized: 'Você não tem autorização para acessar esta seção!',
        thank_you_for_voting: 'Obrigado pelo seu voto, ajude {{ user }} a vencer a competição compartilhando esta página!'
      },
      errors: {
        authentication_required: 'Você não está logado, por favor faça login para continuar',
        page_not_found: 'Página não encontrada',
        internal_error: 'Erro interno',
        join_contest_already_finished: 'A competição já foi finalizada =(',
        join_contest_video_date_is_not_valid: 'O vídeo não pode ser mais antigo ou mais novo que a competição',
        join_contest_video_not_owned_by_user: 'Você não pode participar de uma competição com um vídeo publicado em outra conta',
        join_contest_user_already_in_contest: 'Você já está participando dessa competição. Caso tenha dúvidas entre em contato',
        unexpected_error: 'Um erro inesperado ocorreu, por favor tente novamente',
        user_auth_account_not_found: 'Conta não encontrada, por favor verifique seu email e senha',
        user_auth_password_with_fewer_characteres: 'A senha deve conter no mínimo 6 caracteres',
        user_vote_can_not_vote_for_yourself: 'Você não pode votar em si mesmo',
        user_vote_contest_was_finished: 'Você não pode votar porque esta competição já foi finalizado',
        user_vote_reach_vote_limit: 'Você alcançou o máximo de votos por competição',
        youtube_video_url_not_valid: 'Por enquanto suportamos apenas vídeos do YouTube =('
      },
      forms: {
        biography: 'Biografia',
        cancel: 'Cancelar',
        check_email: 'Verificar email',
        city: 'Cidade',
        click_here_to_see_your_profile: 'Clique aqui para ver o seu perfil',
        confirm: 'Confirmar',
        confirm_your_password: 'Confirme sua senha',
        email_sended: 'E-mail enviado com sucesso, aguarde o nosso contato',
        error_sending_email: 'Erro ao enviar o e-mail, por favor tente novamente mais tarde',
        female: 'Feminino',
        gender: 'Gênero',
        let_us_see_if_we_know_your_email: 'Deixe-nos verificar se conhecemos o seu email',
        location: 'Localização',
        male: 'Masculino',
        message: 'Mensagem',
        name: 'Nome',
        now_you_are_connected_with: 'Agora você está conectado com o',
        ok_we_know_your_email: 'Certo {{ user }}, nós conhecemos o seu email. Por favor confirme com sua senha.',
        password: 'Senha',
        picture: 'Foto',
        register: 'Registrar',
        save: 'Salvar',
        save_changes: 'Salvar alterações',
        state: 'Estado',
        subject: 'Assunto',
        tell_something_about_you: 'Conte algo sobre você',
        thank_you: 'Obrigado {{ user }}!',
        use_facebook_picture: 'Usar a foto do Facebook',
        use_google_picture: 'Usar a foto do Google',
        use_twitter_picture: 'Usar a foto do Twitter',
        wait_a_moment_you_will_be_redirected: 'Você será redirecionado para onde estava em 10 segundos',
        we_dont_know_your_email: 'Nós não conhecemos o seu email, por favor continue com o seu cadastro.',
        welcome_to: 'Bem-vindo ao Cover Academy',
        what_is_your_name: 'Qual é o seu nome?',
        where_are_you: 'Onde você está?',
        write_something_about_your_passion_for_music: 'Escreva algo sobre a sua paixão por música',
        you_are_connecting_with: 'Você está conectado com o'
      },
      menus: {
        about: 'Sobre',
        contact: 'Contato',
        contest: 'Competição',
        contestant: 'Competidores',
        covers: 'Covers',
        follow_us: 'Siga-nos',
        guideline: 'Guia',
        like_us_on_facebook: 'Curta no Facebook',
        logout: 'Sair',
        privacy_policy: 'Política de privacidade',
        profile: 'Perfil',
        settings: 'Configurações',
        social_networks: 'Redes sociais',
        support: 'Suporte',
        terms_of_use: 'Termos de uso',
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
        title: {
          admin: 'Console de administração',
          add_cover: 'Adicione um novo cover',
          artist: 'Os {{ rankType }} covers das músicas de {{ artist }}',
          artists_all: 'Todos os artistas',
          artists_music_genre: 'Artistas {{ musicGenre }}',
          contact: 'Entre em contato, nos dê o seu feedback',
          cover: 'Cover de {{ author }} da música "{{ music }}" de {{ artist }}',
          covers: 'Os melhores covers em um só lugar',
          covers_rank: 'Os {{ rankType }} covers da semana',
          guideline: 'Leia o nosso guia da competição e saiba como participar!',
          index: 'Entre na nossa competição de música agora!',
          join_contest: 'Participe agora da competição!',
          music: 'Os {{ rankType }} covers da música "{{ music }}" de {{ artist }}',
          music_genre: 'Covers {{ musicGenre }}',
          music_genre_rank: 'Os {{ rankType }} covers {{ musicGenre }}',
          privacy_policy: 'Política de privacidade',
          search: 'Resultados da busca por "{{ searchQuery }}"',
          terms_of_use: 'Termos de uso'
        },
        description: {
          contest: 'Cover Academy é o primeiro website do Brasil a promover competições online de música. Participe e concorra a prêmios ou seja um juiz e ajude-nos a escolher os vencedores.',
          guideline: '@:seo.description.contest',
          join_contest: '@:seo.description.contest'
        },
        keywords: {
          contest: 'competição de canto, competição de música, concurso de canto, concurso de música, batalha de canto, batalha de música, batalha cover, competição cover, campeonato cover, campeonato de música, campeonato online de música, concurso online de música, competição online de música, show de talentos, música cover',
          guideline: '@:seo.keywords.contest',
          join_contest: '@:seo.keywords.contest'
        }
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