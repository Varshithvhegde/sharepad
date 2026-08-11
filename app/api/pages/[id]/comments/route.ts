import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("comments")
    .select("*")
    .eq("page_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { author_name, content } = (await req.json()) as {
    author_name?: string;
    content?: string;
  };

  if (!content?.trim()) {
    return NextResponse.json({ error: "Comment required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: page } = await admin.from("pages").select("notebook_id").eq("id", id).single();
  if (!page) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }

  const { data: notebook } = await admin
    .from("notebooks")
    .select("allow_comments, visibility")
    .eq("id", page.notebook_id)
    .single();

  if (!notebook?.allow_comments) {
    return NextResponse.json({ error: "Comments disabled" }, { status: 403 });
  }

  const { data, error } = await admin
    .from("comments")
    .insert({
      page_id: id,
      author_name: author_name?.trim() || "Anonymous",
      content: content.trim(),
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment: data });
}
