#!/bin/bash

# Load environment variables from .env if exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set production mode
export NODE_ENV=production

# Start the server
node .output/server/index.mjs
