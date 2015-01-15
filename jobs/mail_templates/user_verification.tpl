{% extends "base.tpl" %}

{% block content %}
  <h3>Por favor, confirme o seu email.</h3>
  <div style="color: #555; font-size: 16px;">
    <p>
      Olá {{ user.name }}, obrigado por fazer parte da nossa comunidade.
    </p>
    <p>
      Confirme o seu email para conseguir votar e participar das competições de música do Cover Academy.
    </p>
    <div style="text-align: center;">
      <a href="{{ siteUrl }}/pt-br/verify?token={{ token }}" style="padding: 10px 16px; font-size: 18px; line-height: 1.33; border-radius: 6px; color: #fff; background-color: #5bc0de; border-color: #46b8da; display: inline-block; margin-bottom: 0; font-weight: 400; line-height: 1.42857143; text-align: center; white-space: nowrap; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; text-decoration: none;">
        Confirmar email
      </a>
    </div>
  </div>
{% endblock %}