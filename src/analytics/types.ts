/**
 * Analytics Provider Interface
 *
 * All analytics/attribution SDKs must implement this interface.
 * This abstraction allows swapping or removing SDKs without
 * modifying feature code.
 */
export interface AnalyticsProvider {
  /** Human-readable name for logging */
  readonly name: string;

  /** Initialize the provider. Returns false if initialization is skipped. */
  init(): Promise<boolean>;

  /** Track a named event with optional properties */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void;

  /** Associate events with a specific user */
  identify(userId: string, traits?: Record<string, unknown>): void;
}
