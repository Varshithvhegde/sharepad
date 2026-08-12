import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteObjects, imagesEnabled, listObjectKeys } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Removes stored images whose notebook no longer exists.
 *
 * Deleting a notebook through the API clears its objects as it goes, but the
 * nightly expiry job works directly in the database, so those notebooks' images
 * would otherwise sit in the bucket for ever. Object keys are prefixed with the
 * notebook id, which is what makes an orphan recognisable.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.IMAGE_SWEEP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Sweeping is not configured." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  if (!imagesEnabled()) {
    return NextResponse.json({ error: "Image storage is not configured." }, { status: 503 });
  }

  try {
    const keys = await listObjectKeys();
    if (keys.length === 0) {
      return NextResponse.json({ checked: 0, removed: 0 });
    }

    const notebookIds = [...new Set(keys.map((k) => k.split("/")[0]).filter(Boolean))];

    const admin = createAdminClient();
    const { data: alive, error } = await admin
      .from("notebooks")
      .select("id")
      .in("id", notebookIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const living = new Set((alive ?? []).map((n) => n.id as string));
    const orphans = keys.filter((k) => !living.has(k.split("/")[0]));

    if (orphans.length) await deleteObjects(orphans);

    return NextResponse.json({ checked: keys.length, removed: orphans.length });
  } catch (e) {
    console.error("[images] sweep failed:", e);
    return NextResponse.json({ error: "Sweep failed." }, { status: 500 });
  }
}
