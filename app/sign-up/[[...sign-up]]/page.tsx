import { SignUp } from "@clerk/nextjs";

import { hasRealClerkPublishableKey } from "@/lib/clerk-config";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1020] px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_34rem),radial-gradient(circle_at_82%_18%,rgba(16,185,129,0.12),transparent_30rem)]" />
      <div className="relative">
        {hasRealClerkPublishableKey() ? (
          <SignUp />
        ) : (
          <div className="glass-card max-w-md p-8 text-center">
            <h1 className="text-3xl">Clerk is not configured</h1>
            <p className="mt-4 text-sm text-slate-400">
              Add real Clerk keys to .env.local to enable sign up. The app is running in local dev mode for now.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
