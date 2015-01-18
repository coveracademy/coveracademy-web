{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}
{% set auditionLink = siteUrl + "/pt-br/audition/" + audition.id + "/" + audition.slug %}

{% block content %}
  <h3>Parabéns, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      O seu vídeo foi aprovado, seja bem-vindo à competição!
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Nossa equipe analisou o seu vídeo e ele está de acordo com as regras descritas no nosso
      <a href="{{ siteUrl }}/pt-br/contest/guideline" target="_blank">guia</a>.
    </p>
    <p>
      Aqui está o link da sua audição:
    </p>
    <p>
      <a href="{{ auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ auditionLink }}
      </a>
    </p>
    <p>
      Assim que a competição começar compartilhe este link na sua rede de contatos. Tenho certeza que você conquistará alguns votos, boa sorte!
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}