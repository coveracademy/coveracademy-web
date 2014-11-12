{% extends "base.tpl" %}

{% block content %}
  <h3>Bem-vindo ao Cover Academy!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Olá {{ user.name }}, obrigado por fazer parte da nossa comunidade. Seja muito bem-vindo!
    </p>
    <p>
      Música é a paixão de milhões de pessoas no mundo inteiro. Infelizmente nem todos conseguem ganhar a vida fazendo o que mais gostam, por isso viemos com o objetivo de descobrir e promover talentos para que todos possam os conhecer e apoiar.
    </p>
    <h3>
      Nós promovemos competições online de música e oferecemos prêmios para os vencedores.
    </h3>
    <p>
      Se você gosta de cantar, se divertir e ainda quer concorrer a prêmios, conheça um pouco mais sobre o projeto e as competições lendo o nosso
      <a href="http://www.coveracademy.com/pt-br/contest/guideline" target="_blank">guia</a>.
    </p>
    <p>
      Você também pode ser um juíz e nos ajudar a escolher vencedores, participe!
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}