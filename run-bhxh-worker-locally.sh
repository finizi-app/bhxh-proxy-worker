#!/bin/bash
# Run BHXH Proxy Worker locally

cd "$(dirname "$0")"

echo "Starting BHXH Proxy Worker..."
echo "Endpoints:"
echo "  - Health: http://localhost:8787/api/v1/health"
echo "  - Employees: http://localhost:8787/api/v1/employees"
echo ""

npx wrangler dev
