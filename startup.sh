#!/bin/bash
cd "$(dirname "$0")"

pm2 delete pm2.json 2> /dev/null &&  pm2 start pm2.json --env production
