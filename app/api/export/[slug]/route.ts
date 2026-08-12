import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEditAccess } from "@/lib/api-auth";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const admin = createAdminClient();

  const { data: notebook } = await admin.from("notebooks").select("id, title").eq("slug", slug).single();
  if (!notebook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: pages } = await admin
    .from("pages")
    .select("slug, title, content, icon")
    .eq("notebook_id", notebook.id)
    .order("sort_order");

  // The icon is a stored identifier, so it is left out of the exported text.
  const md = pages
    ?.map((p) => `# ${p.title}\n\n${p.content}\n\n---\n`)
    .join("\n");

  return new NextResponse(`# ${notebook.title}\n\n${md}`, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.md"`,
    },
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireEditAccess(req);
  if ("error" in auth) return auth.error;

  const { slug } = await params;
  if (auth.notebook.slug !== slug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data: pages } = await admin
    .from("pages")
    .select("*")
    .eq("notebook_id", auth.notebook.id)
    .order("sort_order");

  return NextResponse.json({
    notebook: auth.notebook,
    pages: pages ?? [],
  });
}
