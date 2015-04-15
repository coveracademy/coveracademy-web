{% extends "base.tpl" %}

{% block content %}
  <h3>{{ user.name }} comentou:</h3>
  <div style="color: #555; font-size: 16px;">
    <h3>
      {{ comment.message }}
    </h3>
    <p>
      Para ver o comentário no site do Cover Academy acesse a página da sua audição:
    </p>
    <p>
      <a href="{{ audition | auditionLink }}" target="_blank" style="text-decoration: none;">
        {{ audition.title }}
      </a>
    </p>
  </div>
{% endblock %}