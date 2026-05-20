<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly Expo app. The following changes were made:

- **`lib/posthog.ts`** — New PostHog client singleton configured via `expo-constants` extras, with lifecycle capture, debug mode, and batching settings.
- **`app.config.js`** — New dynamic config file that reads `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from environment variables and exposes them as `Constants.expoConfig.extra` for the client.
- **`.env`** — Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` keys.
- **`app/_layout.tsx`** — Added `PostHogProvider` wrapping the root layout, plus manual screen tracking via `posthog.screen()` on pathname changes (Expo Router pattern).
- **`app/(auth)/sign-in.tsx`** — Captures `sign_in_completed` (with `posthog.identify`) and `sign_in_failed` events.
- **`app/(auth)/sign-up.tsx`** — Captures `sign_up_started`, `sign_up_email_verification_sent`, and `sign_up_completed` (with `posthog.identify`).
- **`app/(tabs)/index.tsx`** — Captures `subscription_card_expanded` (with subscription name/id) and `add_subscription_tapped`.
- **`app/subscriptions/[id].tsx`** — Captures `subscription_details_viewed` on mount.
- **`app/(tabs)/settings.tsx`** — Captures `sign_out_completed` and calls `posthog.reset()` before sign-out.
- **`app/onboarding.tsx`** — Captures `onboarding_viewed` on mount (funnel top-of-funnel signal).

## Events

| Event | Description | File |
|---|---|---|
| `sign_in_completed` | User successfully signs in with email and password | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | User sign-in attempt failed due to invalid credentials or error | `app/(auth)/sign-in.tsx` |
| `sign_up_started` | User submits the sign-up form to create a new account | `app/(auth)/sign-up.tsx` |
| `sign_up_email_verification_sent` | Verification email code was successfully sent to the user | `app/(auth)/sign-up.tsx` |
| `sign_up_completed` | User successfully verifies their email and completes account creation | `app/(auth)/sign-up.tsx` |
| `subscription_card_expanded` | User taps a subscription card to expand and view its details | `app/(tabs)/index.tsx` |
| `add_subscription_tapped` | User taps the add button on the home screen | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User opens the subscription details screen | `app/subscriptions/[id].tsx` |
| `sign_out_completed` | User successfully signs out of their account | `app/(tabs)/settings.tsx` |
| `onboarding_viewed` | User views the onboarding screen (top of acquisition funnel) | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/690686)
- [Sign-in outcomes over time](/insights/u9pEzjhr)
- [Sign-up conversion funnel](/insights/6arT1AgB)
- [New sign-ups over time](/insights/x2Zm9ghs)
- [Subscription engagement](/insights/Q9tUqrut)
- [Sign-outs (churn signal)](/insights/KnKVXXYQ)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
