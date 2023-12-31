{% extends "base.tpl" %}

{% block content %}
  <h3>A competição terminou, %recipient.name%!</h3>
  <div style="color: #555; font-size: 16px;">
    {% if isContestant %}
    <p>
      Obrigado de coração por ter participado da nossa competição.
      Esperamos que tenha realmente gostado de participar e queremos vê-lo nas próximas competições.
    </p>
    {% else %}
    <p>
      Obrigado de coração por fazer parte da nossa comunidade. A equipe do Cover Academy e todos os músicos independentes que estão participando das competições estão felizes por isso.
    </p>
    {% endif %}
    <p>
      Agora confira o resultado da competição clicando no link abaixo:
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Não esqueça de sempre acompanhar o projeto Cover Academy através do site e redes sociais.
    </p>
    <p>
      Continue nos ajudando a criar a maior comunidade de músicos independentes e pessoas apaixonadas por música. Juntos conseguiremos beneficiar ainda mais os artistas que passam por aqui.
    </p>
  </div>
{% endblock %}