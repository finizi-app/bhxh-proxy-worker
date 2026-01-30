#!/bin/bash
cd /root/bhxh-proxy/external-proxy
node server.js > /var/log/bhxh-proxy.log 2>&1 &
echo "Proxy started"
