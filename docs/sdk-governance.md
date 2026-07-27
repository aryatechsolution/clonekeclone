# SDK Governance Guidelines

Rules and best practices for managing third-party SDKs in the Owners Hub app.

## Adding a New SDK

1. **Open a review request** — No new SDK may be added without prior review and approval
2. **Document the need** — Explain what problem the SDK solves and why an existing solution cannot be used
3. **Check for overlap** — Verify the SDK does not duplicate functionality of an already-approved SDK (see `docs/sdk-registry.md`)
4. **Security & privacy review** — Ensure the SDK complies with:
   - iOS App Tracking Transparency (ATT) requirements
   - Google Play data safety policies
   - App privacy policies
5. **Size impact** — Measure APK/IPA size before and after adding the SDK
6. **Update the registry** — Add the SDK to `docs/sdk-registry.md` with purpose, platform, integration method, status, and owner

## SDK Integration Standards

### Android (Gradle)
- Use the Firebase BOM for all Firebase SDKs — import only the modules you need
- Use `implementation` scope; avoid `api` unless the dependency is part of your public API
- Keep `minifyEnabled true` and `shrinkResources true` for release builds
- Regularly run `./gradlew app:dependencies` to audit transitive dependencies

### iOS (CocoaPods / SPM)
- Prefer Swift Package Manager (SPM) over CocoaPods for new dependencies where the SDK supports it
- Use modular imports — avoid importing full SDK bundles when only specific modules are needed
- Keep the Podfile minimal; remove unused pods promptly

### Web / Capacitor (npm)
- Use the centralized `AnalyticsManager` (`src/analytics/AnalyticsManager.ts`) for all analytics/attribution event tracking
- Never call analytics SDK APIs directly from feature code
- Prefer Capacitor plugins over direct native SDK integration

## Removing an SDK

1. Remove all code references (imports, calls, configuration)
2. Remove the dependency from `package.json`, `build.gradle`, or `Podfile`
3. Move the SDK entry to the "Removed SDKs" section in `docs/sdk-registry.md`
4. Verify the build passes on all platforms
5. Measure and document size impact

## Analytics Event Guidelines

- All events must flow through `AnalyticsManager.trackEvent(name, properties)`
- Event names should use `snake_case` (e.g., `property_added`, `user_login`)
- Avoid passing `null` or `undefined` values in event properties — the manager sanitizes these, but clean data at the source is preferred
- User identification must go through `AnalyticsManager.identifyUser(userId, traits)`

## Performance Targets

When making SDK changes, measure and compare:

| Metric | Target |
|--------|--------|
| APK / AAB size | ↓ or stable |
| IPA size | ↓ or stable |
| Cold start time | ↓ or stable |
| SDK initialization time | < 500ms total |
| Number of SDKs | Minimize |

## Compliance

- All SDKs must comply with the iOS App Tracking Transparency framework
- Server-to-server integrations are preferred over client-side tracking where possible
- Validate analytics data integrity after any SDK change or swap
