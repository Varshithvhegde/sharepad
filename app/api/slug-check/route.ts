import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidSlug, RESERVED_SLUGS } from "@/lib/slug";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim().toLowerCase() ?? "";

  if (!slug) {
    return NextResponse.json({ available: false, reason: "empty" });
  }
  if (!isValidSlug(slug) || RESERVED_SLUGS.has(slug)) {
    return NextResponse.json({ available: false, reason: "invalid" });
  }

  const admin = createAdminClient();
  const { data } = await admin.from("notebooks").select("id").eq("slug", slug).maybeSingle();

  return NextResponse.json({
    available: !data,
    reason: data ? "taken" : "ok",
  });
}
