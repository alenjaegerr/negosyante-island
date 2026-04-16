import Link from "next/link";
import { Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href={user ? "/feed" : "/"} className="font-bold text-sky-700">
          Negosyante Island
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <Link href="/feed">Feed</Link>
              <Link href="/trending">Trending Q</Link>
              {user.role === Role.business_pending ? <Link href="/business/pending">Business Verify</Link> : null}
              {user.role === Role.business_verified ? <Link href="/business/dashboard">Business Dashboard</Link> : null}
              {user.role === Role.admin ? <Link href="/admin">Admin Panel</Link> : null}
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="rounded bg-zinc-900 px-3 py-1 text-white">Logout</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Signup</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
