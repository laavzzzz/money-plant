import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-600">403</p>
        <h1 className="mt-3 text-3xl font-black">Access denied</h1>
        <p className="mt-3 text-slate-600">
          Your account does not have permission to access this area.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white"
        >
          Return to dashboard
        </Link>
      </div>
    </main>
  );
}
