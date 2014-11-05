- Set up database
    $ cd cover-academy
    $ mysql -u <user> -p
      > create database cover_academy character set utf8 collate utf8_general_ci;
      > exit
    $ mysql -u <user -p cover_academy < resources/schema.sql
    $ mysql -u <user -p cover_academy < resources/data.sql

- Install Nginx
    $ sudo apt-get install nginx

- Configure Nginx sites availables 

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
- Install cover-academy dependencies
    $ npm install
- Start cover-academy server
    $ npm start