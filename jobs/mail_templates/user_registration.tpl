{% extends "base.tpl" %}

{% block content %}
  <h3>Bem-vindo ao Cover Academy!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Olá {{ user.name }}, obrigado por fazer parte da nossa comunidade.
    </p>
    <p>
      Música é a paixão de milhões de pessoas no mundo inteiro. Infelizmente nem todos conseguem ganhar a vida fazendo o que mais amam, por isso viemos com o objetivo de descobrir e promover incríveis talentos.
    </p>
    <h3>
      Nós promovemos competições online de música e oferecemos prêmios que vão desde dinheiro a instrumentos musicais.
    </h3>
    <p>
      Se você gosta de cantar ou tocar algum instrumento e ainda quer concorrer a prêmios, conheça um pouco mais sobre o projeto e as competições lendo o nosso
      <a href="{{ siteUrl }}/pt-br/contest/guideline" target="_blank">guia</a>.
    </p>
    <p>
      Você também pode ser um juíz e nos ajudar a escolher os vencedores, participe!
    </p>
    {% if verify %}
    <p>
      Curtiu a ideia? Agora confirme o seu email para conseguir votar nos competidores e participar das competições de música do Cover Academy.
    </p>
    <div style="text-align: center;">
      <a href="{{ siteUrl }}/pt-br/verify?token={{ token }}" style="padding: 10px 16px; font-size: 18px; line-height: 1.33; border-radius: 6px; color: #fff; background-color: #5bc0de; border-color: #46b8da; display: inline-block; margin-bottom: 0; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; text-decoration: none;">
        Confirmar email
      </a>
    </div>
    {% endif %}
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}