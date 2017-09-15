#!/bin/bash

# TODO: assumes that redis is running on the same instance (only for testing)
# TODO: start via Systemd instead of cloud-init?!
(
  su - ubuntu &&
  cd /opt/server &&
  REDIS="localhost:6379" SOURCEMAP_PATH="/opt/server/sourcemap.json" node --napi-modules index.js
)
