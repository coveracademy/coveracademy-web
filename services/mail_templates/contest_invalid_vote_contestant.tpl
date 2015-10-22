{% extends "base.tpl" %}

{% block content %}
  <h3>Existem %recipient.totalUsers% votos inválidos na sua audição!!!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      É necessário votar em no mínimo <span style="font-size: 25px;">DOIS</span> competidores para ter os votos validados. Existem usuários que votaram apenas na sua audição.
    </p>
    <p>
      Nós já repassamos essa informação para todos os usuários, mas pedimos que nos ajude reforçando isso.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="%recipient.auditionUrl%" target="_blank" style="text-decoration: none;">
        %recipient.auditionTitle%
      </a>
    </p>
  </div>
{% endblock %}