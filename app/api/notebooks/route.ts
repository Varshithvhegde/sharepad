import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateEditToken, hashEditToken, hashPassword } from "@/lib/crypto";
import { generateSlug, generatePageSlug, isValidSlug, RESERVED_SLUGS } from "@/lib/slug";
import { stripSensitiveNotebook } from "@/lib/notebooks";
import { DEFAULT_EXPIRY_DAYS } from "@/lib/expiry";
import { WELCOME_PAGE } from "@/lib/templates";
import type { CreateNotebookInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateNotebookInput;
    const title = body.title?.trim() || "Untitled notebook";
    const requestedSlug = body.slug?.trim().toLowerCase();

    let slug: string;
    if (requestedSlug) {
      if (!isValidSlug(requestedSlug) || RESERVED_SLUGS.has(requestedSlug)) {
        return NextResponse.json(
          { error: "That link is not available. Use letters, numbers and hyphens." },
          { status: 400 }
        );
      }
      slug = requestedSlug;
    } else {
      slug = generateSlug(title);
    }

    const admin = createAdminClient();
    const existing = await admin.from("notebooks").select("id").eq("slug", slug).maybeSingle();
    if (existing.data) {
      if (requestedSlug) {
        return NextResponse.json({ error: "That link is already taken." }, { status: 409 });
      }
      slug = generateSlug(title);
    }

    const editToken = generateEditToken();

    let passwordHash: string | null = null;
    if (body.password?.trim()) {
      passwordHash = await hashPassword(body.password.trim());
    }

    // `null` means keep forever; omitting the field falls back to the default window.
    const expiryDays =
      body.expiresInDays === null
        ? null
        : typeof body.expiresInDays === "number" && body.expiresInDays > 0
          ? body.expiresInDays
          : DEFAULT_EXPIRY_DAYS;

    let expiresAt: string | null = null;
    if (expiryDays !== null) {
      const d = new Date();
      d.setDate(d.getDate() + expiryDays);
      expiresAt = d.toISOString();
    }

    const { data: notebook, error } = await admin
      .from("notebooks")
      .insert({
        slug,
        title,
        description: body.description?.trim() || null,
        emoji: body.emoji || "📝",
        theme: body.theme || "plain",
        font: body.font || "hand",
        allow_public_edit: body.allowPublicEdit ?? false,
        edit_token_hash: hashEditToken(editToken),
        password_hash: passwordHash,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const pages = body.pages?.length
      ? body.pages
      : [{ title: "First page", icon: "👋", content: WELCOME_PAGE(title) }];

    await admin.from("pages").insert(
      pages.map((p, i) => ({
        notebook_id: notebook.id,
        slug: generatePageSlug(p.title) + (i > 0 ? `-${i}` : ""),
        title: p.title,
        icon: p.icon || "📄",
        content: p.content || "",
        sort_order: i,
      }))
    );

    return NextResponse.json({
      notebook: stripSensitiveNotebook(notebook),
      editToken,
      editUrl: `/e/${editToken}`,
      viewUrl: `/n/${slug}`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not create the notebook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
