import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  NoSuchKey,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "../supabase/server";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface R2UploadResult {
  /** Public URL or pre-signed URL to access the image */
  url: string;
  /** R2 object key, used for deletion / management */
  objectKey: string;
}

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
  region?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate an uploaded image file.
 */
export function validateImage(file: { name: string; type: string; size: number }): void {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error(
      `Unsupported file type "${file.type}". Allowed: ${Array.from(ALLOWED_MIME_TYPES).join(", ")}`,
    );
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 10 MB.`);
  }
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

function getConfig(): R2Config {
  return {
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "",
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || undefined,
    region: process.env.CLOUDFLARE_R2_BUCKET_REGION || "auto",
  };
}

// ---------------------------------------------------------------------------
// Client (cached singleton)
// ---------------------------------------------------------------------------

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (_client) return _client;

  const config = getConfig();

  _client = new S3Client({
    region: config.region,
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return _client;
}

// ---------------------------------------------------------------------------
// Public Service API
// ---------------------------------------------------------------------------

export const r2Service = {
  /**
   * Upload a file buffer to R2.
   *
   * @param buffer     The raw file bytes
   * @param objectKey  The full R2 object key (e.g. `users/uuid/abc123.png`)
   * @param contentType  The MIME type (e.g. `image/png`)
   * @returns An object with the accessible URL and the object key
   */
  async uploadImage(
    buffer: Buffer | ArrayBuffer,
    objectKey: string,
    contentType: string,
  ): Promise<R2UploadResult> {
    const config = getConfig();
    const client = getClient();

    const body =
      buffer instanceof ArrayBuffer ? Buffer.from(buffer) : buffer;

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
        Body: body,
        ContentType: contentType,
      }),
    );

    return {
      url: config.publicUrl
        ? `${config.publicUrl}/${objectKey}`
        : await this.getSignedUrl(objectKey),
      objectKey,
    };
  },

  /**
   * Generate a short-lived pre-signed GET URL for secure access to private
   * objects.  Falls back automatically when no publicUrl is configured.
   */
  async getSignedUrl(objectKey: string, expiresIn = 3600): Promise<string> {
    const config = getConfig();
    const client = getClient();

    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: config.bucketName,
        Key: objectKey,
      }),
      { expiresIn },
    );
  },

  /**
   * Delete an image from R2.  Returns `true` if successfully deleted,
   * `false` if the object didn't exist, and throws on other errors.
   */
  async deleteImage(objectKey: string): Promise<boolean> {
    const config = getConfig();
    const client = getClient();

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucketName,
          Key: objectKey,
        }),
      );
      return true;
    } catch (err) {
      if (err instanceof NoSuchKey) return false;
      throw err;
    }
  },

  /**
   * Build a deterministic object key scoped to the authenticated user.
   *
   * Format: `images/{userId}/{uuid}.{ext}`
   */
  generateObjectKey(userId: string, originalName: string): string {
    const ext = originalName.split(".").pop()?.toLowerCase() || "png";
    return `images/${userId}/${randomUUID()}.${ext}`;
  },

  /**
   * Extract the object key from a full R2 URL.
   */
  objectKeyFromUrl(url: string): string | null {
    const config = getConfig();
    // Try public URL prefix first
    if (config.publicUrl && url.startsWith(config.publicUrl)) {
      return url.slice(config.publicUrl.length + 1); // +1 for trailing /
    }
    // Fall back: try to match the /images/ prefix pattern
    const match = url.match(/\/images\/(.+)/);
    return match ? match[1] : null;
  },
};
