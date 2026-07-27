#!/bin/bash
# Simple Capacitor preparation script for CI/CD
# Run this before any gradlew commands

echo "🔧 Preparing Capacitor Android for build..."

# Exit on any error
set -e

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Build web application
echo "🏗️ Building web application..."
npm run build

# Sync and update Capacitor
echo "🔄 Syncing Capacitor Android..."
npx cap sync android

echo "✅ Capacitor preparation complete!"
