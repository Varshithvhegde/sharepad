"use client";

import { IMAGE_LIMITS, isAllowedImageType } from "./images";

/**
 * Shrinks an image in the browser before it is uploaded.
 *
 * A photo straight off a phone is several megabytes and far wider than any
 * screen it will be read on. Resizing and re-encoding to WebP typically cuts it
 * by an order of magnitude, which matters more for staying inside a free tier
 * than any choice of storage provider.
 *
 * Animated GIFs are passed through untouched: drawing one to a canvas would
 * keep the first frame and silently throw the animation away.
 */
export async function compressImage(file: File): Promise<File> {
  if (!isAllowedImageType(file.type)) return file;
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file; // undecodable here; let the server have the final say
  }

  const { width, height } = bitmap;
  const longest = Math.max(width, height);
  const scale = longest > IMAGE_LIMITS.maxDimension ? IMAGE_LIMITS.maxDimension / longest : 1;

  // Nothing to gain from re-encoding a small file that is already efficient.
  if (scale === 1 && file.size < 400 * 1024) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.82)
  );

  // Keep whichever is smaller; re-encoding does occasionally lose.
  if (!blob || blob.size >= file.size) return file;

  const name = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${name}.webp`, { type: "image/webp" });
}
