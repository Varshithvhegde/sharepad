import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEditAccess, getNotebookByEditToken } from "@/lib/api-auth";
import { isValidSlug } from "@/lib/slug";
import type { UpdatePageInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

async function authorizePage(req: NextRequest, pageId: string) {
  const token = req.headers.get("x-edit-token");
  if (!token) return { error: Response.json({ error: "Missing edit token" }, { status: 401 }) };

  const notebook = await getNotebookByEditToken(token);
  if (!notebook) return { error: Response.json({ error: "Invalid token" }, { status: 403 }) };

  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("*").eq("id", pageId).single();
  if (!page || page.notebook_id !== notebook.id) {
    return { error: Response.json({ error: "Not found" }, { status: 404 }) };
  }

  return { page, notebook, token };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const auth = await authorizePage(req, id);
  if ("error" in auth) return auth.error;

  const body = (await req.json()) as UpdatePageInput;
  const updates: Record<string, unknown> = {};

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
  }

  const admin = createAdminClient();

  if (body.content !== undefined && body.content !== auth.page.content) {
    const { data: versions } = await admin
      .from("page_versions")
      .select("id")
      .eq("page_id", id)
      .order("created_at", { ascending: false });

    if (versions && versions.length >= 10) {
      const toDelete = versions.slice(9).map((v) => v.id);
      await admin.from("page_versions").delete().in("id", toDelete);
    }

    await admin.from("page_versions").insert({
      page_id: id,
      content: auth.page.content,
    });
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
    return NextResponse.json({ error: "Cannot delete the last page" }, { status: 400 });
  }

  const { error } = await admin.from("pages").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
