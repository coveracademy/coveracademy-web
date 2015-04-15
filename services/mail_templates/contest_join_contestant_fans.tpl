{% extends "base.tpl" %}

{% block content %}
  <h3>{{ contestant.name }} acabou de entrar na competição!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Veja a participação de {{ contestant.name }} na competição do Cover Academy e mostre o seu apoio.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        <img src="{{ audition.medium_thumbnail }}">
      </a>
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition.title }}
      </a>
    </p>
    <p>
      Para assistir aos demais competidores acesse a competição:
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
  </div>
{% endblock %}