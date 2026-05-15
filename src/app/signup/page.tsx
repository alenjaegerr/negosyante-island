import Link from "next/link";
import { Suspense } from "react";
import { SignupForm } from "@/components/auth-forms";

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-md">
      <Suspense
        fallback={
          <div className="rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-sm text-[var(--ni-text)]">
            Loading signup form...
          </div>
        }
      >
        <SignupForm />
      </Suspense>
      <p className="mt-3 text-sm text-[var(--ni-text)]">
        Already have an account? <Link href="/login" className="text-[var(--ni-brand)]">Log in.</Link>
      </p>
    </section>
  );
}
