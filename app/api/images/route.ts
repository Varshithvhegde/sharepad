import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireContentAccess } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteObjects, imagesEnabled, publicUrlFor, putObject } from "@/lib/r2";
import { IMAGE_LIMITS, extensionFor, formatBytes, sniffImageType } from "@/lib/images";

export const runtime = "nodejs";

function fail(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: message }, { status, headers });
}

export async function POST(req: NextRequest) {
  if (!imagesEnabled()) {
    return fail("Image upload is not set up on this server.", 503);
  }

  // Throttled before any work, so a flood of requests costs nothing.
  const limit = await checkRateLimit(
    req,
    "image_upload",
    IMAGE_LIMITS.rateLimit.max,
    IMAGE_LIMITS.rateLimit.windowSeconds
  );
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return fail(
      `That is a lot of images at once. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
      429,
      { "Retry-After": String(limit.retryAfterSeconds) }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail("That upload could not be read.", 400);
  }

  const notebookId = form.get("notebook_id");
  const file = form.get("file");

  if (typeof notebookId !== "string" || !notebookId) {
    return fail("Missing notebook.", 400);
  }
  if (!(file instanceof File)) {
    return fail("No image was attached.", 400);
  }

  // Adding an image is editing, so it needs the same permission as writing.
  const access = await requireContentAccess(req, notebookId);
  if ("error" in access) return access.error;

  if (file.size === 0) {
    return fail("That file is empty.", 400);
  }
  if (file.size > IMAGE_LIMITS.maxBytes) {
    return fail(
      `Images must be under ${formatBytes(IMAGE_LIMITS.maxBytes)}. That one is ${formatBytes(file.size)}.`,
      413
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  // The declared content type is chosen by the caller and proves nothing; the
  // file's own leading bytes are what decide whether this is really an image.
  const detected = sniffImageType(bytes);
  if (!detected) {
    return fail("That is not an image we can use. Try PNG, JPEG, WebP, GIF or AVIF.", 415);
  }

  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("images")
    .select("*", { count: "exact", head: true })
    .eq("notebook_id", access.notebook.id);

  if (countError) {
    return fail("Could not check this notebook's images.", 500);
  }
  if ((count ?? 0) >= IMAGE_LIMITS.maxPerNotebook) {
    return fail(
      `A notebook can hold ${IMAGE_LIMITS.maxPerNotebook} images. Remove one before adding another.`,
      409
    );
  }

  // Random key, so images cannot be found by guessing at the bucket.
  const key = `${access.notebook.id}/${randomBytes(12).toString("hex")}.${extensionFor(detected)}`;

  try {
    await putObject(key, bytes, detected);
  } catch (e) {
    // Logged rather than swallowed: a silent 502 is impossible to diagnose.
    console.error("[images] upload to R2 failed:", e);
    const detail =
      process.env.NODE_ENV === "development" && e instanceof Error ? ` (${e.message})` : "";
    return fail(`The image store did not accept that file. Try again.${detail}`, 502);
  }

  const { error: insertError } = await admin.from("images").insert({
    notebook_id: access.notebook.id,
    object_key: key,
    byte_size: bytes.byteLength,
    content_type: detected,
  });

  if (insertError) {
    // With no row to track it the object would never be cleaned up, so it goes now.
    await deleteObjects([key]);
    return fail("Could not record that image. Try again.", 500);
  }

  return NextResponse.json({
    url: publicUrlFor(key),
    bytes: bytes.byteLength,
    contentType: detected,
  });
}
