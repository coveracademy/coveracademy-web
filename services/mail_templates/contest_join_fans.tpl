{% extends "base.tpl" %}

{% block content %}
  <h3>Apoie os competidores</h3>
  <div style="color: #555; font-size: 16px;">
    <p>Veja as participações dos competidores que você gosta e mostre o seu apoio.</p>
    {% for row in contestants %}
    <div style="text-align: center; overflow: hidden;">
      {% if row.length == 3 %}
        {% for contestant in row %}
        <div style="width: 33%; float: left;">
          <div style="margin-top: 10px;">
            <a href="{{ contestant.audition | auditionLink }}">
              <img src="{{ contestant.audition.medium_thumbnail }}" style="width: 100%;">
            </a>
          </div>
          <div style="margin-top: 10px;">
            <a href="{{ contestant.audition | auditionLink }}">
              {{ contestant.user.name }}
            </a>
          </div>
        </div>
        {% endfor %}
      {% elif row.length == 2 %}
        {% for contestant in row %}
        <div style="width: 50%; float: left;">
          <div style="margin-top: 10px;">
            <a href="{{ contestant.audition | auditionLink }}">
              <img src="{{ contestant.audition.medium_thumbnail }}" style="width: 100%;">
            </a>
          </div>
          <div style="margin-top: 10px;">
            <a href="{{ contestant.audition | auditionLink }}">
              {{ contestant.user.name }}
            </a>
          </div>
        </div>
        {% endfor %}
      {% elif row.length == 1 %}
        {% for contestant in row %}
        <div style="width: 100%; float: left;">
          <div style="margin-top: 10px;">
            <a href="{{ contestant.audition | auditionLink }}">
              <img src="{{ contestant.audition.large_thumbnail }}" style="width: 100%;">
            </a>
          </div>
          <div style="margin-top: 10px;">
            <a href="{{ contestant.audition | auditionLink }}">
              {{ contestant.user.name }}
            </a>
          </div>
        </div>
        {% endfor %}
      {% endif %}
    </div>
    {% endfor %}
    {% if moreContestants %}
    <p>
      ... e outros competidores que você gosta estão participando da competição.
    </p>
    {% else %}
    <p>
      Para assistir aos demais competidores acesse a competição:
    </p>
    {% endif %}
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
  </div>
{% endblock %}