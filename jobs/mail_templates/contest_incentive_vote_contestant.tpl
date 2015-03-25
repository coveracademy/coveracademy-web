{% extends "base.tpl" %}

{% block content %}
  <h3>É hora de conseguir mais votos!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Faltam apenas <span style="font-size: 25px;">{{ remainingTime }}</span> para terminar a competição. Continue divulgando o seu vídeo para ganhar mais votos.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Aqui está o link da sua audição:
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition | auditionLink }}
      </a>
    </p>
    <p>
      Compartilhe este link na sua rede de contatos para divulgar ainda mais o seu trabalho e chegar cada vez mais perto do prêmio!
    </p>
  </div>
{% endblock %}