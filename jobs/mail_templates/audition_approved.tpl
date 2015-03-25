{% extends "base.tpl" %}

{% block content %}
  <h3>Parabéns, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      O seu vídeo foi aprovado, seja bem-vindo à competição!
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
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
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition | auditionLink }}
      </a>
    </p>
    <p>
      Assim que a competição começar compartilhe este link na sua rede de contatos. Tenho certeza que você conquistará alguns votos, boa sorte!
    </p>
  </div>
{% endblock %}