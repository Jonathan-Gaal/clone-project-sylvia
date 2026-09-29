import "server-only";
import Stripe from "stripe";

/**
 * Shared server-side Stripe client. Cached on globalThis so Next.js dev
 * hot-reloads don't spawn a new client (and new connection pool) each time.
 * API version is intentionally omitted so the account's default (latest)
 * pinned by the SDK is used.
 */
const globalForStripe = globalThis as unknown as { _stripe?: Stripe };

/**
 * Classify a Stripe key by mode from its own marker, without exposing it.
 * Test keys contain `_test_`, live keys contain `_live_`. Anything else is
 * treated as "unknown" (allowed, but surfaced) so an unusual-but-valid test
 * key is never falsely blocked.
 */
export function stripeKeyMode(key: string | undefined): "test" | "live" | "unknown" {
  if (!key) return "unknown";
  if (key.includes("_live_")) return "live";
  if (key.includes("_test_")) return "test";
  return "unknown";
}

/** True only if a live key is present — the one thing this app must never use. */
export const isLiveKey: boolean =
  stripeKeyMode(process.env.STRIPE_SECRET_KEY) === "live" ||
  stripeKeyMode(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) === "live";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set.");
  }
  // Hard stop: this is a test-mode-only app. A live key is a configuration
  // error, never something we silently accept.
  if (stripeKeyMode(key) === "live") {
    throw new Error(
      "Refusing to use a live Stripe key — this app is test-mode only. Set a test key (rk_test_… / sk_test_…).",
    );
  }
  if (!globalForStripe._stripe) {
    globalForStripe._stripe = new Stripe(key);
  }
  return globalForStripe._stripe;
}

// Payments are "configured" only with a present, non-live secret key.
export const hasStripe: boolean =
  Boolean(process.env.STRIPE_SECRET_KEY) &&
  stripeKeyMode(process.env.STRIPE_SECRET_KEY) !== "live";
