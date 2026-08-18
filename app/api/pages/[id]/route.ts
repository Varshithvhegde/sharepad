import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireContentAccess } from "@/lib/api-auth";
import { isValidSlug } from "@/lib/slug";
import { maybeAutoUpdatePageSlug } from "@/lib/page-slugs";
import type { UpdatePageInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const VERSIONS_KEPT = 10;

async function authorizePage(req: NextRequest, pageId: string) {
  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("*").eq("id", pageId).single();
  if (!page) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  const access = await requireContentAccess(req, page.notebook_id as string);
  if ("error" in access) return { error: access.error };

  return { page, notebook: access.notebook, isOwner: access.isOwner };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authorizePage(req, id);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as UpdatePageInput;
  const updates: Record<string, unknown> = {};

  const admin = createAdminClient();

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.content !== undefined) updates.content = body.content;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.pinned !== undefined) updates.pinned = body.pinned;

  if (body.slug !== undefined) {
    const slug = body.slug.trim().toLowerCase();
    if (!isValidSlug(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    updates.slug = slug;
  } else if (body.title !== undefined) {
    const nextSlug = await maybeAutoUpdatePageSlug(
      admin,
      auth.page.notebook_id as string,
      auth.page,
      body.title.trim(),
      false
    );
    if (nextSlug) updates.slug = nextSlug;
  }

  // Snapshot the previous text before overwriting it, trimming the oldest.
  if (body.content !== undefined && body.content !== auth.page.content) {
    const { data: versions } = await admin
      .from("page_versions")
      .select("id")
      .eq("page_id", id)
      .order("created_at", { ascending: false });

    if (versions && versions.length >= VERSIONS_KEPT) {
      await admin
        .from("page_versions")
        .delete()
        .in("id", versions.slice(VERSIONS_KEPT - 1).map((v) => v.id));
    }

    await admin.from("page_versions").insert({ page_id: id, content: auth.page.content });
  }

  const { data, error } = await admin
    .from("pages")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ page: data });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authorizePage(req, id);
  if ("error" in auth) return auth.error;

  const admin = createAdminClient();
  const { count } = await admin
    .from("pages")
    .select("*", { count: "exact", head: true })
    .eq("notebook_id", auth.notebook.id);

  if ((count ?? 0) <= 1) {
    return NextResponse.json({ error: "A notebook needs at least one page" }, { status: 400 });
  }

  const { error } = await admin.from("pages").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
