import posthog from 'posthog-js';
import type { AnalyticsProvider } from '../types';

const APP_NAME = 'owners';

export class PostHogProvider implements AnalyticsProvider {
  readonly name = 'PostHog';

  async init(): Promise<boolean> {
    const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) {
      console.warn('[PostHog] Missing VITE_PUBLIC_POSTHOG_KEY');
      return false;
    }

    posthog.init(posthogKey, {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
    });
    console.log('[PostHog] Initialized');
    return true;
  }

  trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    posthog.capture(eventName, {
      app: APP_NAME,
      action: eventName,
      ...properties,
    });
  }

  identify(userId: string, traits: Record<string, unknown> = {}): void {
    posthog.identify(userId, { app: APP_NAME, ...traits });
  }
}
