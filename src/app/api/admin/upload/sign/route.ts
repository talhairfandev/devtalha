import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/adminSession';

const BUCKET = 'portfolio-images';
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200 MB
const ALLOWED_PREFIXES = ['image/', 'video/'];

/**
 * Issues a one-time signed upload URL so the browser can send large files
 * straight to Supabase Storage. The file body never passes through Next.js,
 * which avoids the middleware (10 MB) and serverless (4.5 MB on Vercel)
 * request body limits.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as {
    fileName?: unknown;
    contentType?: unknown;
    size?: unknown;
  } | null;

  const fileName = typeof body?.fileName === 'string' ? body.fileName : '';
  const contentType = typeof body?.contentType === 'string' ? body.contentType : '';
  const size = typeof body?.size === 'number' ? body.size : 0;

  if (!ALLOWED_PREFIXES.some((prefix) => contentType.startsWith(prefix))) {
    return NextResponse.json({ error: 'Only image and video files are allowed' }, { status: 400 });
  }

  if (size <= 0 || size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `File must be smaller than ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB` },
      { status: 400 }
    );
  }

  const rawExt = fileName.includes('.') ? fileName.split('.').pop() ?? '' : '';
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) || 'bin';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'Could not create upload URL' }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return NextResponse.json({
    path: data.path,
    token: data.token,
    publicUrl: urlData.publicUrl,
  });
}
