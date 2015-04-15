{% extends "base.tpl" %}

{% block content %}
  <h3>{{ user.name }} respondeu o seu comentário:</h3>
  <div style="color: #555; font-size: 16px;">
    <h3>
      {{ reply.message }}
    </h3>
    <p>
      Para ver a resposta do comentário no site do Cover Academy acesse a página da audição:
    </p>
    <p>
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition.title }}
      </a>
    </p>
  </div>
{% endblock %}