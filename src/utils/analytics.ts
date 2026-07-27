import { analyticsManager } from '../analytics/AnalyticsManager';

/**
 * Backward-compatible analytics API.
 *
 * All calls are routed through the centralized AnalyticsManager.
 * Feature code may import from here or directly from AnalyticsManager.
 */

export const initAnalytics = async () => {
  await analyticsManager.init();
};

export const trackEvent = (eventName: string, metadata: Record<string, unknown> = {}) => {
  analyticsManager.trackEvent(eventName, metadata);
};

export const identifyUser = (userId: string, metadata: Record<string, unknown> = {}) => {
  analyticsManager.identifyUser(userId, metadata);
};

