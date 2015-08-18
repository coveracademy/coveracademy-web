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
  </div>
{% endblock %}