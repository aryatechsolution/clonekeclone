import { Capacitor } from '@capacitor/core';
import type { AnalyticsProvider } from '../types';

type AppsFlyerModule = {
  initSDK(opts: Record<string, unknown>): Promise<void>;
  logEvent(opts: { eventName: string; eventValue: Record<string, unknown> }): Promise<void>;
  setCustomerUserId(opts: { cuid: string }): Promise<void>;
};

export class AppsFlyerProvider implements AnalyticsProvider {
  readonly name = 'AppsFlyer';
  private sdk: AppsFlyerModule | null = null;

  async init(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('[AppsFlyer] Skipped on web — native only');
      return false;
    }

    const devKey = import.meta.env.VITE_APPSFLYER_DEV_KEY;
    if (!devKey) {
      console.warn('[AppsFlyer] Missing VITE_APPSFLYER_DEV_KEY — skipping init');
      return false;
    }

    const appID = import.meta.env.VITE_APPSFLYER_APP_ID;

    try {
      const { AppsFlyer } = await import('appsflyer-capacitor-plugin');
      await AppsFlyer.initSDK({
        devKey,
        appID: appID || '',
        isDebug: true,
        waitForATTUserAuthorization: 10,
        registerOnDeepLink: true,
        registerConversionListener: true,
      });
      this.sdk = AppsFlyer as unknown as AppsFlyerModule;
      console.log('[AppsFlyer] Initialized');
      return true;
    } catch (error) {
      console.error('[AppsFlyer] Initialization error:', error);
      return false;
    }
  }

  trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
    if (!this.sdk) return;

    this.sdk
      .logEvent({ eventName, eventValue: properties })
      .then(() => console.log(`[AppsFlyer] Event sent: ${eventName}`, properties))
      .catch((error) => console.error(`[AppsFlyer] Error tracking event "${eventName}":`, error));
  }

  identify(userId: string): void {
    if (!this.sdk) return;

    this.sdk
      .setCustomerUserId({ cuid: userId })
      .then(() => console.log(`[AppsFlyer] CUID set: ${userId}`))
      .catch((error) => console.error('[AppsFlyer] Error setting CUID:', error));
  }
}
