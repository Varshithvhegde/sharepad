"use client";

import { useCallback, useRef, useState } from "react";
import { compressImage } from "./compress-image";
import { IMAGE_LIMITS, formatBytes, isAllowedImageType } from "./images";

interface Options {
  notebookId: string;
  authHeaders: Record<string, string>;
  /** Puts text into the editor at the caret, undoably. */
  insert: (text: string) => void;
  /** Swaps the placeholder for the finished link, or removes it on failure. */
  replaceText: (find: string, replaceWith: string) => void;
  onError: (message: string) => void;
}

/**
 * Uploads an image and writes the Markdown for it.
 *
 * A placeholder goes in immediately so the caret does not jump around while the
 * upload runs, and it carries a unique id so two images pasted in quick
 * succession cannot overwrite one another's link.
 */
export function useImageUpload({
  notebookId,
  authHeaders,
  insert,
  replaceText,
  onError,
}: Options) {
  const [uploading, setUploading] = useState(0);
  const counter = useRef(0);

  const upload = useCallback(
    async (file: File) => {
      if (!isAllowedImageType(file.type)) {
        onError("That file is not an image. Try PNG, JPEG, WebP, GIF or AVIF.");
        return;
      }

      const marker = `uploading-${++counter.current}`;
      const placeholder = `![${marker}]()`;
      insert(placeholder);
      setUploading((n) => n + 1);

      try {
        const prepared = await compressImage(file);

        if (prepared.size > IMAGE_LIMITS.maxBytes) {
          replaceText(placeholder, "");
          onError(
            `Still ${formatBytes(prepared.size)} after compressing — the limit is ${formatBytes(IMAGE_LIMITS.maxBytes)}.`
          );
          return;
        }

        const body = new FormData();
        body.append("notebook_id", notebookId);
        body.append("file", prepared);

        // FormData sets its own multipart boundary, so Content-Type is dropped.
        const { "Content-Type": _dropped, ...headers } = authHeaders;
        void _dropped;

        const res = await fetch("/api/images", { method: "POST", headers, body });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          replaceText(placeholder, "");
          onError(data.error ?? "That image could not be uploaded.");
          return;
        }

        const alt = prepared.name.replace(/\.[^.]+$/, "") || "image";
        replaceText(placeholder, `![${alt}](${data.url})`);
      } catch {
        replaceText(placeholder, "");
        onError("That image could not be uploaded. Check your connection.");
      } finally {
        setUploading((n) => n - 1);
      }
    },
    [notebookId, authHeaders, insert, replaceText, onError]
  );

  /** Pulls images out of a paste or drop, ignoring anything else on the clipboard. */
  const uploadMany = useCallback(
    (files: FileList | File[]) => {
      const images = Array.from(files).filter((f) => isAllowedImageType(f.type));
      images.forEach((file) => void upload(file));
      return images.length;
    },
    [upload]
  );

  return { upload, uploadMany, uploading };
}
