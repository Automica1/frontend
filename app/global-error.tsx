"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
        <div className="max-w-md space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-300">500</p>
          <h1 className="text-3xl font-bold">Something went wrong</h1>
          <p className="text-sm text-gray-300">{error.message}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
