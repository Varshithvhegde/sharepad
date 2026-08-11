import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashEditToken } from "@/lib/crypto";

type NotebookRow = Record<string, unknown> & {
  id: string;
  slug: string;
  read_only: boolean;
  allow_public_edit: boolean;
};

/** Looks the notebook up by the token's hash rather than scanning every row. */
export async function getNotebookByEditToken(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("notebooks")
    .select("*")
    .eq("edit_token_hash", hashEditToken(token))
    .maybeSingle();

  return (data as NotebookRow | null) ?? null;
}

export function getEditTokenFromRequest(req: NextRequest): string | null {
  return (
    req.headers.get("x-edit-token") ??
    req.nextUrl.searchParams.get("token") ??
    null
  );
}

/** Owner-level access. Required for anything that changes notebook settings. */
export async function requireEditAccess(req: NextRequest) {
  const token = getEditTokenFromRequest(req);
  if (!token) {
    return { error: Response.json({ error: "Missing edit token" }, { status: 401 }) };
  }
  const notebook = await getNotebookByEditToken(token);
  if (!notebook) {
    return { error: Response.json({ error: "Invalid edit token" }, { status: 403 }) };
  }
  return { notebook, token };
}

/**
 * Access to a notebook's *content*. Satisfied either by the edit token or,
 * when the owner has opened the notebook up, by anyone at all.
 * Settings still require the token — otherwise a visitor could lock the owner out.
 */
export async function requireContentAccess(req: NextRequest, notebookId: string) {
  const token = getEditTokenFromRequest(req);

  if (token) {
    const notebook = await getNotebookByEditToken(token);
    if (notebook && notebook.id === notebookId) {
      if (notebook.read_only) {
        return { error: Response.json({ error: "This notebook is read-only" }, { status: 403 }) };
      }
      return { notebook, isOwner: true as const };
    }
  }

  const admin = createAdminClient();
  const { data } = await admin.from("notebooks").select("*").eq("id", notebookId).maybeSingle();
  const notebook = data as NotebookRow | null;

  if (!notebook) {
    return { error: Response.json({ error: "Not found" }, { status: 404 }) };
  }
  if (!notebook.allow_public_edit) {
    return { error: Response.json({ error: "This notebook is not open for editing" }, { status: 403 }) };
  }
  if (notebook.read_only) {
    return { error: Response.json({ error: "This notebook is read-only" }, { status: 403 }) };
  }

  return { notebook, isOwner: false as const };
}
