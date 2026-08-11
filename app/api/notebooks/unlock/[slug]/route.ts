import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPassword } from "@/lib/crypto";
import { stripSensitiveNotebook } from "@/lib/notebooks";

type Params = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const { password } = (await req.json()) as { password?: string };

  if (!password?.trim()) {
    return NextResponse.json({ error: "Password required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: notebook, error } = await admin
    .from("notebooks")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !notebook) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!notebook.password_hash) {
    return NextResponse.json({ error: "No password set" }, { status: 400 });
  }

  const valid = await verifyPassword(password.trim(), notebook.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({
    ok: true,
    notebook: stripSensitiveNotebook(notebook),
  });

  res.cookies.set(`sp_unlock_${slug}`, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return res;
}
