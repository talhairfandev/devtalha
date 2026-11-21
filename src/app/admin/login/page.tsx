"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowUpRight, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [locked, setLocked] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!password.trim()) {
      setError('Enter your password to continue.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace('/admin');
        return;
      }

      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(
        res.status === 401
          ? 'Incorrect password. Please try again.'
          : payload?.error ?? 'Sign in failed. Please try again.'
      );
      if (res.status === 429) setLocked(true);
      setPassword('');
    } catch {
      setError('Unable to reach the server. Check your connection and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-zinc-100 px-4 py-10">
      {/* Soft background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(24,24,27,0.06), transparent 40%), radial-gradient(circle at 85% 85%, rgba(24,24,27,0.05), transparent 45%)',
        }}
      />

      <main className="admin-main admin-fade-in relative w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Sign in to manage your portfolio content.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl shadow-zinc-900/5 sm:p-7"
        >
          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-[13px] font-semibold text-zinc-800">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                  if (locked) setLocked(false);
                }}
                onKeyUp={(e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)}
                onBlur={() => setCapsLock(false)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                autoFocus
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'admin-login-error' : undefined}
                className={`block h-11 w-full rounded-lg border bg-white pl-3 pr-11 text-sm text-zinc-900 shadow-sm transition-colors placeholder:text-zinc-400 hover:border-zinc-400 focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
                    : 'border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-zinc-400 transition-colors hover:text-zinc-700"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {capsLock && !error && (
              <p className="text-xs text-amber-600">Caps Lock is on.</p>
            )}
          </div>

          {error && (
            <div
              id="admin-login-error"
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              <AlertCircle size={14} className="mt-px shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || locked}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3 text-xs text-zinc-500">
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={13} />
            Restricted area. Authorized access only.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            Back to website
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </main>
    </div>
  );
}
