---
title: "Setting Up Ghost, Nginx With Docker"
publishdate: 2015-08-02T00:00:00Z
lastmod: 2015-08-02T00:00:00Z
description: An old guide on how to run the Ghost blogging software from Docker.
---

> Note: This is a legacy blog post I no longer maintain.
> I've left it here for historical purposes, but the advice contained within
> is likely out of date, and I do not recommend you follow it.

After some brief experimentation with [Medium](http://medium.com/), I decided I'd take the approach of running my own blog instead. I was researching [Jekyll](http://jekyllrb.com/) (recently of [GitHub Pages](https://pages.github.com/) fame), but discovered [Ghost](https://ghost.org/), which sounded a little closer to my needs.

Carlos Feliciano-Barba created a two-part guide to [Setting up a Ghost blog using Docker and Nginx][original-guide], but I had some difficulties following it, mainly due to a few changes with the nginx docker image. Docker interests me, and I've been trying to involve it more at work, so I figured this process would be good learning around multi-container communications. This guide likely could be improved — I don't currently run Ghost in production mode, for example. The following assumes you have already installed Docker (e.g. `sudo apt-get install docker.io`)

## Installing Ghost

*In the interests of easily playing with other installations later (development, for example), I named my Ghost container* `ghost-primary`*.*

    sudo docker run --name ghost-primary -p 2368:2368 -v $HOME/ghost-primary:/var/lib/ghost ghost

This links the Ghost configuration and SQLite database into the current user's home directory (e.g. `/home/ubuntu/ghost-primary`, which ensures your data will survive the Ghost container being deleted. *Theoretically*, this allows upgrades by deleting the Ghost container and pulling the newest version.

The above command will attach when run (as of the current Ghost container version), so it will be necessary to stop it as prompted.

Before any of my content could be seen, I had to change the blog URLs. Since Ghost 0.4, subpaths are supported, which allows me to host this at http://liamdawson.me/blog instead of requiring a different subdomain (e.g. http://blog.liamdawson.me). I used `sed` to accomplish the change without manual intervention:

    sed -i 's|http://my-ghost-blog.com|http://liamdawson.me/blog|' $HOME/ghost-primary/config.js
    sed -i 's|http://localhost:2368|http://liamdawson.me/blog|' $HOME/ghost-primary/config.js
    sudo docker restart ghost-primary

(Note that I've changed the production settings in advance: I don't currently use them. Some issues exist around enabling production mode with the Docker image).

At this point, Ghost is up and running on port `2368`, which can be tested via a simple curl call:

    curl localhost:2368/blog/ # Should return a HTML page

## Installing nginx

The nginx container seems to have changed since [the guide I was consulting][original-guide], so the configuration here diverges more sharply.

First, I created a few directories to mirror the standard Ubuntu nginx install, but placed my static HTML into my user's home directory instead:

    sudo mkdir -p /etc/nginx/{certs,conf.d}
    sudo chmod 0700 /etc/nginx/certs/
    mkdir -p $HOME/www/html

(The `certs` directory is to easily allow for moving to SSL in future, but I haven't done so yet.)

To make the next step easier for myself, I [uploaded my nginx configuration files to a gist][config-gist], which I download in the appropriate locations:

    sudo wget https://gist.githubusercontent.com/liamdawson/2b8b7986c71015bb41c4/raw/332459716dbb923ea71136178eae88687d600d5b/debian-jessie-nginx.conf -O /etc/nginx/nginx.conf
    sudo wget https://gist.githubusercontent.com/liamdawson/2b8b7986c71015bb41c4/raw/332459716dbb923ea71136178eae88687d600d5b/99-ghost-primary.conf -O /etc/nginx/conf.d/99-ghost-primary.conf

*The nginx.conf is taken directly from the latest nginx deb for Debian Jessie ([used by the nginx container][nginx-container]), the other is based upon Carlos's example configuration file.*

Finally, I created the nginx container with a link to the Ghost container:

    sudo docker run --name nginx -p 80:80 -p 443:443 --link ghost-primary:ghost-primary -v $HOME/www/html:/usr/share/nginx/html:ro -v /etc/nginx/nginx.conf:/etc/nginx/nginx.conf:ro -v /etc/nginx/certs:/etc/nginx/certs:ro -v /etc/nginx/conf.d:/etc/nginx/conf.d:ro -d nginx

Specifically, nginx is port forwarded to the local machine on `80` and `443` (http and https respectively) to allow full webserver functionality immediately. The current user's `~/www/html` directory is made available within the nginx container (and used by the [99-ghost-primary.conf file][ghost-primary-conf]). `/etc/nginx/nginx.conf`, `/etc/nginx/certs` and `/etc/nginx/conf.d` are also made available, to reuse familiar directories.

## Conclusion

Getting this Ghost blog up and running was simple once I moved past the configuration differences caused by image changes. An appropriate lesson here would be to be a little more restrictive about which image versions are used, which I plan to investigate after I have SSL up and running. One other step I took was to sign up for [Mailgun](https://mailgun.com), and add the username and password into the `~/ghost-primary/config.js` file.

It's definitely been interesting to get this (admittedly simple) stack up and running by installing a single package, and I'm looking forward to using Docker more in future.

One small gotcha I've run into: if you restart the `ghost-primary` container, you *must* also restart the `nginx` container. I do not understand enough about Docker to understand why at this time, but simple ensure you restart both.

## Addendum — Enabling SSL
*Added 2015-08-07*

Enabling SSL from this configuration required a handful of changes. First was to add the `.key` and `.crt` file to `/etc/nginx/certs`, and then I adjusted my nginx configuration:

    server {
      listen 80;
      server_name liamdawson.me;
      return 301 https://www.liamdawson.me$request_uri;
    }

    server {
      listen 443 ssl;
      ssl_certificate certs/www.liamdawson.me.crt;
      ssl_certificate_key certs/www.liamdawson.me.key;
      server_name www.liamdawson.me;
      root /usr/share/nginx/html;
      index index.html index.htm;

      if ($ssl_protocol = "") {
         rewrite ^   https://$server_name$request_uri? permanent;
      }

      location /blog {
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header HOST $http_host;
          proxy_set_header X-NginX-Proxy true;

          proxy_pass http://ghost-primary:2368;
          proxy_redirect off;

          client_max_body_size 5M;
      }
    }

This configuration redirects access to http://liamdawson.me or http://www.liamdawson.me to https://liamdawson.me, and applies the SSL certificate over the connection.

[original-guide]: http://carloscheddar.com/setting-up-a-ghost-blog-using-docker-and-nginx-part-1/
[config-gist]: https://gist.github.com/liamdawson/2b8b7986c71015bb41c4
[nginx-container]: https://github.com/nginxinc/docker-nginx/blob/master/Dockerfile#L6
[ghost-primary-conf]: https://gist.github.com/liamdawson/2b8b7986c71015bb41c4#file-99-ghost-primary-conf
