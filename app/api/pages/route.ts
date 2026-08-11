import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireContentAccess } from "@/lib/api-auth";
import { generatePageSlug, isValidSlug } from "@/lib/slug";
import type { CreatePageInput } from "@/lib/types";

const MAX_PAGES = 200;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as CreatePageInput & { notebook_id?: string };
  if (!body.notebook_id) {
    return NextResponse.json({ error: "Missing notebook" }, { status: 400 });
  }

  const access = await requireContentAccess(req, body.notebook_id);
  if ("error" in access) return access.error;

  const admin = createAdminClient();

  const { count } = await admin
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("notebook_id", access.notebook.id);

  if ((count ?? 0) >= MAX_PAGES) {
    return NextResponse.json(
      { error: `A notebook can hold ${MAX_PAGES} pages` },
      { status: 400 }
    );
  }

  const title = body.title?.trim() || "Untitled";
  const requested = body.slug?.trim().toLowerCase();
  if (requested && !isValidSlug(requested)) {
    return NextResponse.json({ error: "Invalid page link" }, { status: 400 });
  }

  const { data: last } = await admin
    .from("pages")
    .select("sort_order")
    .eq("notebook_id", access.notebook.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sortOrder = (last?.[0]?.sort_order ?? -1) + 1;

  // Page links are unique per notebook, so retry once with a random suffix.
  for (const slug of [requested || generatePageSlug(title), generatePageSlug()]) {
    const { data, error } = await admin
      .from("pages")
      .insert({
        notebook_id: access.notebook.id,
        slug,
        title,
        content: body.content || "",
        icon: body.icon || "📄",
        sort_order: sortOrder,
      })
      .select("*")
      .single();

    if (!error) return NextResponse.json({ page: data });
    if (error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not add the page" }, { status: 500 });
}
