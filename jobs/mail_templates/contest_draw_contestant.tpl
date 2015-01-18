{% extends "base.tpl" %}

{% set contestLink = siteUrl + "/pt-br/contest/" + contest.id + "/" + contest.slug %}
{% set auditionLink = siteUrl + "/pt-br/audition/" + audition.id + "/" + audition.slug %}

{% block content %}
  <h3>Aproveite, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      A competição está empatada e por isso será estendida por <span style="font-size: 25px;">1</span> hora. Aproveite para ganhar mais votos!
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Aqui está o link da sua audição:
      <a href="{{ auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ auditionLink }}
      </a>
    </p>
    <p>
      É agora ou nunca, compartilhe este link na sua rede de contatos para mostrar ainda mais o seu talento e diminuir a diferença entre os votos.
    </p>
    <p style="text-align: right; font-weight: bold;">
      - Sandro Simas
    </p>
  </div>
{% endblock %}