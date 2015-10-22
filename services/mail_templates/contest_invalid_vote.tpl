{% extends "base.tpl" %}

{% block content %}
  <h3>%recipient.name%, seu voto em %recipient.contestant% ainda não é válido!!!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      É necessário votar em no mínimo <span style="font-size: 25px;">DOIS</span> competidores para ter o seu voto validado.
    </p>
    <p>
      Acesse a página da competição e vote em mais um competidor. Não demora nem 1 minuto!
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Não esqueça que você também pode votar em até <span style="font-size: 2em;">5</span> competidores!
    </p>
  </div>
{% endblock %}