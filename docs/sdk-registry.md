# SDK Registry

Central registry of all approved third-party SDKs used across the Owners Hub app (Android & iOS).

> **Last updated:** 2026-04-15

## Active SDKs

| SDK | Purpose | Platform | Integration | Status | Owner |
|-----|---------|----------|-------------|--------|-------|
| **Firebase Auth** | Phone/email authentication | Android, iOS, Web | Gradle BOM / CocoaPods (via Capacitor plugin) | ✅ Required | Auth team |
| **Firebase Analytics** | Core analytics (events, user properties) | Android | Gradle BOM (`firebase-analytics`) | ✅ Required | Analytics team |
| **PostHog** | Product analytics, feature flags | Web + Native (JS) | npm (`posthog-js`) | ✅ Required | Analytics team |
| **AppsFlyer** | Mobile attribution & deep links | Android, iOS (native) | npm (`appsflyer-capacitor-plugin`) | ✅ Required | Growth team |
| **Capacitor** | Native bridge (Android/iOS) | Android, iOS | npm (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`) | ✅ Required | Platform team |
| **Razorpay** | Payment processing | Web | npm (`razorpay`) | ✅ Required | Payments team |

## Removed SDKs

| SDK | Reason | Removed Date |
|-----|--------|--------------|
| **Supabase** (`@supabase/supabase-js`) | Fully migrated to Firebase for auth & database | 2026-04-15 |

## Analytics Architecture

```
Feature Code
    │
    ▼
┌──────────────────────┐
│   AnalyticsManager    │  ← single entry point
│   (trackEvent /       │
│    identifyUser)      │
└──────┬───────┬────────┘
       │       │
       ▼       ▼
  PostHog   AppsFlyer
 (all platforms) (native only)
```

- **Primary analytics:** PostHog (web + mobile)
- **Primary attribution:** AppsFlyer (native mobile only)
- **Firebase Analytics** is included in the Android native build via BOM for Google-required event collection

## Attribution Strategy

AppsFlyer is the **single source of truth** for mobile install attribution and deep linking.

- Firebase Analytics remains as a supporting SDK for Google Play requirements
- No duplicate event firing — events are routed through `AnalyticsManager`
- Server-to-server integrations should be preferred for any new attribution partners

## Android Dependencies (Gradle)

```gradle
# Firebase (via BOM — only pulls analytics + auth modules)
implementation platform('com.google.firebase:firebase-bom:34.2.0')
implementation 'com.google.firebase:firebase-analytics'
implementation 'com.google.firebase:firebase-auth'

# Capacitor Firebase Auth plugin
implementation project(':capacitor-firebase-authentication')
```

## iOS Dependencies (CocoaPods)

```ruby
pod 'Capacitor'                        # Capacitor core
pod 'CapacitorCordova'                 # Cordova compatibility layer
pod 'CapacitorFirebaseAuthentication'  # Firebase Auth via Capacitor
```

## npm Dependencies (Shared / Web)

| Package | Version | Purpose |
|---------|---------|---------|
| `firebase` | ^12.2.1 | Firebase JS SDK (auth, firestore) |
| `@capacitor-firebase/authentication` | ^7.5.0 | Capacitor plugin for Firebase Auth |
| `posthog-js` | ^1.363.2 | PostHog analytics |
| `appsflyer-capacitor-plugin` | ^6.17.9 | AppsFlyer attribution |
| `@capacitor/core` | ^7.4.3 | Capacitor core |
| `@capacitor/android` | ^7.4.3 | Capacitor Android |
| `@capacitor/ios` | ^7.4.3 | Capacitor iOS |
| `razorpay` | ^2.9.4 | Payment processing |
