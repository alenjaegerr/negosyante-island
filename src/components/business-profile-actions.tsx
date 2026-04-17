"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  const followStorageKey = `ni-follow-${slug}`;
  const [isFollowing, setIsFollowing] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(followStorageKey) === "1";
  });
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<MessageFormState>({
    name: "",
    age: "",
    option: contactOptions[0] ?? "Inquire",
    note: "",
  });

  function toggleFollow() {
    const next = !isFollowing;
    setIsFollowing(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(followStorageKey, next ? "1" : "0");
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  const displayedFollowers = useMemo(() => baseFollowers + (isFollowing ? 1 : 0), [baseFollowers, isFollowing]);

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
          className={`rounded px-3 py-1.5 text-sm font-semibold ${isFollowing ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-800"}`}
        >
          {isFollowing ? "Following" : "Follow"}
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

        <span className="text-sm text-slate-600">{displayedFollowers.toLocaleString()} followers</span>
      </div>

      <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
        <p className="font-semibold text-amber-900">{businessInquiryGate.text}</p>
        <Link href={businessInquiryGate.href} className="mt-2 inline-block rounded border border-amber-500 px-2 py-1 text-xs font-semibold text-amber-900">
          {businessInquiryGate.cta}
        </Link>
      </div>

      {isMessageOpen ? (
        <form onSubmit={onSubmit} className="space-y-3 rounded border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-800">
            Message {businessName}
          </p>
          <p className="text-xs text-slate-600">
            B2C users can message using this quick form. Businesses can customize the action options.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
            <input
              required
              min={13}
              max={99}
              type="number"
              value={form.age}
              onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
              placeholder="Age"
              className="rounded border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>

          <select
            value={form.option}
            onChange={(event) => setForm((prev) => ({ ...prev, option: event.target.value }))}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
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
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />

          <button type="submit" className="rounded bg-cyan-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-800">
            Submit Request
          </button>

          {submitted ? (
            <p className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
              Sent. {businessName} received your {form.option.toLowerCase()} request.
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
