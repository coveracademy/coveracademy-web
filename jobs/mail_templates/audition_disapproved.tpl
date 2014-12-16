{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}
{% set auditionLink = siteUrl + "/pt-br/audition/" + audition.id + "/" + audition.slug %}

{% block content %}
  <h3>Sentimos muito =(</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      {{ user.name }}, infelizmente o seu vídeo não foi aprovado.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Nossa equipe analisou o seu vídeo e constatou que não está de acordo com algumas regras descritas no nosso
      <a href="{{ siteUrl }}/pt-br/contest/guideline" target="_blank">guia</a> ou está abaixo da qualidade mínima para ser aprovado.
    </p>
    <p>
      Segue o motivo:
    </p>
    <p>
      {{ reason }}
    </p>
    <p>
      Não desanime, você pode se inscrever com outros vídeos a qualquer momento. Boa sorte!
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}