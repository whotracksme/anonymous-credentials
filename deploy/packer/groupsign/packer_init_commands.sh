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
apt-get install -y curl xz-utils
(. /tmp/node.install && install_node && check_node_version)

( cd /opt/ && tar xzfv /tmp/tmp-upload-dir/server.tgz )
( cd /opt/server && tar xzf /tmp/tmp-upload-dir/server-deps.tgz )

# setup systemd services (but let cloud-init enable them)
cp /tmp/groupsign.service          /etc/systemd/system
cp /tmp/groupsign-exporter.service /etc/systemd/system

# create user for groupsign
# ("--gecos" suppresses interactive dialogs)
adduser --disabled-password --gecos "" groupsign
mkdir /mutable
chown groupsign /mutable

# install SSH keys
cat /tmp/authorized_keys > /home/ubuntu/.ssh/authorized_keys
