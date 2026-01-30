#!/bin/bash
# Run employee fetch script

cd "$(dirname "$0")"

echo "Fetching employees..."

node fetch_employees.js

echo "Done."
