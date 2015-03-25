{% extends "base.tpl" %}

{% block content %}
  <h3>Sentimos muito =(</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      {{ user.name }}, infelizmente o seu vídeo não foi aprovado.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Nossa equipe analisou o seu vídeo e constatou que ele não está de acordo com algumas das regras descritas no nosso
      <a href="{{ siteUrl }}/pt-br/contest/guideline" target="_blank">guia</a>
      ou está abaixo da qualidade mínima para ser aprovado.
    </p>
    <hr/>
    <p>
      Segue o motivo:
    </p>
    <p>
      {{ reason }}
    </p>
    <hr/>
    <p>
      Não desanime, você pode se inscrever com outros vídeos a qualquer momento. Boa sorte!
    </p>
  </div>
{% endblock %}