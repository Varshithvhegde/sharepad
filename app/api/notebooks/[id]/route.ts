import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEditAccess } from "@/lib/api-auth";
import { hashPassword } from "@/lib/crypto";
import { stripSensitiveNotebook } from "@/lib/notebooks";
import { deleteObjects } from "@/lib/r2";
import type { UpdateNotebookInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin.from("notebooks").select("*").eq("id", id).single();
  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ notebook: stripSensitiveNotebook(data) });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireEditAccess(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  if (auth.notebook.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as UpdateNotebookInput;
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title.trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.emoji !== undefined) updates.emoji = body.emoji;
  if (body.theme !== undefined) updates.theme = body.theme;
  if (body.font !== undefined) updates.font = body.font;
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.read_only !== undefined) updates.read_only = body.read_only;
  if (body.allow_public_edit !== undefined) updates.allow_public_edit = body.allow_public_edit;
  if (body.burn_after_read !== undefined) updates.burn_after_read = body.burn_after_read;
  if (body.allow_comments !== undefined) updates.allow_comments = body.allow_comments;

  if (body.password === null) {
    updates.password_hash = null;
  } else if (body.password?.trim()) {
    updates.password_hash = await hashPassword(body.password.trim());
  }

  if (body.expiresInDays === null) {
    updates.expires_at = null;
  } else if (body.expiresInDays && body.expiresInDays > 0) {
    const d = new Date();
    d.setDate(d.getDate() + body.expiresInDays);
    updates.expires_at = d.toISOString();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notebooks")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notebook: stripSensitiveNotebook(data) });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireEditAccess(req);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  if (auth.notebook.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Read the keys first: deleting the notebook cascades the rows away, and
  // without them nothing would know which objects to remove from storage.
  const { data: images } = await admin
    .from("images")
    .select("object_key")
    .eq("notebook_id", id);

  const { error } = await admin.from("notebooks").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (images?.length) {
    await deleteObjects(images.map((i) => i.object_key as string));
  }

  return NextResponse.json({ ok: true });
}
