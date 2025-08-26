#!/bin/bash

# ANDI Tests Runner
# This script runs the ANDI demo page tests

echo "ANDI Demo Page Tests"
echo "===================="

# Check if we're in the tests directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the tests directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if browsers are installed
echo "Checking browser installations..."
if npx playwright install --dry-run > /dev/null 2>&1; then
    echo "Browsers are installed"
else
    echo "Installing browsers (this may take a few minutes)..."
    npx playwright install
fi

# Run the tests
echo "Running ANDI tests..."
if [ "$1" = "--headed" ]; then
    echo "Running in headed mode..."
    npm run test:headed
elif [ "$1" = "--debug" ]; then
    echo "Running in debug mode..."
    npm run test:debug
else
    echo "Running tests..."
    npm test
fi

echo "Tests completed!"
echo "View HTML report with: npx playwright show-report"