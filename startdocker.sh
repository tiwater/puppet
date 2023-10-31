#!/bin/bash

# The first time to execute this script, please delete the node_modules first
docker stop puppet-service

# Delay 1 second
sleep 1

# Run the Docker container with the current directory mapped to /home/puppet, port 7000 mapped and executing service.sh in the background.
docker run --rm -t \
  --name=puppet-service \
  -v "$(pwd)":/home/puppet \
  -p 7000:7000 \
  tiwater/node_env:1.0 \
  "cd /home/puppet && ./service.sh"&