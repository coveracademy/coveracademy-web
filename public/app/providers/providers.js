'use strict'

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
      we_have_no_winners: 'We have no winners',
      auditions: 'Auditions',
      back_to_the_contest_page: 'Back to the contest page',
      be_the_first_to_join_the_contest: 'Be the first to join the contest!',
      become_a_sponsor_and_show_your_brand_here: 'Become a sponsor and show your brand here.',
      best_covers: 'Best covers',
      best_covers_week: 'Best covers from this week',
      by: 'By',
      by_lowercase: 'by',
      by_user: 'by',
      comment: 'Comment',
      companies_that_made_this_contest_happen: 'Companies that made this contest happen',
      contest_finished: 'Contest finished',
      contestant: 'Contestant',
      cover_by: 'Cover by',
      cover_video_title: '{{ author }}\'s cover of "{{ music.title }}" by {{ artist.name }}',
      days: 'days',
      delete: 'delete',
      edit_profile: 'Edit profile',
      fans: 'Fans',
      first_place: '1st Place',
      give_us_your_feedback: 'Give us your Feedback',
      go_to_network_profile: 'Go to {{ user }}\'s {{ network }} profile',
      help_us_to_improve: 'Help us to further improve Cover Academy',
      help_sharing: 'Help sharing',
      help_sharing_on_social_networks: 'Help sharing on social networks',
      hours: 'hours',
      incentive_vote_modal_header: 'Give a chance to the others',
      incentive_vote_modal_description: 'Please do not vote just because someone asked you to vote or because it\'s your friend, help us to select the most talented people in this contest.',
      suggest_cover_video: 'Do you know an amazing cover song?',
      suggest_cover_video_steps: 'Leave us a message with your tip!',
      informations_saved_successfully: 'Informations saved successfully',
      internal_error: 'Internal error',
      join_community_modal_header: 'Join our community!',
      join_community_modal_description: 'Let\'s create the largest community of independent musicians and music lovers. Follow us on social networks!',
      join_contest: 'Join contest',
      join_contest_signin_account: 'Sign in with your account to join the contest',
      join_contest_signin_youtube_account_title: 'Is this your first time?',
      join_contest_signin_youtube_account: 'Please let us connect your account with YouTube',
      join_contest_paste_video_url: 'You just need to paste below the URL of your YouTube video!',
      join_now: 'Join now!',
      lets_create_the_largest_community: 'Let\'s create the largest community of independent musicians and music lovers?',
      latest_auditions: 'Latest auditions',
      latest_contests: 'Latest contests',
      latest_covers: 'Latest covers',
      latest_covers_week: 'Latest covers from this week',
      like_on_facebook: 'Like us on Facebook',
      login_to_post_a_comment: 'Login to post a comment',
      many_auditions_in_this_contest: '{{ totalAuditions }} auditions in this contest',
      meet_the_contestants: 'Meet the contestants',
      meet_the_contestants_description: 'Here are all the people who have participated in a competition',
      member_since: 'Member since',
      minutes: 'minutes',
      more_covers: 'More covers',
      more_covers_by: 'More covers by',
      more_covers_of: 'More covers of',
      music_genre_artists: '{{ musicGenre }} artists',
      musics: 'musics',
      offered_by: 'Offered by',
      on_youtube: 'on YouTube',
      or: 'or',
      page_not_found: 'Page not found',
      paste_here_the_video_url: 'Paste here the video URL',
      please_dont_share_this_audition_yet: 'Please dont share this audition yet.',
      points: 'points',
      published: 'Published',
      random_auditions: 'Random auditions',
      remaining_time: 'Remaining time',
      remaining_votes: 'Remaining {{ remainingVotes }} votes',
      reply: 'reply',
      reply_button: 'Reply',
      results_for: 'results for',
      search_for_musics_or_artists: 'Search for musics or artists',
      second_place: '2nd Place',
      see_all_music_genre_artists: 'See all {{ musicGenre }} artists',
      see_on_sponsors_website: 'See on sponsor\'s website',
      see_the_best_covers: 'See the best covers',
      see_the_best_music_genre_covers: 'See the best {{ musicGenre }} covers',
      see_the_latest_auditions: 'Latest',
      see_the_latest_covers: 'See the latest covers',
      see_the_latest_music_genre_covers: 'See the latest {{ musicGenre }} covers',
      see_the_guideline: 'See the guideline',
      see_the_random_auditions: 'Random',
      see_the_top_rated_auditions: 'Top rated',
      show_the_prizes: 'Show the prizes',
      share_on: 'Share on',
      share_this_contest: 'Share this contest',
      signin_message: 'Please sign in with your Facebook account',
      signin_with: 'Sign in with',
      the_artist_or_band_name: 'The artist or band name',
      the_audition_description: 'Write something about your video',
      the_audition_title: 'The audition title',
      the_best_music_genre_covers: 'The best {{ musicGenre }} covers',
      the_contest_is_drawn: 'The contest is drawn and therefore we extend the time in 1 hour. Now is the time to support the contestants with your vote!',
      the_cover_author: 'The cover author',
      the_latest_music_genre_covers: 'The latest {{ musicGenre }} covers',
      the_music_title: 'The music title',
      the_publish_date_must_be_since: 'Remember, the publish date of the video on YouTube should be since',
      third_place: '3rd Place',
      this_audition_is_under_review_wait_for_approval: 'We are reviewing this audition, wait for approval.',
      top_rated_auditions: 'Top rated auditions',
      total_contestants_and_votes: '{{ totalAuditions }} contestants and {{ totalVotes }} votes',
      this_contest_is_happening_but_we_need_contestants: 'This contest is happening but we need contestants!',
      this_contest_is_not_happening_yet: 'This contest is not happening yet!',
      this_contest_was_finished: 'This contest was finished!',
      time_remaining_to_start: 'Remaining time to start',
      view_details: 'View details',
      vote_now: 'Vote now!',
      votes: 'votes',
      voting_power: 'Voting power',
      waiting_for_approval: 'Waiting for approval',
      want_to_become_a_sponsor: 'Want to become a sponsor?',
      watch_the_audition: 'Watch the audition',
      watch_your_audition: 'Watch your audition',
      we_need_more_contestants_to_begin_the_contest: 'We need {{ contestantsRemaining }} more contestants to begin the contest',
      what_did_you_think_of_user_performance: 'What did you think of {{ user }}\'s performance?',
      winners: 'Winners',
      won_a_gold_medal: 'won a <span class="label label-gold">Gold</span> medal',
      won_a_silver_medal: 'won a <span class="label label-silver">Silver</span> medal',
      won_a_bronze_medal: 'won a <span class="label label-bronze">Bronze</span> medal',
      would_you_like_to_support_this_project: 'Would you like to support this project?',
      write_a_comment: 'Write a comment...',
      write_a_reply: 'Write a reply...',
      you_are_already_in_the_contest: 'You\'re already in the contest',
      you_are_participating: 'You are participating!',
      you_can_still_vote_for_other_contestants: 'Você ainda pode votar em mais {{ remainingVotes }} competidores',
      you_have_already_voted_on_five_contestants: 'You have already voted on 5 contestants',
      you_participated: 'You participated!',
      you_voted: 'You voted!',
      your_audition: 'Your audition',
      your_votes: 'Your votes',
      alerts: {
        changes_saved_successfully: 'Changes saved successfully.',
        confirm_your_email: 'Welcome! Please check your email and confirm your account.',
        congratulations_now_you_are_in_the_contest: 'Congratulations, now you are in the contest. Good luck!',
        email_verified: 'Your email was verified successfully, now you can vote and enter the contest.',
        login_failed: 'Error authenticating, please try again.',
        login_success: 'You are authenticated now.',
        no_i_want_to_use_another_email: 'No, i want to use another email!',
        not_authenticated: 'You are trying to access an privileged section, please sign in with your social account.',
        not_authorized: 'You are not authorized to access this section.',
        thank_you_for_voting: 'Thank you for voting, help {{ user }} to win the contest by sharing this page.',
        use_the_email_to_receive_updates: 'Do you want to use the email {{ user.email }} to receive users and Cover Academy updates?',
        user_not_verified: 'You have not verified your email address. Please check {{ user.email }} to confirm your account.',
        user_not_verified_change_email: 'If this email is incorrect or want to use another, visit your account settings.',
        verification_email_sended: 'Verificaiton email sended successfully.'
      },
      errors: {
        audition_comment_empty: 'You can not leave an empty comment',
        audition_comment_user_not_verified: 'You can not comment because you have not verified your email yet, please check in {{ user.email }}. You can change your email or resend an verification email going to your account settings.',
        audition_vote_can_not_vote_for_yourself: 'You can not vote for yourself.',
        audition_vote_contest_was_finished: 'You can\'t vote because this contest was already finished.',
        audition_vote_reach_vote_limit: 'You reach the maximum of votes per contest.',
        audition_vote_user_not_verified: 'You can not vote because you have not verified your email yet, please check in {{ user.email }}. You can change your email or resend an verification email going to your account settings.',
        authentication_required: 'You are not logged in, please sign in with your account to continue.',
        join_contest_already_finished: 'The contest was already finished =(',
        join_contest_video_date_is_not_valid: 'The date of the video must be between the dates of acceptance of the videos and the contest end date.',
        join_contest_video_not_owned_by_user: 'You can not join the contest using a video that are not owned by you.',
        join_contest_user_already_in_contest: 'You are already participating in this contest. For questions please contact us.',
        join_contest_user_not_verified: 'You can not join the contest because you have not verified your email yet, please check in {{ user.email }}. You can change your email or resend a verification email going to your account settings.',
        unexpected_error: 'An unexpected error happened, please try again later.',
        user_connect_already_connected: 'Already exists an user connected with this account.',
        user_edit_invalid_username: 'The username can only contain alphanumeric characters (a-z, 0-9) or a period ("."), with at least 5 characters and maximum length of 20.',
        user_verification_email_already_verified: 'Your email was already verified.',
        user_verification_error_sending_verification_email: 'Error sending verification email, please try again later.',
        youtube_video_url_not_valid: 'For now we support only Youtube videos =('
      },
      forms: {
        biography: 'Biography',
        cancel: 'Cancel',
        check_email: 'Check email',
        city: 'City',
        click_here_to_see_your_profile: 'Click here to see your profile',
        connect: 'Connect',
        confirm: 'Confirm',
        disconnect: 'Disconnect',
        edit_email_help: 'If you change this email, we will send you a verification email and you can only use the main features after verify your email again.',
        edit_username_help: 'This name can be defined only once. If you fill now, you can not change later.',
        email: 'Email',
        email_help_with_email: 'Want to use this email to receive our updates? If you choose another, we will send you a verification email and you can only use the main features after verify your email.',
        email_help_without_email: 'We will send you a verification email and you can only use the main features after verify your email.',
        email_sended: 'Email sended successfully, please wait for our contact',
        error_sending_email: 'Error sending the e-mail, please try again lately',
        female: 'Female',
        gender: 'Gender',
        location: 'Location',
        male: 'Male',
        message: 'Message',
        name: 'Name',
        now_you_are_connected_with: 'Now you are connected with',
        optional: 'optional',
        picture: 'Picture',
        please_confirm_some_informations_about_your_account: 'Please confirm some informations about your account.',
        resend_verification_email: 'The verification email has not arrived yet? Send again!',
        save: 'Save',
        save_changes: 'Save changes',
        show_link_in_profile: 'Show link in profile',
        state: 'State',
        subject: 'Subject',
        tell_something_about_you: 'Tell something about you',
        thank_you: 'Thank you {{ user }}!',
        use_facebook_picture: 'Use Facebook picture',
        use_google_picture: 'Use Google picture',
        use_twitter_picture: 'Use Twitter picture',
        username: 'Username',
        username_first_help: 'Users will find your profile page this way:',
        username_second_help: 'This name can be defined only once. If you fill now, you can not change later. Otherwise, just access your account settings.',
        wait_a_moment_you_will_be_redirected: 'Wait a moment, you will be redirected to where you were in 10 seconds',
        we_could_not_get_your_facebook_data: 'We could not get your facebook data',
        welcome_to: 'Welcome to Cover Academy',
        what_is_your_name: 'What is your name?',
        where_are_you: 'Where are you?',
        write_something_about_you: 'Write something about you',
        you_are_connecting_with: 'You are connecting with'
      },
      menus: {
        about: 'About',
        auditions: 'Auditions',
        contact: 'Contact',
        contest: 'Contest',
        contests: 'Contests',
        contestants: 'Contestants',
        covers: 'Covers',
        fans: 'Fans',
        follow_us: 'Follow us',
        guideline: 'Guideline',
        like_on_facebook: 'Like on Facebook',
        follow_on_twitter: 'Follow on Twitter',
        subscribe_on_youtube: 'Subscribe on YouTube',
        logout: 'Logout',
        privacy_policy: 'Privacy policy',
        profile: 'Profile',
        settings: 'Settings',
        social_networks: 'Social networks',
        sponsor: 'Sponsor',
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
          contests: 'See all contests',
          contestants: 'Meet the contestants',
          cover: '{{ author }}\'s cover of "{{ music }}" by {{ artist }}',
          covers: 'The best covers in one place',
          covers_rank: 'The {{ rankType }} covers from this week',
          error_404: 'Page not found',
          error_500: 'Internal error',
          guideline: 'Read our contest guideline and find out how to participate!',
          index: 'Join our online music contest now!',
          join_contest: 'Join the contest now!',
          music: 'The {{ rankType }} covers of "{{ music }}" by {{ artist }}',
          music_genre: '{{ musicGenre }} cover songs',
          music_genre_rank: 'The {{ rankType }} {{ musicGenre }} cover songs',
          privacy_policy: 'Privacy policy',
          search: 'Search results for "{{ searchQuery }}"',
          settings: 'Settings',
          terms_of_use: 'Terms of use'
        },
        description: {
          contest: 'Show off your talent to the world and compete for prizes. Join our online music competition or help us to choose the winners.'
        },
        keywords: {
          contest: 'singing contest, music contest, singing competition, music competition, singing battle, music battle, cover battle, cover competition, cover contest, music contest, music competition, online music contest, online singing contest, online music competition, online singing competition, talent show, cover music, cover song'
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
      we_have_no_winners: 'Não tivemos nenhum vencedor',
      auditions: 'Audições',
      back_to_the_contest_page: 'Volte para a página da competição',
      be_the_first_to_join_the_contest: 'Seja o primeiro a entrar na competição!',
      become_a_sponsor_and_show_your_brand_here: 'Seja um patrocinador e mostre a sua marca aqui.',
      best_covers: 'Melhores covers',
      best_covers_week: 'Melhores covers da semana',
      by: 'Por',
      by_lowercase: 'de',
      by_user: 'por',
      comment: 'Comentar',
      companies_that_made_this_contest_happen: 'Empresas que fizeram esta competição acontecer',
      contest_finished: 'Competição finalizada',
      contestant: 'Competidor',
      cover_by: 'Cover de',
      cover_video_title: 'Cover de {{ author }} da música "{{ music.title }}" de {{ artist.name }}',
      days: 'dias',
      delete: 'remover',
      edit_profile: 'Editar perfil',
      fans: 'Fãs',
      first_place: 'Primeiro lugar',
      give_us_your_feedback: 'Nos dê o seu Feedback',
      go_to_network_profile: 'Ir para o perfil de {{ user }} no {{ network }}',
      help_us_to_improve: 'Ajude-nos a melhorar ainda mais o Cover Academy',
      help_sharing: 'Ajude compartilhando',
      help_sharing_on_social_networks: 'Ajude compartilhando nas redes sociais',
      hours: 'horas',
      incentive_vote_modal_header: 'Dê uma chance aos outros',
      incentive_vote_modal_description: 'Por favor, não vote apenas porque te pediram ou porque é o seu amigo. Ajude-nos a selecionar as pessoas mais talentosas dessa competição.',
      suggest_cover_video: 'Você conhece um cover incrível?',
      suggest_cover_video_steps: 'Deixe-nos uma mensagem com a sua dica!',
      informations_saved_successfully: 'Informações foram salvas com sucesso',
      internal_error: 'Erro interno',
      join_community_modal_header: 'Faça parte da comunidade!',
      join_community_modal_description: 'Vamos criar a maior comunidade de músicos independentes e pessoas apaixonadas por música. Siga-nos nas redes sociais!',
      join_contest: 'Entrar na competição',
      join_contest_signin_account: 'Acesse sua conta para poder entrar na competição',
      join_contest_signin_youtube_account_title: 'Essa é a sua primeira vez?',
      join_contest_signin_youtube_account: 'Por favor, deixe-nos conectar a sua conta com o YouTube',
      join_contest_paste_video_url: 'Você só precisa colar abaixo a URL do seu vídeo no YouTube!',
      join_now: 'Participe agora!',
      lets_create_the_largest_community: 'Vamos criar a maior comunidade de músicos independentes e pessoas apaixonadas por música?',
      latest_auditions: 'Audições mais recentes',
      latest_contests: 'Últimas competições',
      latest_covers: 'Últimos covers',
      latest_covers_week: 'Últimos covers da semana',
      like_on_facebook: 'Curta a nossa página no Facebook',
      login_to_post_a_comment: 'Acesse sua conta para comentar',
      many_auditions_in_this_contest: '{{ totalAuditions }} audições na competição',
      meet_the_contestants: 'Conheça os competidores',
      meet_the_contestants_description: 'Aqui estão todas as pessoas que já participaram de uma competição',
      member_since: 'Membro há',
      minutes: 'minutos',
      more_covers: 'Mais covers',
      more_covers_by: 'Mais covers de',
      more_covers_of: 'Mais covers de',
      music_genre_artists: 'Artistas {{ musicGenre }}',
      musics: 'músicas',
      offered_by: 'Oferecido por',
      on_youtube: 'no YouTube',
      or: 'ou',
      page_not_found: 'Página não encontrada',
      paste_here_the_video_url: 'Cole aqui a URL do vídeo',
      please_dont_share_this_audition_yet: 'Por favor, ainda não compartilhe esta audição.',
      points: 'pontos',
      published: 'Publicado',
      random_auditions: 'Audições aleatórias',
      remaining_time: 'Tempo restante',
      remaining_votes: 'Restam {{ remainingVotes }} votos',
      reply: 'responder',
      reply_button: 'Responder',
      results_for: 'resultados para',
      search_for_musics_or_artists: 'Busque por músicas ou artistas',
      second_place: 'Segundo lugar',
      see_all_music_genre_artists: 'Veja todos os artistas {{ musicGenre }}',
      see_on_sponsors_website: 'Veja no site do patrocinador',
      see_the_best_covers: 'Veja os melhores covers',
      see_the_best_music_genre_covers: 'Veja os melhores covers {{ musicGenre }}',
      see_the_latest_auditions: 'Mais recentes',
      see_the_latest_covers: 'Veja os últimos covers',
      see_the_latest_music_genre_covers: 'Veja os últimos covers {{ musicGenre }}',
      see_the_guideline: 'Veja o guia',
      see_the_random_auditions: 'Aleatórias',
      see_the_top_rated_auditions: 'Mais votadas',
      show_the_prizes: 'Mostrar os prêmios',
      share_on: 'Compartilhe no',
      share_this_contest: 'Compartilhe esta competição',
      signin_message: 'Por favor, acesse com sua conta do Facebook',
      signin_with: 'Acessar com',
      the_artist_or_band_name: 'O nome do artista ou da banda',
      the_audition_description: 'Escreva algo sobre seu vídeo',
      the_audition_title: 'O título do vídeo',
      the_best_music_genre_covers: 'Os melhores covers {{ musicGenre }}',
      the_contest_is_drawn: 'A competição está empatada e por isso estendemos o tempo em 1 hora. Agora é a hora de apoiar os competidores com o seu voto!',
      the_cover_author: 'O autor do cover',
      the_latest_music_genre_covers: 'Os últimos covers {{ musicGenre }}',
      the_music_title: 'O título da música',
      the_publish_date_must_be_since: 'Lembre-se, a data de publicação do vídeo no YouTube deve ser a partir de',
      third_place: 'Terceiro lugar',
      this_audition_is_under_review_wait_for_approval: 'Estamos revisando esta audição, espere pela aprovação.',
      top_rated_auditions: 'Audições mais votadas',
      this_contest_is_happening_but_we_need_contestants: 'Esta competição está acontecendo, mas precisamos de competidores!',
      this_contest_is_not_happening_yet: 'Esta competição ainda não está acontecendo!',
      this_contest_was_finished: 'Esta competição acabou!',
      time_remaining_to_start: 'Tempo restante para iniciar',
      total_contestants_and_votes: '{{ totalAuditions }} competidores e {{ totalVotes }} votos',
      view_details: 'Ver detalhes',
      vote_now: 'Vote agora!',
      votes: 'votos',
      voting_power: 'Poder de voto',
      waiting_for_approval: 'Aguardando aprovação',
      want_to_become_a_sponsor: 'Quer ser um patrocinador?',
      watch_the_audition: 'Assista ao vídeo',
      watch_your_audition: 'Assista ao seu vídeo',
      we_need_more_contestants_to_begin_the_contest: 'Precisamos de mais {{ contestantsRemaining }} participantes para iniciar a competição',
      what_did_you_think_of_user_performance: 'O que você achou da performance de {{ user }}?',
      winners: 'Vencedores',
      won_a_gold_medal: 'ganhou uma medalha de <span class="label label-gold">Ouro</span>',
      won_a_silver_medal: 'ganhou uma medalha de <span class="label label-silver">Prata</span>',
      won_a_bronze_medal: 'ganhou uma medalha de <span class="label label-bronze">Bronze</span>',
      would_you_like_to_support_this_project: 'Você gostaria de apoiar este projeto?',
      write_a_comment: 'Escreva um comentário...',
      write_a_reply: 'Escreva uma resposta...',
      you_are_already_in_the_contest: 'Você já está na competição',
      you_are_participating: 'Você está participando!',
      you_can_still_vote_for_other_contestants: 'You can still vote for {{ remainingVotes }} other contestants',
      you_have_already_voted_on_five_contestants: 'Você já votou em 5 competidores',
      you_participated: 'Você participou!',
      you_voted: 'Você votou!',
      your_audition: 'Sua audição',
      your_votes: 'Seus votos',
      alerts: {
        changes_saved_successfully: 'Informações atualizadas com sucesso.',
        confirm_your_email: 'Bem-vindo! Por favor, verifique o seu email e confirme a sua conta.',
        congratulations_now_you_are_in_the_contest: 'Parabéns, agora você está participando da competição. Boa sorte!',
        email_verified: 'Seu email foi verificado com sucesso, agora você pode votar nos competidores e participar da competição.',
        login_failed: 'Erro ao autenticar, por favor tente novamente.',
        login_success: 'Você está autenticado agora.',
        no_i_want_to_use_another_email: 'Não, eu quero utilizar outro email!',
        not_authenticated: 'Você está tentando acessar uma seção privilegiada, por favor acesse sua conta de rede social.',
        not_authorized: 'Você não tem autorização para acessar esta seção.',
        thank_you_for_voting: 'Obrigado pelo seu voto, ajude {{ user }} a vencer a competição compartilhando esta página.',
        use_the_email_to_receive_updates: 'Você quer utilizar o email {{ user.email }} para receber atualizações dos usuários e do Cover Academy?',
        user_not_verified: 'Você ainda não verificou o seu email. Por favor acesse {{ user.email }} e confirme a sua conta.',
        user_not_verified_change_email: 'Se este email está incorreto ou deseja utilizar outro, acesse as configurações da sua conta.',
        verification_email_sended: 'Email de verificação enviado com sucesso.'
      },
      errors: {
        audition_comment_empty: 'Você não pode deixar um comentário vazio',
        audition_comment_user_not_verified: 'Você não pode comentar porque ainda não confirmou o seu email, por favor verifique em {{ user.email }}. Você pode mudar o seu email ou reenviar um email de verificação indo nas configurações da sua conta.',
        audition_vote_can_not_vote_for_yourself: 'Você não pode votar em si mesmo.',
        audition_vote_contest_was_finished: 'Você não pode votar porque esta competição já foi finalizado.',
        audition_vote_reach_vote_limit: 'Você alcançou o máximo de votos por competição.',
        audition_vote_user_not_verified: 'Você não pode votar porque ainda não confirmou o seu email, por favor verifique em {{ user.email }}. Você pode mudar o seu email ou reenviar um email de verificação indo nas configurações da sua conta.',
        authentication_required: 'Você não está logado, por favor acesse sua conta para continuar.',
        join_contest_already_finished: 'A competição já foi finalizada =(',
        join_contest_video_date_is_not_valid: 'A data do vídeo deve estar entre as datas de aceitação de vídeos e a data de término da competição.',
        join_contest_video_not_owned_by_user: 'Você não pode participar de uma competição com um vídeo publicado em outra conta.',
        join_contest_user_already_in_contest: 'Você já está participando dessa competição. Caso tenha dúvidas entre em contato.',
        join_contest_user_not_verified: 'Você não pode entrar na competição porque ainda não confirmou o seu email, por favor verifique em {{ user.email }}. Você pode mudar o seu email ou reenviar um email de verificação indo nas configurações da sua conta.',
        unexpected_error: 'Um erro inesperado ocorreu, por favor tente novamente.',
        user_connect_already_connected: 'Já existe um usuário conectado com esta conta.',
        user_edit_invalid_username: 'O username só pode conter caracteres alfanuméricos (a-z, 0-9) ou ponto ("."), com no mínimo 5 e no máximo 20 caracteres.',
        user_verification_email_already_verified: 'Seu email já foi verificado.',
        user_verification_error_sending_verification_email: 'Erro ao enviar email de confirmação, por favor tente novamente mais tarde.',
        youtube_video_url_not_valid: 'Por enquanto suportamos apenas vídeos do YouTube =('
      },
      forms: {
        biography: 'Biografia',
        cancel: 'Cancelar',
        check_email: 'Verificar email',
        city: 'Cidade',
        click_here_to_see_your_profile: 'Clique aqui para ver o seu perfil',
        connect: 'Conectar',
        confirm: 'Confirmar',
        disconnect: 'Desconectar',
        edit_email_help: 'Se você alterar este email, nós enviaremos um email de verificação e você só poderá utilizar as principais funcionalidades após verificar novamente o seu email.',
        edit_username_help: 'Este nome só pode ser definido uma vez. Se você preencher agora, não poderá alterar posteriormente.',
        email: 'Email',
        email_help_with_email: 'Deseja utilizar este email para receber nossas atualizações? Se você escolher outro, nós enviaremos um email de verificação e você só poderá utilizar as principais funcionalidades após verificar o seu email.',
        email_help_without_email: 'Nós enviaremos um email de verificação e você só poderá utilizar as principais funcionalidades após confirmar o seu email.',
        email_sended: 'Email enviado com sucesso, aguarde o nosso contato',
        error_sending_email: 'Erro ao enviar o e-mail, por favor tente novamente mais tarde',
        female: 'Feminino',
        gender: 'Gênero',
        location: 'Localização',
        male: 'Masculino',
        message: 'Mensagem',
        name: 'Nome',
        now_you_are_connected_with: 'Agora você está conectado com o',
        optional: 'opcional',
        picture: 'Foto',
        please_confirm_some_informations_about_your_account: 'Por favor, confirme algumas informações sobre a sua conta.',
        resend_verification_email: 'O email de verificação ainda não chegou? Envie novamente!',
        save: 'Salvar',
        save_changes: 'Salvar alterações',
        show_link_in_profile: 'Exibir link no perfil',
        state: 'Estado',
        subject: 'Assunto',
        tell_something_about_you: 'Conte algo sobre você',
        thank_you: 'Obrigado {{ user }}!',
        use_facebook_picture: 'Usar a foto do Facebook',
        use_google_picture: 'Usar a foto do Google',
        use_twitter_picture: 'Usar a foto do Twitter',
        username: 'Username',
        username_first_help: 'Os usuários poderão chegar até a página do seu perfil assim:',
        username_second_help: 'Este nome só pode ser definido uma vez. Se você preencher agora, não poderá alterar posteriormente. Caso contrário, basta acessar as configurações da sua conta.',
        wait_a_moment_you_will_be_redirected: 'Você será redirecionado para onde estava em 10 segundos',
        we_could_not_get_your_facebook_data: 'Nós não conseguimos obter seus dados do Facebook',
        welcome_to: 'Bem-vindo ao Cover Academy',
        what_is_your_name: 'Qual é o seu nome?',
        where_are_you: 'Onde você está?',
        write_something_about_you: 'Escreva algo sobre a você',
        you_are_connecting_with: 'Você está conectado com o'
      },
      menus: {
        about: 'Sobre',
        auditions: 'Audições',
        contact: 'Contato',
        contest: 'Competição',
        contests: 'Competições',
        contestants: 'Competidores',
        covers: 'Covers',
        fans: 'Fãs',
        follow_us: 'Siga-nos',
        guideline: 'Guia',
        like_on_facebook: 'Curta no Facebook',
        follow_on_twitter: 'Siga no Twitter',
        subscribe_on_youtube: 'Inscreva-se no YouTube',
        logout: 'Sair',
        privacy_policy: 'Política de privacidade',
        profile: 'Perfil',
        settings: 'Configurações',
        social_networks: 'Redes sociais',
        sponsor: 'Patrocínio',
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
          contests: 'Veja todas as competições',
          contestants: 'Conheça os competidores',
          cover: 'Cover de {{ author }} da música "{{ music }}" de {{ artist }}',
          covers: 'Os melhores covers em um só lugar',
          covers_rank: 'Os {{ rankType }} covers da semana',
          error_404: 'Página não encontrada',
          error_500: 'Erro interno',
          guideline: 'Leia o nosso guia da competição e saiba como participar!',
          index: 'Entre agora na nossa competição online de música!',
          join_contest: 'Participe agora da competição!',
          music: 'Os {{ rankType }} covers da música "{{ music }}" de {{ artist }}',
          music_genre: 'Covers {{ musicGenre }}',
          music_genre_rank: 'Os {{ rankType }} covers {{ musicGenre }}',
          privacy_policy: 'Política de privacidade',
          search: 'Resultados da busca por "{{ searchQuery }}"',
          settings: 'Configurações',
          terms_of_use: 'Termos de uso'
        },
        description: {
          contest: 'Mostre o seu talento para o mundo e concorra a prêmios. Participe da nossa competição online de música ou ajude-nos a escolher os vencedores.'
        },
        keywords: {
          contest: 'competição de canto, competição de música, concurso de canto, concurso de música, batalha de canto, batalha de música, batalha cover, competição cover, campeonato cover, campeonato de música, campeonato online de música, concurso online de música, competição online de música, show de talentos, música cover'
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
        for(var index in languages) {
          if(languages[index].id === languageId) {
            return true;
          }
        }
        return false;
      }
    }
  };
});