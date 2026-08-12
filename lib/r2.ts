import { AwsClient } from "aws4fetch";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");

/**
 * Image upload stays switched off until every piece is present, so a checkout
 * without R2 keys runs exactly as before rather than failing halfway through
 * an upload.
 */
export function imagesEnabled(): boolean {
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicBaseUrl);
}

function client(): AwsClient {
  return new AwsClient({
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    service: "s3",
    region: "auto",
  });
}

function objectUrl(key: string): string {
  return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
}

/** The address readers load the image from. */
export function publicUrlFor(key: string): string {
  return `${publicBaseUrl}/${key}`;
}

/**
 * Stores an object, retrying once on a server-side failure.
 *
 * Object stores occasionally return a 500 that succeeds on the next attempt,
 * and losing someone's screenshot to a blip they cannot see or act on is a poor
 * trade for one extra request.
 */
export async function putObject(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<void> {
  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    const res = await client().fetch(objectUrl(key), {
      method: "PUT",
      body: body as BodyInit,
      headers: {
        "Content-Type": contentType,
        // Keys carry a random component and are never reused, so a long cache
        // is safe and keeps repeat views off the origin entirely.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

    if (res.ok) return;

    lastStatus = res.status;
    lastBody = await res.text().catch(() => "");

    // A rejection is a rejection; only server-side faults are worth repeating.
    if (res.status < 500) break;
    if (attempt === 1) await new Promise((r) => setTimeout(r, 250));
  }

  throw new Error(`R2 refused the upload (${lastStatus}) ${lastBody.slice(0, 200)}`);
}

/** Every key in the bucket, following pagination. */
export async function listObjectKeys(): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;

  do {
    const url = new URL(`https://${accountId}.r2.cloudflarestorage.com/${bucket}`);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("max-keys", "1000");
    if (token) url.searchParams.set("continuation-token", token);

    const res = await client().fetch(url.toString());
    if (!res.ok) throw new Error(`R2 refused the listing (${res.status})`);

    const xml = await res.text();
    for (const match of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) keys.push(match[1]);

    token = /<IsTruncated>true<\/IsTruncated>/.test(xml)
      ? xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)?.[1]
      : undefined;
  } while (token);

  return keys;
}

/** Best-effort removal; a leftover object is tidied by the sweep instead. */
export async function deleteObjects(keys: string[]): Promise<void> {
  await Promise.all(
    keys.map((key) =>
      client()
        .fetch(objectUrl(key), { method: "DELETE" })
        .catch(() => null)
    )
  );
}
