{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}

{% block content %}
  <h3>A competição terminou, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Obrigado de coração por ter participado da nossa competição.
      Esperamos que tenha realmente gostado de participar e queremos vê-lo nas próximas competições.
    </p>
    <p>
      Confira o resultado clicando no link abaixo:
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Não esqueça de sempre acompanhar o projeto Cover Academy através do site e redes sociais.
    </p>
    <p>
      Continue nos ajudando a criar a maior comunidade de músicos independentes e apaixonados por música, juntos com certeza conseguiremos ajudar os nossos talentosos artistas.
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}