import { Capacitor } from '@capacitor/core';
import type { AnalyticsProvider } from './types';
import { PostHogProvider } from './providers/PostHogProvider';
import { AppsFlyerProvider } from './providers/AppsFlyerProvider';

/**
 * AnalyticsManager — centralized analytics abstraction.
 *
 * All event tracking and user identification MUST go through this
 * manager. Feature code should never call SDK-specific APIs directly.
 *
 * To add/remove an analytics or attribution SDK:
 *   1. Create/remove a provider in `./providers/`
 *   2. Register/unregister it in `AnalyticsManager.providers` below
 *
 * @example
 *   import { analyticsManager } from '@/analytics/AnalyticsManager';
 *   analyticsManager.trackEvent('button_clicked', { screen: 'home' });
 */
class AnalyticsManager {
  private providers: AnalyticsProvider[] = [];
  private initialized = false;

  /** Register the default set of analytics providers */
  constructor() {
    this.providers = [
      new PostHogProvider(),
      new AppsFlyerProvider(),
    ];
  }

  /** Initialize all registered providers */
  async init(): Promise<void> {
    if (this.initialized) return;

    const results = await Promise.allSettled(
      this.providers.map((p) => p.init()),
    );

    results.forEach((result, index) => {
      const provider = this.providers[index];
      if (result.status === 'rejected') {
        console.error(`[AnalyticsManager] ${provider.name} init failed:`, result.reason);
      }
    });

    this.initialized = true;
    console.log('[AnalyticsManager] Initialized');
  }

  /**
   * Track a named event across all providers.
   * Metadata is sanitized (null/undefined values removed).
   */
  trackEvent(eventName: string, metadata: Record<string, unknown> = {}): void {
    const timestamp = Date.now();
    const platform = Capacitor.isNativePlatform()
      ? Capacitor.getPlatform()
      : 'web';

    // Remove null/undefined values
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined && value !== null) {
        clean[key] = value;
      }
    }

    const properties: Record<string, unknown> = {
      platform,
      timestamp,
      ...clean,
    };

    for (const provider of this.providers) {
      try {
        provider.trackEvent(eventName, properties);
      } catch (error) {
        console.error(`[AnalyticsManager] ${provider.name} trackEvent error:`, error);
      }
    }

    console.log(`[AnalyticsManager] Event: ${eventName}`, properties);
  }

  /**
   * Identify the current user across all providers.
   */
  identifyUser(userId: string, traits: Record<string, unknown> = {}): void {
    if (!userId) return;

    for (const provider of this.providers) {
      try {
        provider.identify(userId, traits);
      } catch (error) {
        console.error(`[AnalyticsManager] ${provider.name} identify error:`, error);
      }
    }

    console.log(`[AnalyticsManager] User identified: ${userId}`);
  }
}

/** Singleton instance — import this throughout the app */
export const analyticsManager = new AnalyticsManager();

export type { AnalyticsProvider } from './types';
