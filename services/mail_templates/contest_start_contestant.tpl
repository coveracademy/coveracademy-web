{% extends "base.tpl" %}

{% block content %}
  <h3>{{ user.name }}, a competição começou!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Obrigado, a sua participação é muito importante para nós. O que seria do projeto sem você?
    </p>
    <p>
      Agora prepare-se que um multirão de pessoas verá o seu vídeo.
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
      Compartilhe este link na sua rede de contatos para ganhar votos e conquistar o prêmio. Desejamos boa sorte!
    </p>
  </div>
{% endblock %}