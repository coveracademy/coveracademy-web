{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}
{% set auditionLink = siteUrl + "/pt-br/audition/" + audition.id + "/" + audition.slug %}

{% block content %}
  <h3>Obrigado por se inscrever na competição!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      {{ user.name }}, falta pouco para concorrer aos prêmios.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      O seu vídeo foi enviado para a nossa equipe de revisão. Eles irão analisar se o vídeo está de acordo com as regras descritas no nosso
      <a href="{{ siteUrl }}/pt-br/contest/guideline" target="_blank">guia</a> e possui a qualidade mínima para ser aprovado.
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
      Por favor aguarde, em alguns instantes você receberá um e-mail de confirmação.
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}