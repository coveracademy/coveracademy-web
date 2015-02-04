{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}

{% block content %}
  <h3>A competição começou, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      O seu voto é muito importante e acredite, ele faz a diferença. Ajude-nos a selecionar os competidores mais talentosos dessa competição.
    </p>
    <p>
      Lembre-se que você pode votar em até <span style="font-size: 2em;">5</span> competidores.
      Além disso, não deixe de compartilhar os fantásticos vídeos que você verá a seguir:
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
      Continue nos ajudando a criar a maior comunidade de músicos independentes e pessoas apaixonadas por uma boa música, juntos conseguiremos beneficiar ainda mais os artistas que passam por aqui.
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}