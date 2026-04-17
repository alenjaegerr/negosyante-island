import Link from "next/link";
import { SignupForm } from "@/components/auth-forms";

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-md">
      <SignupForm />
      <p className="mt-3 text-sm text-[var(--ni-text)]">
        Already have an account? <Link href="/login" className="text-[var(--ni-brand)]">Log in.</Link>
      </p>
    </section>
  );
}
