import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEditAccess } from "@/lib/api-auth";
import { generatePageSlug, isValidSlug } from "@/lib/slug";
import type { CreatePageInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  const auth = await requireEditAccess(req);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as CreatePageInput & { notebook_id: string };
  if (body.notebook_id !== auth.notebook.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const title = body.title?.trim() || "Untitled";
  let slug = body.slug?.trim() ? body.slug.trim().toLowerCase() : generatePageSlug(title);

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("pages")
    .select("sort_order")
    .eq("notebook_id", auth.notebook.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data: page, error } = await admin
    .from("pages")
    .insert({
      notebook_id: auth.notebook.id,
      slug,
      title,
      content: body.content || "",
      icon: body.icon || "📄",
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      slug = generatePageSlug(title);
      const retry = await admin
        .from("pages")
        .insert({
          notebook_id: auth.notebook.id,
          slug,
          title,
          content: body.content || "",
          icon: body.icon || "📄",
          sort_order: sortOrder,
        })
        .select("*")
        .single();
      if (retry.error) {
        return NextResponse.json({ error: retry.error.message }, { status: 500 });
      }
      return NextResponse.json({ page: retry.data });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ page });
}
