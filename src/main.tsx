import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import { auth } from './integrations/firebase/client'
import { onAuthStateChanged } from 'firebase/auth'
import { initAnalytics, identifyUser, trackEvent } from './utils/analytics'
import * as Sentry from '@sentry/capacitor'
import * as SentryReact from '@sentry/react'

// Sentry crash & error monitoring.
// Initialize as early as possible so errors during startup are captured too.
// The DSN is your project's public "address" — safe to keep in client code.
const SENTRY_DSN = 'https://d15f3265eef6904214ee687b8301e27a@o4511451856371712.ingest.us.sentry.io/4511621749866496'

Sentry.init(
  {
    dsn: SENTRY_DSN,
    // Verbose SDK logging in dev so we can see what Sentry captures/sends/drops.
    // Stripped from production builds (import.meta.env.DEV is false there).
    debug: import.meta.env.DEV,
    // Tag every event with the app version (e.g. "ownershub@1.0.9"), injected at
    // build time from package.json by vite.config.ts. This groups errors by
    // release in the Sentry dashboard and matches the uploaded source maps.
    release: import.meta.env.VITE_APP_RELEASE,
    // Distinguish prod vs. dev events in Sentry.
    environment: import.meta.env.MODE,
    // Automatic breadcrumbs (UI clicks, navigation, network, console) are ON by
    // default via the browser SDK's default integrations — we intentionally do
    // not disable them.
    integrations: [SentryReact.browserTracingIntegration()],
    // Capture 100% of performance traces while setting up. Lower this (e.g. 0.2)
    // for production to control event volume / cost.
    tracesSampleRate: 1.0,
    // `release` and `dist` are injected automatically at build time by the
    // Sentry Vite plugin (configured in the source-maps step) so stack traces
    // map back to original source instead of minified code.
  },
  // Forward to the React SDK so React-specific features are wired up.
  SentryReact.init,
)

// Bootstrap Analytics ensuring CUID timing rules are heavily enforced
const bootstrapAnalytics = async () => {
  try {
    await initAnalytics();
    
    // Wait for session recovery to correctly map CUID
    return new Promise<void>((resolve) => {
      if (!auth) {
        trackEvent('app_loaded');
        resolve();
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          identifyUser(user.uid, { email: user.email });
        }
        
        trackEvent('app_loaded');
        unsubscribe(); // only trigger bootstrap event once
        resolve();
      });
    });
  } catch (error) {
    console.error('[Analytics] Bootstrapping framework failed:', error);
  }
};

bootstrapAnalytics().catch(console.error);

// Wrap the root component with Sentry's profiler. On web this is the practical
// equivalent of React Native's `Sentry.wrap()`: it adds React component context
// to events. UI tap/click breadcrumbs are captured automatically by the browser
// SDK, so no separate touch wrapper is needed.
const SentryApp = SentryReact.withProfiler(App);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SentryApp />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
