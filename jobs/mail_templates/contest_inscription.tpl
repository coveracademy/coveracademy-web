{% extends "base.tpl" %}

{% block content %}
  <h3>Vamos lá, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Você já pode se inscrever na competição online de música do Cover Academy. Se você não puder ou não quiser participar, divulgue a competição para os seus amigos, ficaremos muito grato por isso!
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Confira os prêmios para os três primeiros colocados:
    </p>
    {% for prize in contest.prizes %}
      <div>
        <h3>
          {{ prize.place }}º lugar:
          {% if prize.full_name %}
            {{ prize.full_name }}
          {% else %}
            {{ prize.name }}
          {% endif %}
        </h3>
        <div style="text-align: center;">
          {% if prize.image %}
            <img src="{{ prize.image }}" style="max-height: 120px;">
          {% endif %}
          {% if prize.sponsor.id %}
            <p style="font-size: 14px;">
              Oferecido por
              <a href="{{ prize.sponsor.website }}" style="text-decoration: none;">{{ prize.sponsor.name }}</a>
            </p>
          {% endif %}
        </div>
        <p>
      </div>
    {% endfor %}
    <p>
      Gostou? Não esqueça de sempre acompanhar o projeto Cover Academy através do site e redes sociais.
    </p>
    <p>
      Continue nos ajudando a criar a maior comunidade de músicos independentes e pessoas apaixonadas por música. Juntos conseguiremos beneficiar ainda mais os artistas que passam por aqui.
    </p>
  </div>
{% endblock %}