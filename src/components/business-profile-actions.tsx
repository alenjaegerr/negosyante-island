"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type BusinessProfileActionsProps = {
  slug: string;
  businessName: string;
  baseFollowers: number;
  contactOptions: string[];
  viewerRole: "guest" | "user" | "business_pending" | "business_verified" | "admin";
};

type MessageFormState = {
  name: string;
  age: string;
  option: string;
  note: string;
};

export function BusinessProfileActions({
  slug,
  businessName,
  baseFollowers,
  contactOptions,
  viewerRole,
}: BusinessProfileActionsProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState(baseFollowers);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<MessageFormState>({
    name: "",
    age: "",
    option: contactOptions[0] ?? "Inquire",
    note: "",
  });

  useEffect(() => {
    let ignore = false;
    async function loadFollowState() {
      const response = await fetch(`/api/business/${slug}/follow`);
      if (!response.ok) return;
      const data = await response.json();
      if (ignore) return;
      setIsFollowing(Boolean(data.isFollowing));
      setFollowers(Number(data.followers ?? baseFollowers));
    }

    loadFollowState();
    return () => {
      ignore = true;
    };
  }, [slug, baseFollowers]);

  function toggleFollow() {
    if (viewerRole === "guest") {
      window.location.href = "/login";
      return;
    }

    setLoadingFollow(true);
    setError(null);

    fetch(`/api/business/${slug}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: isFollowing ? "unfollow" : "follow" }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Unable to update follow status");
        }
        return response.json();
      })
      .then((data) => {
        setIsFollowing(Boolean(data.isFollowing));
        setFollowers(Number(data.followers ?? followers));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Unable to update follow status");
      })
      .finally(() => {
        setLoadingFollow(false);
      });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(false);
    setError(null);

    const response = await fetch(`/api/business/${slug}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setError("Unable to send message right now.");
      return;
    }

    setSubmitted(true);
    setForm((prev) => ({ ...prev, note: "" }));
  }

  const businessInquiryGate =
    viewerRole === "business_verified"
      ? {
          kind: "allowed" as const,
          text: "You are verified. You can inquire as a business owner.",
          href: `/business/home?intent=inquire&target=${slug}`,
          cta: "Inquire as Business Owner",
        }
      : {
          kind: "blocked" as const,
          text: "Business-owner inquiries require a verified business account.",
          href: "/signup?accountType=business_pending",
          cta: viewerRole === "guest" ? "Sign up as Business" : "Get Verified",
        };

  return (
    <div className="mt-5 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loadingFollow}
          className={`rounded px-3 py-1.5 text-sm font-semibold ${isFollowing ? "bg-[var(--ni-brand)] text-[var(--ni-surface-1)]" : "border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] text-[var(--ni-text-strong)]"}`}
        >
          {loadingFollow ? "Updating..." : isFollowing ? "Following" : "Follow"}
        </button>

        <button
          type="button"
          onClick={() => {
            setIsMessageOpen((prev) => !prev);
            setSubmitted(false);
          }}
          className="rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800"
        >
          Send Message
        </button>

        <span className="text-sm text-[var(--ni-text)]">{followers.toLocaleString()} followers</span>
      </div>

      <div className="rounded border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
        <p className="font-semibold text-[var(--ni-text-strong)]">{businessInquiryGate.text}</p>
        <Link href={businessInquiryGate.href} className="mt-2 inline-block rounded border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-500">
          {businessInquiryGate.cta}
        </Link>
      </div>

      {isMessageOpen ? (
        <form onSubmit={onSubmit} className="space-y-3 rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-3">
          <p className="text-sm font-semibold text-[var(--ni-text-strong)]">
            Message {businessName}
          </p>
          <p className="text-xs text-[var(--ni-text)]">
            B2C users can message using this quick form. Businesses can customize the action options.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
              className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1.5 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]"
            />
            <input
              required
              min={13}
              max={99}
              type="number"
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
              placeholder="Age"
              className="rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1.5 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]"
            />
          </div>

          <select
            value={form.option}
            onChange={(event) => setForm((prev) => ({ ...prev, option: event.target.value }))}
            className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1.5 text-sm text-[var(--ni-text-strong)]"
          >
            {contactOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>

          <textarea
            rows={3}
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Tell the business what you need"
            className="w-full rounded border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] px-2 py-1.5 text-sm text-[var(--ni-text-strong)] placeholder:text-[var(--ni-muted)]"
          />

          <button type="submit" className="rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800">
            Submit Request
          </button>

          {submitted ? (
            <p className="rounded border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
              Sent. {businessName} received your {form.option.toLowerCase()} request.
            </p>
          ) : null}

          {error ? <p className="text-xs text-rose-700">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}
