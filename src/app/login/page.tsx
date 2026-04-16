import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md">
      <LoginForm />
      <p className="mt-3 text-sm text-slate-600">
        No account yet? <Link href="/signup" className="text-sky-700">Sign up here.</Link>
      </p>
    </section>
  );
}
