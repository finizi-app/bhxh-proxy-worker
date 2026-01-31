#!/bin/bash
# Test script for BHXH Master Data API endpoints
# Usage: ./scripts/test-master-data-api.sh [base_url]
# Default: http://localhost:4000

BASE_URL="${1:-http://localhost:4000}"

echo "Testing BHXH Master Data API"
echo "Base URL: $BASE_URL"
echo

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASS=0
FAIL=0

# Test function
test_endpoint() {
    local name="$1"
    local path="$2"
    local expected_code="${3:-200}"

    echo -n "Testing $name... "

    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$path" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "$expected_code" ]; then
        # Check if response contains success:true
        if echo "$body" | grep -q '"success":true'; then
            echo -e "${GREEN}PASS${NC} ($http_code)"
            ((PASS++))
            # Show count
            count=$(echo "$body" | grep -o '"id"' | wc -l)
            echo "  → $count items returned"
        else
            echo -e "${YELLOW}WARN${NC} ($http_code) - Response missing success flag"
            echo "  → $body" | head -c 100
            echo
            ((PASS++))
        fi
    else
        echo -e "${RED}FAIL${NC} ($http_code, expected $expected_code)"
        echo "  → $body" | head -c 200
        echo
        ((FAIL++))
    fi
    echo
}

# Health check
echo "=== Health Check ==="
test_endpoint "Health endpoint" "/" "200"

# Master Data endpoints
echo "=== Master Data Endpoints ==="
test_endpoint "Paper Types (Code 071)" "/api/v1/master-data/paper-types"
test_endpoint "Countries (Code 072)" "/api/v1/master-data/countries"
test_endpoint "Ethnicities (Code 073)" "/api/v1/master-data/ethnicities"
test_endpoint "Labor Plan Types (Code 086)" "/api/v1/master-data/labor-plan-types"
test_endpoint "Benefits (Code 098)" "/api/v1/master-data/benefits"
test_endpoint "Relationships (Code 099)" "/api/v1/master-data/relationships"

# Old endpoint should return 404
echo "=== Deprecated Endpoint ==="
test_endpoint "Old lookup endpoint (should fail)" "/api/v1/lookup/071" "404"

# Summary
echo "=== Summary ==="
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
