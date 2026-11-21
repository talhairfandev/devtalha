import { NextRequest, NextResponse } from 'next/server';
import { getManagedStoragePathFromUrl } from '@/lib/admin/uploads';
import { createAdminClient } from '@/lib/supabase';
import { isAdminRequest } from '@/lib/adminSession';

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { url?: string } | null;
  const url = typeof body?.url === 'string' ? body.url : '';
  const objectPath = getManagedStoragePathFromUrl(url);

  if (!objectPath) {
    return NextResponse.json({ error: 'Only portfolio bucket media can be deleted' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from('portfolio-images').remove([objectPath]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
