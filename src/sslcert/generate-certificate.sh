#!/usr/bin/env bash
openssl req -config ca.conf -new -x509 -newkey rsa:2048 -nodes -keyout localhost.key.pem -days 365 -out localhost.cert.pem -subj "/C=ST/O=Local/CN=localhost"