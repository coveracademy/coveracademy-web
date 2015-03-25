{% extends "base.tpl" %}

{% block content %}
  <h3>É hora de apoiar ainda mais os competidores!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      A competição está empatada e por isso será estendida por <span style="font-size: 25px;">1</span> hora. O seu voto é muito importante e pode fazer a diferença.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Não esqueça que você pode votar em até <span style="font-size: 2em;">5</span> competidores!
    </p>
  </div>
{% endblock %}