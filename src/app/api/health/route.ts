import { hasDb, query } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";

type StripeApi = "ok" | "auth_error" | "unreachable" | "skipped";

type StripeHealth = {
  // Presence of the three env vars the deposit flow needs. The publishable
  // key is the one whose silent absence makes the browser show "Payments are
  // not configured" — the exact failure that can slip through a demo.
  secretKey: boolean;
  publishableKey: boolean;
  webhookSecret: boolean;
  // Live check: does the secret key still authenticate? Catches an
  // expired/rotated sandbox before the customer-facing form does.
  api: StripeApi;
  detail?: string;
};

/**
 * Lightweight live validation of the secret key. Lists one Checkout Session
 * (the resource this app actually creates). A permissions error still proves
 * the key authenticated, so we treat only auth failures (bad/expired key) as
 * a hard failure. Bounded by a timeout so /api/health never hangs.
 */
async function checkStripeApi(): Promise<{ api: StripeApi; detail?: string }> {
  try {
    const stripe = getStripe();
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Stripe API timed out")), 4000),
    );
    await Promise.race([stripe.checkout.sessions.list({ limit: 1 }), timeout]);
    return { api: "ok" };
  } catch (err) {
    if (err instanceof Stripe.errors.StripeAuthenticationError) {
      return { api: "auth_error", detail: "Secret key is invalid or expired." };
    }
    if (err instanceof Stripe.errors.StripePermissionError) {
      // Key authenticated but the restricted key lacks list permission — fine
      // for our purposes; the key itself works.
      return { api: "ok", detail: "Key valid (restricted permissions)." };
    }
    return { api: "unreachable", detail: err instanceof Error ? err.message : "unknown" };
  }
}

export async function GET(): Promise<Response> {
  // --- Stripe env presence (no key material is ever returned) ---
  const secretKey = Boolean(process.env.STRIPE_SECRET_KEY);
  const publishableKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const webhookSecret = Boolean(process.env.STRIPE_WEBHOOK_SECRET);

  const { api, detail } = secretKey
    ? await checkStripeApi()
    : { api: "skipped" as StripeApi, detail: "STRIPE_SECRET_KEY is not set." };

  const stripe: StripeHealth = {
    secretKey,
    publishableKey,
    webhookSecret,
    api,
    ...(detail ? { detail } : {}),
  };
  const stripeOk = secretKey && publishableKey && api !== "auth_error";

  // --- Database ---
  if (!hasDb) {
    return Response.json(
      { ok: false, db: "unconfigured", error: "DATABASE_URL is not set", stripe },
      { status: 500 },
    );
  }
  try {
    const rows = await query<{ count: string }>("SELECT COUNT(*) AS count FROM events");
    return Response.json(
      { ok: stripeOk, db: "connected", events: Number(rows[0].count), stripe },
      { status: stripeOk ? 200 : 503 },
    );
  } catch (err) {
    return Response.json(
      {
        ok: false,
        db: "error",
        error: err instanceof Error ? err.message : "unknown",
        stripe,
      },
      { status: 500 },
    );
  }
}
