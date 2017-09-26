#!/bin/bash

# This script is triggered by Packer. Refer to packer.json
# to understand the context in which the script is executed.

set -x
set -e

# Install latest updates
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq
apt-get update

# Setup Node.js
#
# source: https://github.com/nodesource/distributions
# (installs node v8)
curl -sL https://deb.nodesource.com/setup_8.x | bash -
apt-get install -y nodejs

( cd /opt/ && tar xzfv /tmp/tmp-upload-dir/server.tgz )
( cd /opt/server && tar xzf /tmp/tmp-upload-dir/server-deps.tgz )

# setup systemd services (but let cloud-init enable them)
cp /tmp/groupsign.service /etc/systemd/system

# install SSH keys
cat /tmp/authorized_keys > /home/ubuntu/.ssh/authorized_keys
