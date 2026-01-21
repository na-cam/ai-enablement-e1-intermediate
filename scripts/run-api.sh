#!/bin/bash
# Run API tests only

echo "Running API tests..."
npx playwright test --project=api
