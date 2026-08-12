/** Limits shared by the browser and the server, so both refuse the same things. */
export const IMAGE_LIMITS = {
  /** After client-side compression. Generous, because compression runs first. */
  maxBytes: 5 * 1024 * 1024,
  /** Guards the free tier and stops one notebook becoming an image host. */
  maxPerNotebook: 50,
  /** Longest edge kept when resizing before upload. */
  maxDimension: 1600,
  /**
   * Uploads allowed from one address per window.
   *
   * Set well above what writing looks like — illustrating a page can easily
   * mean a dozen screenshots in a few minutes — while still bounding what a
   * script can push through. The per-notebook cap is what limits any single
   * notebook; this only exists to stop the service being used as a dumping
   * ground across many of them.
   */
  rateLimit: { max: 60, windowSeconds: 600 },
} as const;

export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export function isAllowedImageType(type: string): type is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(type);
}

const EXTENSIONS: Record<AllowedImageType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function extensionFor(type: AllowedImageType): string {
  return EXTENSIONS[type];
}

/**
 * Identifies the format from the file's own leading bytes.
 *
 * The declared Content-Type is chosen by whoever is uploading, so it proves
 * nothing. Reading the signature is what stops something else being stored
 * under an image's name.
 */
export function sniffImageType(bytes: Uint8Array): AllowedImageType | null {
  const startsWith = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  const ascii = (offset: number, text: string) =>
    [...text].every((c, i) => bytes[offset + i] === c.charCodeAt(0));

  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  // AVIF and other ISO-BMFF files declare their brand just after the box size.
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";

  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
