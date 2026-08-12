import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Identifies the caller for rate limiting without keeping their address.
 *
 * The IP is hashed with a server-side secret, so the stored value cannot be
 * turned back into an address by anyone reading the table — which keeps the
 * promise in the privacy policy that no IP is stored.
 */
function identify(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Counts this request against a fixed window and says whether to proceed.
 *
 * Counting happens inside Postgres so that two requests arriving together
 * cannot both see the old total. If the check itself fails the request is
 * allowed: a rate limiter that breaks should slow nobody down.
 */
export async function checkRateLimit(
  req: NextRequest,
  bucket: string,
  max: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_rate_limit", {
      p_bucket: bucket,
      p_identity: identify(req),
      p_window_seconds: windowSeconds,
      p_max_hits: max,
    });

    if (error) return { allowed: true, retryAfterSeconds: 0 };

    // Windows are fixed, so the wait is until this one ends — not a further
    // full window, which would overstate it for anyone near the boundary.
    const now = Math.floor(Date.now() / 1000);
    const windowEnds = (Math.floor(now / windowSeconds) + 1) * windowSeconds;

    return {
      allowed: data !== false,
      retryAfterSeconds: data === false ? Math.max(1, windowEnds - now) : 0,
    };
  } catch {
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
