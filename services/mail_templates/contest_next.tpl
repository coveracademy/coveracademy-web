{% extends "base.tpl" %}

{% block content %}
  <h3>%recipient.name%, prepare-se!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Falta muito pouco para iniciar a competição. Prepare-se para ser visto pelo Brasil inteiro e conquistar votos da comunidade Cover Academy com o seu talento. Aproveite para divulgar ainda mais o seu trabalho e trocar experiência com os demais competidores.
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Confira novamente os prêmios da competição:
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
      Curtiu? Não esqueça de sempre acompanhar o projeto Cover Academy através do site e redes sociais.
    </p>
    <p>
      Continue nos ajudando a criar a maior comunidade de músicos independentes e pessoas apaixonadas por música. Juntos conseguiremos beneficiar ainda mais os artistas que fazem parte disso.
    </p>
  </div>
{% endblock %}