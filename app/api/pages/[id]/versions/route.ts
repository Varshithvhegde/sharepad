import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNotebookByEditToken } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const token = req.headers.get("x-edit-token");
  if (!token) {
    return NextResponse.json({ error: "Missing edit token" }, { status: 401 });
  }

  const notebook = await getNotebookByEditToken(token);
  if (!notebook) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("notebook_id").eq("id", id).single();
  if (!page || page.notebook_id !== notebook.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data, error } = await admin
    .from("page_versions")
    .select("*")
    .eq("page_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ versions: data });
}
