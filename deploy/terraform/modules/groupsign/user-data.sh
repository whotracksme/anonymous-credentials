#!/bin/bash

echo -n "# Generated by user-data.sh (cloud-init)
NODE_ENV=production
SOURCEMAP_PATH=/opt/server/sourcemap.json

# TODO: still assuming that redis runs on the local machine
REDIS=localhost:6379
" > /etc/groupsign

systemctl enable groupsign.service
systemctl start  groupsign.service
