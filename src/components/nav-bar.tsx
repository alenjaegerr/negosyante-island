import { getCurrentUser } from "@/lib/auth";
import { NavShell } from "@/components/nav-shell";

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <NavShell
      isAuthenticated={Boolean(user)}
      role={user?.role ?? null}
      displayName={user?.name ?? null}
      businessName={user?.businessName ?? null}
    />
  );
}
