#!/bin/bash
# Start BHXH Local API Server on port 4000

cd "$(dirname "$0")"

export PORT=4000
export HOST="0.0.0.0"

node server-local.js
