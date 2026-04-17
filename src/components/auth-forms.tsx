"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type LoginState = { email: string; password: string; error: string | null; loading: boolean };

type SignupState = {
  name: string;
  email: string;
  password: string;
  accountType: "user" | "business_pending";
  businessName: string;
  error: string | null;
  loading: boolean;
};

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({ email: "", password: "", error: null, loading: false });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: state.email, password: state.password }),
    });

    if (!response.ok) {
      const data = await response.json();
      setState((prev) => ({ ...prev, loading: false, error: data.error ?? "Login failed" }));
      return;
    }

    const data = await response.json();
    router.push(data.redirectTo ?? "/feed");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">Welcome back</h2>
      <input className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" type="email" placeholder="Email" required value={state.email} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} />
      <input className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" type="password" placeholder="Password" required value={state.password} onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))} />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={state.loading} className="w-full rounded bg-[var(--ni-brand-cta)] p-2 text-white disabled:opacity-60" type="submit">
        {state.loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<SignupState>({
    name: "",
    email: "",
    password: "",
    accountType: "user",
    businessName: "",
    error: null,
    loading: false,
  });

  const requestedType = searchParams.get("accountType");
  const forceBusiness = requestedType === "business_pending";
  const selectedAccountType: SignupState["accountType"] = forceBusiness ? "business_pending" : state.accountType;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...state, accountType: selectedAccountType }),
    });

    if (!response.ok) {
      const data = await response.json();
      setState((prev) => ({ ...prev, loading: false, error: data.error ?? "Signup failed" }));
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">Create your account</h2>
      <input className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" required placeholder="Full name" value={state.name} onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))} />
      <input className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" type="email" required placeholder="Email" value={state.email} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} />
      <input className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" type="password" required minLength={8} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}" title="Use at least 8 characters including uppercase, lowercase, and number." placeholder="Password" value={state.password} onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))} />
      <select
        className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)]"
        value={selectedAccountType}
        onChange={(e) => setState((p) => ({ ...p, accountType: e.target.value as SignupState["accountType"] }))}
        disabled={forceBusiness}
      >
        <option value="user">Normal user</option>
        <option value="business_pending">Business account (for verification)</option>
      </select>
      {forceBusiness ? (
        <p className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
          Business-owner inquiries require a verified business account. Complete signup as business, then proceed to verification.
        </p>
      ) : null}
      {selectedAccountType === "business_pending" ? (
        <input className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]" required placeholder="Business name" value={state.businessName} onChange={(e) => setState((p) => ({ ...p, businessName: e.target.value }))} />
      ) : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={state.loading} className="w-full rounded bg-emerald-600 p-2 text-white disabled:opacity-60" type="submit">
        {state.loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
