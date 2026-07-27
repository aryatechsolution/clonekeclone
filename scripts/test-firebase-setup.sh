#!/bin/bash
# Test Firebase App Distribution setup

echo "🧪 Testing Firebase App Distribution Setup..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it with: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI is installed"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run: firebase login"
    exit 1
fi

echo "✅ Firebase authentication successful"

# Check if google-services.json exists
if [ ! -f "android/app/google-services.json" ]; then
    echo "❌ google-services.json not found in android/app/"
    exit 1
fi

echo "✅ google-services.json found"

# Check if firebase.json is configured
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found"
    exit 1
fi

echo "✅ firebase.json found"

# Check if .firebaserc is configured
if [ ! -f ".firebaserc" ]; then
    echo "❌ .firebaserc not found"
    exit 1
fi

echo "✅ .firebaserc found"

# Test Firebase App Distribution configuration
echo "🔍 Testing Firebase App Distribution configuration..."

# Get the app ID from firebase.json
APP_ID=$(grep -o '"app": "[^"]*"' firebase.json | cut -d'"' -f4)

if [ -z "$APP_ID" ]; then
    echo "❌ App ID not found in firebase.json"
    exit 1
fi

echo "✅ App ID found: $APP_ID"

# Test if we can access the app
if firebase appdistribution:testers:list --app "$APP_ID" &> /dev/null; then
    echo "✅ Firebase App Distribution is properly configured"
    echo "🎉 Setup is complete! You can now distribute your app."
else
    echo "⚠️  Firebase App Distribution configuration may need adjustment"
    echo "💡 Try running: firebase appdistribution:testers:list --app $APP_ID"
fi

echo ""
echo "📋 Next steps:"
echo "1. Add testers: firebase appdistribution:testers:add tester@example.com"
echo "2. Distribute app: npm run distribute:android"
echo "3. Or use fastlane: npm run distribute:fastlane"
