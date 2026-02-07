#!/bin/bash

# Initial project setup
echo "🚀 Setting up project..."

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Build all packages
echo "🏗️ Building packages..."
bun run build

# Setup husky
echo "🐶 Setting up Git hooks..."
bun run prepare

echo "✅ Setup complete! You are ready to develop."
