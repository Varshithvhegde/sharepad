import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyEditToken } from "@/lib/crypto";

export async function getNotebookByEditToken(token: string) {
  const admin = createAdminClient();
  const { data: notebooks, error } = await admin.from("notebooks").select("*");
  if (error || !notebooks) return null;

  const notebook = notebooks.find((n) =>
    verifyEditToken(token, n.edit_token_hash as string)
  );
  return notebook ?? null;
}

export function getEditTokenFromRequest(req: NextRequest): string | null {
  return (
    req.headers.get("x-edit-token") ??
    req.nextUrl.searchParams.get("token") ??
    null
  );
}

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
