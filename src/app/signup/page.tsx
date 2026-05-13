import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "@/components/auth-forms";

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-md">
      <Suspense>
        <SignupForm />
      </Suspense>
      <p className="mt-3 text-sm text-slate-600">
        Already have an account? <Link href="/login" className="text-sky-700">Log in.</Link>
      </p>
    </section>
  );
}
