
In order to increase the file upload limit:

Add the following to the Nginx server config (for this site).

server {
    client_max_body_size 20M;
}

Add the following to PHP FPM config (use editor in Forge)

upload_max_filesize = 10M
post_max_size = 10M
