"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginState = { email: string; password: string; error: string | null; loading: boolean };

type SignupState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: "user" | "business_pending" | "marketing_pending";
  businessName: string;
  acceptedPolicies: boolean;
  error: string | null;
  loading: boolean;
};

async function readResponseError(response: Response, fallbackMessage: string) {
  const body = await response.text().catch(() => "");
  if (!body) return fallbackMessage;

  try {
    const parsed = JSON.parse(body) as { error?: string };
    return parsed.error ?? fallbackMessage;
  } catch {
    return body || fallbackMessage;
  }
}

const inputClassName = "w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]";

async function postJson(url: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function LoginForm() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>({ email: "", password: "", error: null, loading: false });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await postJson("/api/auth/login", {
        email: state.email,
        password: state.password,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string; verificationRequired?: boolean; verifyEmailPath?: string } | null;

        if (payload?.verificationRequired && payload.verifyEmailPath) {
          router.push(payload.verifyEmailPath);
          return;
        }

        const errorMessage = payload?.error ?? (await readResponseError(response, "Login failed"));
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return;
      }

      const data = (await response.json()) as { redirectTo?: string };
      router.push(data.redirectTo ?? "/feed");
      router.refresh();
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Unable to reach the login service. Please try again.",
      }));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">Welcome back</h2>
      <input className={inputClassName} type="email" placeholder="Email" required value={state.email} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} />
      <input className={inputClassName} type="password" placeholder="Password" required value={state.password} onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))} />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={state.loading} className="w-full rounded bg-[var(--ni-brand-cta)] p-2 text-white disabled:opacity-60" type="submit">
        {state.loading ? "Signing in..." : "Sign in"}
      </button>
      <div className="flex flex-col gap-2 text-center text-sm text-[color:var(--ni-text)] sm:flex-row sm:justify-between">
        <Link href="/forgot-password" className="font-semibold text-[color:var(--ni-brand)]">
          Forgot password?
        </Link>
        <Link href="/verify-email" className="font-semibold text-[color:var(--ni-brand)]">
          Verify email
        </Link>
      </div>
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
    confirmPassword: "",
    accountType: "user",
    businessName: "",
    acceptedPolicies: false,
    error: null,
    loading: false,
  });

  const requestedType = searchParams.get("accountType");
  const forceBusiness = requestedType === "business_pending";
  const forceMarketing = requestedType === "marketing_pending";
  const selectedAccountType: SignupState["accountType"] = forceBusiness
    ? "business_pending"
    : forceMarketing
      ? "marketing_pending"
      : state.accountType;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.acceptedPolicies) {
      setState((prev) => ({ ...prev, loading: false, error: "You must agree to the Terms of Use and Privacy Policy." }));
      return;
    }

    if (state.password !== state.confirmPassword) {
      setState((prev) => ({ ...prev, loading: false, error: "Passwords do not match" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await postJson("/api/auth/signup", {
        ...state,
        accountType: selectedAccountType,
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response, "Signup failed");
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return;
      }

      const data = (await response.json()) as { email?: string; verifyEmailPath?: string };
      const nextEmail = data.email ?? state.email;
      router.push(data.verifyEmailPath ?? `/verify-email?email=${encodeURIComponent(nextEmail)}`);
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Unable to reach the signup service. Please try again.",
      }));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">Create your account</h2>
      <input className={inputClassName} required placeholder="Full name" value={state.name} onChange={(e) => setState((p) => ({ ...p, name: e.target.value }))} />
      <input className={inputClassName} type="email" required placeholder="Email" value={state.email} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} />
      <input className={inputClassName} type="password" required placeholder="Password" value={state.password} onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))} />
      <input className={inputClassName} type="password" required placeholder="Confirm password" value={state.confirmPassword} onChange={(e) => setState((p) => ({ ...p, confirmPassword: e.target.value }))} />
      <label className="flex items-start gap-2 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3 text-sm text-[var(--ni-text)]">
        <input
          type="checkbox"
          checked={state.acceptedPolicies}
          onChange={(e) => setState((p) => ({ ...p, acceptedPolicies: e.target.checked }))}
          className="mt-1 h-4 w-4 rounded border-[color:var(--ni-border)]"
          required
        />
        <span>
          I agree to the <a href="/legal" className="font-semibold text-[color:var(--ni-brand)]">Terms of Use</a> and <a href="/privacy-policy" className="font-semibold text-[color:var(--ni-brand)]">Privacy Policy</a>.
        </span>
      </label>
      <select
        className={inputClassName}
        value={selectedAccountType}
        onChange={(e) => setState((p) => ({ ...p, accountType: e.target.value as SignupState["accountType"] }))}
        disabled={forceBusiness || forceMarketing}
      >
        <option value="user">Aspiring Negosyante</option>
        <option value="business_pending">Business account (for verification)</option>
        <option value="marketing_pending">Marketing expert (for verification)</option>
      </select>
      {forceBusiness || forceMarketing ? (
        <p className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-900">
          {forceBusiness
            ? "Business-owner inquiries require a verified business account. Complete signup as business, then proceed to verification."
            : "Marketing expert inquiries require a verified marketing account. Complete signup as a marketing expert, then proceed to verification."}
        </p>
      ) : null}
      {selectedAccountType === "business_pending" || selectedAccountType === "marketing_pending" ? (
        <input className={inputClassName} required placeholder={selectedAccountType === "marketing_pending" ? "Agency or brand name" : "Business name"} value={state.businessName} onChange={(e) => setState((p) => ({ ...p, businessName: e.target.value }))} />
      ) : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={state.loading} className="w-full rounded bg-emerald-600 p-2 text-white disabled:opacity-60" type="submit">
        {state.loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}

type EmailVerificationState = {
  email: string;
  code: string;
  error: string | null;
  loading: boolean;
  success: string | null;
  codeRequested: boolean;
};

export function EmailVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [state, setState] = useState<EmailVerificationState>({
    email: initialEmail,
    code: "",
    error: null,
    loading: false,
    success: null,
    codeRequested: false,
  });

  async function requestCode() {
    if (!state.email.trim()) {
      setState((prev) => ({ ...prev, error: "Enter your email first." }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, success: null }));
    try {
      const response = await postJson("/api/auth/request-email-verification", { email: state.email });
      if (!response.ok) {
        setState((prev) => ({ ...prev, loading: false, error: "Unable to resend the code right now." }));
        return;
      }

      setState((prev) => ({ ...prev, loading: false, success: "A verification code has been sent.", codeRequested: true }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Unable to reach the verification service. Please try again." }));
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.codeRequested) {
      await requestCode();
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, success: null }));

    try {
      const response = await postJson("/api/auth/verify-email", {
        email: state.email,
        code: state.code,
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response, "Verification failed");
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return;
      }

      const data = (await response.json()) as { redirectTo?: string } | null;
      router.push(data?.redirectTo ?? "/feed");
      router.refresh();
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Unable to reach the verification service. Please try again." }));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">One More Step</h2>
      <p className="text-sm text-[color:var(--ni-text)]">
        {state.codeRequested
          ? "We have sent a code to your email. Copy and paste the 6 digit code here."
          : "Enter your email and request a verification code first."}
      </p>
      <input className={inputClassName} type="email" required placeholder="Email" value={state.email} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} />
      {state.codeRequested ? (
        <input className={inputClassName} inputMode="numeric" pattern="[0-9]*" maxLength={6} required placeholder="6-digit code" value={state.code} onChange={(e) => setState((p) => ({ ...p, code: e.target.value }))} />
      ) : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={state.loading} className="w-full rounded bg-[var(--ni-brand-cta)] p-2 text-white disabled:opacity-60" type="submit">
        {state.loading ? (state.codeRequested ? "Verifying..." : "Sending code...") : state.codeRequested ? "Verify email" : "Send verification code"}
      </button>
      {state.codeRequested ? (
        <button type="button" onClick={requestCode} disabled={state.loading || !state.email.trim()} className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-2 text-[var(--ni-text-strong)] disabled:opacity-60">
          Resend code
        </button>
      ) : null}
    </form>
  );
}

type ResetPasswordState = {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
  error: string | null;
  loading: boolean;
  codeRequested: boolean;
};

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch {
      setError("Unable to reach the reset service. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">Forgot your password?</h2>
      <p className="text-sm text-[color:var(--ni-text)]">Enter your email and continue to request a reset code.</p>
      <input className={inputClassName} type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={loading} className="w-full rounded bg-[var(--ni-brand-cta)] p-2 text-white disabled:opacity-60" type="submit">
        {loading ? "Continuing..." : "Continue"}
      </button>
    </form>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResetPasswordState>({
    email: searchParams.get("email") ?? "",
    code: "",
    password: "",
    confirmPassword: "",
    error: null,
    loading: false,
    codeRequested: false,
  });

  async function requestCode() {
    if (!state.email.trim()) {
      setState((prev) => ({ ...prev, error: "Enter your email first." }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await postJson("/api/auth/request-password-reset", { email: state.email });
      if (!response.ok) {
        setState((prev) => ({ ...prev, loading: false, error: "Unable to request a reset code right now." }));
        return;
      }

      setState((prev) => ({ ...prev, loading: false, codeRequested: true, error: null }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Unable to reach the reset service. Please try again." }));
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!state.codeRequested) {
      await requestCode();
      return;
    }

    if (state.password !== state.confirmPassword) {
      setState((prev) => ({ ...prev, error: "Passwords do not match", loading: false }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await postJson("/api/auth/reset-password", {
        email: state.email,
        code: state.code,
        password: state.password,
        confirmPassword: state.confirmPassword,
      });

      if (!response.ok) {
        const errorMessage = await readResponseError(response, "Password reset failed");
        setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
        return;
      }

      const data = (await response.json()) as { redirectTo?: string } | null;
      router.push(data?.redirectTo ?? "/feed");
      router.refresh();
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Unable to reach the reset service. Please try again." }));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-6 text-[var(--ni-text-strong)]">
      <h2 className="text-xl font-semibold text-[var(--ni-text-strong)]">Reset your password</h2>
      <p className="text-sm text-[color:var(--ni-text)]">
        {state.codeRequested
          ? "Enter the code from your email and choose a new password."
          : "Enter your email and request a reset code first."}
      </p>
      <input className={inputClassName} type="email" placeholder="Email" required value={state.email} onChange={(e) => setState((p) => ({ ...p, email: e.target.value }))} />
      {state.codeRequested ? (
        <>
          <input className={inputClassName} inputMode="numeric" pattern="[0-9]*" maxLength={6} required placeholder="6-digit code" value={state.code} onChange={(e) => setState((p) => ({ ...p, code: e.target.value }))} />
          <input className={inputClassName} type="password" placeholder="New password" required value={state.password} onChange={(e) => setState((p) => ({ ...p, password: e.target.value }))} />
          <input className={inputClassName} type="password" placeholder="Confirm new password" required value={state.confirmPassword} onChange={(e) => setState((p) => ({ ...p, confirmPassword: e.target.value }))} />
        </>
      ) : null}
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button disabled={state.loading} className="w-full rounded bg-[var(--ni-brand-cta)] p-2 text-white disabled:opacity-60" type="submit">
        {state.loading ? (state.codeRequested ? "Resetting..." : "Sending code...") : state.codeRequested ? "Reset password" : "Send reset code"}
      </button>
    </form>
  );
}
