import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSession,
} from '@/lib/adminSession';
import {
  getClientIp,
  getRetryAfterSeconds,
  recordFailure,
  resetFailures,
  type RateLimitOptions,
} from '@/lib/rateLimit';

const LOGIN_LIMIT: RateLimitOptions = {
  maxFailures: 5,
  windowMs: 15 * 60 * 1000,
  lockMs: 15 * 60 * 1000,
};

function passwordsMatch(input: string, expected: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  // Compare fixed-length digests' worth of bytes without leaking length via early exit
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

function tooManyAttempts(retryAfter: number) {
  const minutes = Math.ceil(retryAfter / 60);
  return NextResponse.json(
    {
      error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
      retryAfter,
    },
    { status: 429, headers: { 'Retry-After': String(retryAfter), 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  const key = `login:${getClientIp(req.headers)}`;

  const lockedFor = getRetryAfterSeconds(key);
  if (lockedFor > 0) return tooManyAttempts(lockedFor);

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === 'string' ? body.password : '';

  if (password && passwordsMatch(password, expected)) {
    const session = await createAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Server is missing SESSION_SECRET (min 32 characters)' },
        { status: 500 }
      );
    }

    resetFailures(key);
    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE_NAME, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      path: '/',
    });
    return res;
  }

  const newLock = recordFailure(key, LOGIN_LIMIT);
  if (newLock > 0) return tooManyAttempts(newLock);

  // Small fixed delay slows down scripted guessing
  await new Promise((resolve) => setTimeout(resolve, 600));
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
