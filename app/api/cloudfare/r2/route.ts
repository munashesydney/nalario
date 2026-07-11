import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { r2Service, validateImage } from "@/lib/services/r2.service";

// ---------------------------------------------------------------------------
// POST /api/cloudfare/r2 — Upload an image to Cloudflare R2
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file type and size
    validateImage(file);

    // 4. Generate a unique object key scoped to this user
    const objectKey = r2Service.generateObjectKey(user.id, file.name);

    // 5. Read file bytes
    const buffer = Buffer.from(await file.arrayBuffer());

    // 6. Upload to R2
    const result = await r2Service.uploadImage(buffer, objectKey, file.type);

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    console.error("[R2 Upload Error]", err);

    if (err.message?.includes("Unsupported file type") || err.message?.includes("File too large")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/cloudfare/r2?key=<objectKey> — Delete an image from R2
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract the object key from query params
    const { searchParams } = new URL(request.url);
    const objectKey = searchParams.get("key");

    if (!objectKey) {
      return NextResponse.json(
        { error: "Missing 'key' query parameter" },
        { status: 400 },
      );
    }

    // 3. Ensure the key belongs to this user (security boundary)
    if (!objectKey.startsWith(`images/${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Delete from R2
    const deleted = await r2Service.deleteImage(objectKey);

    if (!deleted) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[R2 Delete Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/cloudfare/r2?key=<objectKey> — Get a pre-signed URL for an image
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Extract the object key
    const { searchParams } = new URL(request.url);
    const objectKey = searchParams.get("key");

    if (!objectKey) {
      return NextResponse.json(
        { error: "Missing 'key' query parameter" },
        { status: 400 },
      );
    }

    // 3. Ensure the key belongs to this user
    if (!objectKey.startsWith(`images/${user.id}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Generate a pre-signed URL
    const signedUrl = await r2Service.getSignedUrl(objectKey);

    return NextResponse.json({ url: signedUrl });
  } catch (err: any) {
    console.error("[R2 Signed URL Error]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
