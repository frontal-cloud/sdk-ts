#!/bin/bash

# Deep clean the project
echo "🧹 Cleaning project..."

# Remove node_modules
echo "🗑️ Removing node_modules..."
rm -rf node_modules
rm -rf packages/**/node_modules

# Remove build artifacts
echo "🗑️ Removing build artifacts..."
rm -rf packages/**/dist
rm -rf packages/**/lib
rm -rf packages/**/.turbo
rm -rf .turbo

# Remove lock files
echo "🗑️ Removing lock files..."
rm -f bun.lock
rm -f bun.lockb

echo "✅ Clean complete!"
