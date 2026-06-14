// import Link from "next/link";

export default function AdminNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-300">404</p>
        <h1 className="text-3xl font-bold">Admin page not found</h1>
        <p className="text-sm text-gray-300">
          This admin route does not exist or was moved.
        </p>
        {/* <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          Go to admin
        </Link> */}
      </div>
    </main>
  );
}
