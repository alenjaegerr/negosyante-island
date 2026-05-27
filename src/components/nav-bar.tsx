import { getCurrentUser } from "@/lib/auth";
import { NavShell } from "@/components/nav-shell";
import { PresenceHeartbeat } from "@/components/presence-heartbeat";

export async function NavBar() {
  const user = await getCurrentUser();

  return (
    <>
      <NavShell
        isAuthenticated={Boolean(user)}
        role={user?.role ?? null}
        displayName={user?.name ?? null}
        businessName={user?.businessName ?? null}
        avatarUrl={user?.avatarUrl ?? null}
      />
      {user ? <PresenceHeartbeat /> : null}
    </>
  );
}
