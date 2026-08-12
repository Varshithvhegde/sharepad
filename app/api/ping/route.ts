import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/*
 * Supabase pauses a free project after a week without activity, which would
 * take every shared link down with it. A scheduled job calls this to run one
 * real query and keep the clock reset.
 *
 * Must never be cached: a cached 200 would satisfy the job while the database
 * quietly went idle, which is the exact failure this is meant to prevent.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("notebooks").select("id").limit(1);

    // supabase-js resolves rather than throws on a failed query, so the error
    // has to be checked explicitly or a dead database still reports healthy.
    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { ok: true, checkedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unreachable" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
