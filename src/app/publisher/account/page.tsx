import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function PublisherAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!(user.role === "publisher" || user.role === "publisher_verified" || user.role === "admin")) redirect("/feed");

  const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, name: true, businessName: true, avatarUrl: true, businessTagline: true, businessCategory: true, businessLocation: true } });

  return (
    <section className="mx-auto max-w-screen-md p-6">
      <h1 className="text-2xl font-semibold">Publisher Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your publisher account details.</p>

      <form
        id="publisher-account-form"
        className="mt-4 grid gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const data = {
            name: (form.elements.namedItem("name") as HTMLInputElement).value,
            businessName: (form.elements.namedItem("businessName") as HTMLInputElement).value,
            avatarUrl: (form.elements.namedItem("avatarUrl") as HTMLInputElement).value,
            businessTagline: (form.elements.namedItem("businessTagline") as HTMLInputElement).value,
            businessCategory: (form.elements.namedItem("businessCategory") as HTMLInputElement).value,
            businessLocation: (form.elements.namedItem("businessLocation") as HTMLInputElement).value,
          };

          try {
            await fetch("/api/me", { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } });
            window.location.reload();
          } catch (err) {
            console.error(err);
            alert("Failed to update account");
          }
        }}
      >
        <label className="text-sm">Display name</label>
        <input name="name" defaultValue={fresh?.name ?? ""} className="rounded border p-2" />

        <label className="text-sm">Publisher name</label>
        <input name="businessName" defaultValue={fresh?.businessName ?? ""} className="rounded border p-2" />

        <label className="text-sm">Avatar URL</label>
        <input name="avatarUrl" defaultValue={fresh?.avatarUrl ?? ""} className="rounded border p-2" />

        <label className="text-sm">Tagline</label>
        <input name="businessTagline" defaultValue={fresh?.businessTagline ?? ""} className="rounded border p-2" />

        <label className="text-sm">Category</label>
        <input name="businessCategory" defaultValue={fresh?.businessCategory ?? ""} className="rounded border p-2" />

        <label className="text-sm">Location</label>
        <input name="businessLocation" defaultValue={fresh?.businessLocation ?? ""} className="rounded border p-2" />

        <div className="mt-3">
          <button type="submit" className="rounded bg-[var(--ni-brand)] px-3 py-2 text-sm font-semibold text-[var(--ni-surface-1)]">Save</button>
        </div>
      </form>
    </section>
  );
}
