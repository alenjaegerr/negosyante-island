import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/feed");
  }

  return (
    <section className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-sky-700">Negosyante Island</h1>
      <p className="mt-3 text-slate-700">
        A curated social media + internet culture analytics platform for users, verified businesses, and admins.
      </p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded bg-sky-600 px-4 py-2 text-white" href="/login">Login</Link>
        <Link className="rounded border px-4 py-2" href="/signup">Create account</Link>
      </div>
    </section>
  );
}
