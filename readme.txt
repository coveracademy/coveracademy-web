- sudo apt-get install nginx
- Nginx's sites available cofiguration:

    server {
      listen       80;
      server_name  coveracademy.com;
      return       301 $scheme://www.coveracademy.com$request_uri;
    }

    server {
      listen       80;
      server_name  www.coveracademy.com;

      location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;
        proxy_pass http://127.0.0.1:3000;
        proxy_redirect off;
      }
    }

- Edit /etc/hosts and add www.coveracademy.com pointing to localhost
- npm install
- npm start