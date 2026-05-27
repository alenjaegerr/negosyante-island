import { ProfileEditForm } from "@/components/profile-edit-form";

export default function EditBusinessAccount() {
  return (
    <section className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-4">
      <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[color:var(--ni-surface-1)] p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-[color:var(--ni-text-strong)]">Edit Profile</h1>
        <p className="mt-1 text-sm text-[color:var(--ni-text)]">Update your display details, avatar, and background photo.</p>
        <p className="mt-2 text-xs text-[color:var(--ni-muted)]">Your public profile and discovery cards update instantly.</p>
      </div>

      <ProfileEditForm redirectTo="/business/account" />
    </section>
  );
}
