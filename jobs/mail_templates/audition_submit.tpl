{% extends "base.tpl" %}

{% block content %}
  <h3>Obrigado por se inscrever na competição!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      {{ user.name }}, falta pouco para concorrer aos prêmios.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      O seu vídeo foi enviado para a nossa equipe de revisão. Eles irão analisar se o vídeo está de acordo com as regras descritas no nosso
      <a href="{{ siteUrl }}/pt-br/contest/guideline" target="_blank">guia</a>
      e possui a qualidade mínima para ser aprovado.
    </p>
    <p>
      Aqui está o link da sua audição:
    </p>
    <p>
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition | auditionLink }}
      </a>
    </p>
    <p>
      Aguarde que em breve você receberá um e-mail de confirmação.
    </p>
  </div>
{% endblock %}