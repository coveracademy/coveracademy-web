{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}
{% set auditionLink = siteUrl + "/pt-br/audition/" + audition.id + "/" + audition.slug %}

{% block content %}
  <h3>É hora de conseguir mais votos!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Faltam apenas <span style="font-size: 25px;">{{ remainingTime }}</span> para terminar a competição. Continue divulgando o seu vídeo para ganhar mais votos.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Aqui está o link da sua audição:
      <a href="{{ auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ auditionLink }}
      </a>
    </p>
    <p>
      Compartilhe este link na sua rede de contatos para divulgar ainda mais o seu trabalho e chegar cada vez mais perto do prêmio!
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}