{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}
{% set auditionLink = siteUrl + "/pt-br/audition/" + audition.id + "/" + audition.slug %}

{% block content %}
  <h3>A competição começou, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Obrigado, a sua participação é muito importante para nós. O que seria do projeto sem você?
    </p>
    <p>
      Agora prepare-se que um multirão de pessoas verá o seu vídeo.
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
      Compartilhe este link na sua rede de contatos para ganhar votos e conquistar o prêmio. Desejamos boa sorte!
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}