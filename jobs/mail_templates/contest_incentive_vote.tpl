{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}

{% block content %}
  <h3>Falta pouco para terminar a competição!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Faltam apenas <span style="font-size: 25px;">{{ remainingTime }}</span> para terminar a competição. O seu voto é muito importante e pode fazer a diferença.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Não esqueça que você pode votar em até <span style="font-size: 2em;">5</span> competidores, ok?
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}