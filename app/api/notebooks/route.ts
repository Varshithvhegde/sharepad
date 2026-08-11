import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  generateEditToken,
  hashEditToken,
  hashPassword,
} from "@/lib/crypto";
import { generateSlug, generatePageSlug, isValidSlug } from "@/lib/slug";
import { stripSensitiveNotebook } from "@/lib/notebooks";
import type { CreateNotebookInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateNotebookInput;
    const title = body.title?.trim() || "Untitled Notebook";
    let slug = body.slug?.trim() ? body.slug.trim().toLowerCase() : generateSlug(title);

    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { error: "Invalid slug. Use lowercase letters, numbers, and hyphens." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const existing = await admin.from("notebooks").select("id").eq("slug", slug).maybeSingle();
    if (existing.data) {
      slug = generateSlug(title);
    }

    const editToken = generateEditToken();
    const editTokenHash = hashEditToken(editToken);

    let passwordHash: string | null = null;
    if (body.password?.trim()) {
      passwordHash = await hashPassword(body.password.trim());
    }

    let expiresAt: string | null = null;
    if (body.expiresInDays && body.expiresInDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + body.expiresInDays);
      expiresAt = d.toISOString();
    }

    const { data: notebook, error } = await admin
      .from("notebooks")
      .insert({
        slug,
        title,
        description: body.description?.trim() || null,
        emoji: body.emoji || "📝",
        theme: body.theme || "dark",
        edit_token_hash: editTokenHash,
        password_hash: passwordHash,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const pageSlug = generatePageSlug("welcome");
    await admin.from("pages").insert({
      notebook_id: notebook.id,
      slug: pageSlug,
      title: "Welcome",
      icon: "👋",
      content: `# Welcome to ${title}

This is your first page. Start writing in **markdown**!

## Features
- Multi-page notebooks in one link
- Live markdown preview
- Share view & edit links separately
- No signup required

> Save your **edit link** — it's the only way to manage this notebook.
`,
      sort_order: 0,
    });

    return NextResponse.json({
      notebook: stripSensitiveNotebook(notebook),
      editToken,
      editUrl: `/e/${editToken}`,
      viewUrl: `/n/${slug}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create notebook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
