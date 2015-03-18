{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}

{% block content %}
  <h3>É hora de apoiar ainda mais os competidores!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      A competição está empatada e por isso será estendida por <span style="font-size: 25px;">1</span> hora. O seu voto é muito importante e pode fazer a diferença.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Não esqueça que você pode votar em até <span style="font-size: 2em;">5</span> competidores!
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}