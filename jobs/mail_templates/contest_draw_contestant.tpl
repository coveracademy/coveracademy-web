{% extends "base.tpl" %}

{% block content %}
  <h3>Aproveite, {{ user.name }}!</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      A competição está empatada e por isso será estendida por <span style="font-size: 25px;">1</span> hora. Aproveite para ganhar mais votos!
    </p>
    <p style="text-align: center; font-weight: bold;">
      <a href="{{ contest | contestLink }}" target="_blank" style="text-decoration: none;">
        {{ contest.name }}
      </a>
    </p>
    <p>
      Aqui está o link da sua audição:
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition | auditionLink }}
      </a>
    </p>
    <p>
      É agora ou nunca, compartilhe este link na sua rede de contatos para mostrar ainda mais o seu talento e diminuir a diferença entre os votos.
    </p>
  </div>
{% endblock %}