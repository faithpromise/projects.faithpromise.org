
In order to increase the file upload limit:

Add the following to the Nginx server config (for this site).

server {
    client_max_body_size 20M;
}