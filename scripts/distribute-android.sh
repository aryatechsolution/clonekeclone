#!/bin/bash
# Firebase App Distribution script for Android
# This script builds the Android app and distributes it via Firebase App Distribution

set -e

echo "🚀 Starting Firebase App Distribution for Android..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

# Build the web app
echo "🏗️ Building web application..."
npm run build

# Sync Capacitor
echo "🔄 Syncing Capacitor Android..."
npx cap sync android

# Build Android APK
echo "📱 Building Android APK..."
cd android
./gradlew assembleDebug
cd ..

# Find the APK file
APK_PATH=$(find android/app/build/outputs/apk/debug -name "*.apk" | head -1)

if [ -z "$APK_PATH" ]; then
    echo "❌ APK file not found. Build may have failed."
    exit 1
fi

echo "✅ APK built successfully: $APK_PATH"

# Get release notes (optional)
read -p "📝 Enter release notes (or press Enter for default): " RELEASE_NOTES
if [ -z "$RELEASE_NOTES" ]; then
    RELEASE_NOTES="New build available for testing"
fi

# Get testers (optional)
read -p "👥 Enter tester emails (comma-separated, or press Enter for default): " TESTERS
if [ -z "$TESTERS" ]; then
    TESTERS=""
fi

# Distribute via Firebase App Distribution
echo "📤 Distributing via Firebase App Distribution..."

if [ -n "$TESTERS" ]; then
    firebase appdistribution:distribute "$APK_PATH" \
        --release-notes "$RELEASE_NOTES" \
        --testers "$TESTERS"
else
    firebase appdistribution:distribute "$APK_PATH" \
        --release-notes "$RELEASE_NOTES"
fi

echo "✅ App distributed successfully!"
echo "📧 Testers will receive email notifications to download the app."
