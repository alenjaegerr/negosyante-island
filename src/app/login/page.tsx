import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <LoginForm />
      <p className="mt-3 text-sm text-[var(--ni-text)]">
        No account yet? <Link href="/signup" className="text-[var(--ni-brand)]">Sign up here.</Link>
      </p>
    </section>
  );
}
