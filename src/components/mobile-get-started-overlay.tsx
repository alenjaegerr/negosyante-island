"use client";

import { useEffect, useMemo, useState } from "react";

const INTRO_KEY = "ni-mobile-get-started-seen";

type Role = "aspiring" | "expert" | "default";

type Slide = {
  id: string;
  title: string;
  body: React.ReactNode;
  actions?: React.ReactNode;
  previewMark: string;
  previewLabel: string;
};

export default function MobileGetStartedOverlay() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [role, setRole] = useState<Role>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(INTRO_KEY) === "1";
    setVisible(!seen);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const shells = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-shell]"));
    const prevDisplays = shells.map((s) => ({ s, d: s.style.display }));
    shells.forEach((s) => (s.style.display = "none"));

    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, slides.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
      if (e.key === "Escape") close();
    }

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      prevDisplays.forEach(({ s, d }) => (s.style.display = d));
      window.removeEventListener("keydown", onKey);
    };
  }, [visible]);

  function close() {
    if (typeof window !== "undefined") window.localStorage.setItem(INTRO_KEY, "1");
    setVisible(false);
  }

  const slides = useMemo(
    () => [
      {
        id: "welcome",
        title: "Welcome to Negosyante Island",
        body: (
          <>
            Feed, businesses, and forums come together in one place. Choose a path below so the tour matches how you use the site.
          </>
        ),
        actions: (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRole("aspiring")}
              className={`rounded-full px-4 py-3 text-base sm:px-5 sm:py-3 sm:text-lg min-w-[10rem] text-center font-semibold transition-colors ${role === "aspiring" ? "bg-[color:var(--ni-brand-cta)] text-white" : "bg-white/8 text-white/85"}`}>
              Aspiring Negosyante
            </button>
            <button
              type="button"
              onClick={() => setRole("expert")}
              className={`rounded-full px-4 py-3 text-base sm:px-5 sm:py-3 sm:text-lg min-w-[10rem] text-center font-semibold transition-colors ${role === "expert" ? "bg-[color:var(--ni-brand-cta)] text-white" : "bg-white/8 text-white/85"}`}>
              Business / Marketing Expert
            </button>
          </div>
        ),
        previewMark: "NI",
        previewLabel: "Island guide",
      },
      {
        id: "trending",
        title: "🔥 TRENDING",
        body: (
          <>
            Fast-moving posts and signals showing what the island is reacting to right now.
          </>
        ),
        previewMark: "🔥",
        previewLabel: "Trending feed",
      },
      {
        id: "forums",
        title: "🏝️ ISLAND FORUMS",
        body: (
          <>
            Topic-based discussions where residents and businesses share ideas, questions, and local knowledge.
          </>
        ),
        previewMark: "🏝️",
        previewLabel: "Forum spaces",
      },
      {
        id: "verified",
        title: "✅ VERIFIED BUSINESS & MARKETING EXPERTS",
        body: (
          <>
            Verified businesses and trusted experts help people decide quickly with clear contact and trust signals.
          </>
        ),
        previewMark: "✅",
        previewLabel: "Trusted profiles",
      },
      {
        id: "done",
        title: "All set",
        body: "You’re ready. Tap Continue to enter the island.",
        previewMark: "→",
        previewLabel: "Enter now",
      },
    ],
    [role],
  );

  if (!visible) return null;

  return (
    <div className="ni-slideshow fixed inset-0 z-[120] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.24),_transparent_42%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(2,6,23,0.92))] text-white">
      <div className="mx-auto flex h-dvh w-full max-w-7xl flex-col px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-[max(env(safe-area-inset-top),0.5rem)] sm:px-5 sm:pb-[max(env(safe-area-inset-bottom),1rem)] sm:pt-[max(env(safe-area-inset-top),1rem)] lg:px-10">
        <div className="flex items-center justify-between gap-2 pb-2 sm:gap-3 sm:pb-4">
          <div>
            <p className="font-reddit text-[9px] font-extrabold uppercase tracking-[0.35em] text-cyan-200/80 sm:text-[10px] sm:tracking-[0.45em]">Get Started</p>
            <p className="mt-1 text-[10px] font-semibold text-slate-300 sm:mt-2 sm:text-sm">Step {index + 1} of {slides.length}</p>
          </div>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10 sm:w-40">
            <div className="h-full rounded-full bg-[color:var(--ni-brand-cta)] transition-all duration-300" style={{ width: `${((index + 1) / slides.length) * 100}%` }} />
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-2xl shadow-black/30 backdrop-blur-md sm:rounded-[2rem]">
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {slides.map((s, i) => (
              <section key={s.id} className="min-w-full h-full px-2 py-2 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
                <div className="grid h-full gap-2 sm:gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
                  <div className="flex min-h-0 flex-col justify-between rounded-[1.25rem] border border-white/10 bg-black/15 p-3 sm:rounded-[1.5rem] sm:p-5 lg:p-7">
                    <div>
                      <h3 className="text-[9px] font-reddit uppercase tracking-[0.3em] text-cyan-200/80 sm:text-[11px] sm:tracking-[0.35em]">{i + 1} / {slides.length}</h3>
                      <h2 className="mt-2 max-w-xl text-[1.35rem] font-bold leading-tight text-white sm:text-3xl lg:text-5xl">{s.title}</h2>
                      <div className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-slate-200 sm:mt-3 sm:text-base lg:text-lg">{s.body}</div>
                      {s.actions}
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/10 bg-white/6 p-3 sm:mt-6 sm:p-4">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-cyan-100/70 sm:text-[10px] sm:tracking-[0.3em]">Why this matters</p>
                      <p className="mt-2 text-[0.8rem] leading-relaxed text-slate-100 sm:text-[15px]">
                        {s.id === "welcome" && "A quick orientation so new users know where to start."}
                        {s.id === "trending" && "Shows what people are talking about right now."}
                        {s.id === "forums" && "Shows where conversations and questions happen."}
                        {s.id === "verified" && "Shows where users can find trusted businesses and experts."}
                        {s.id === "done" && "You’re ready to enter the platform."}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-col rounded-[1.25rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,15,33,0.8),rgba(15,23,42,0.6))] p-2.5 sm:rounded-[1.5rem] sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between gap-2 pb-2 sm:gap-3 sm:pb-4">
                      <div className="text-[9px] font-semibold uppercase tracking-[0.3em] text-cyan-100/70 sm:text-xs">Preview</div>
                      <div className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[9px] font-semibold text-slate-200 sm:px-3 sm:text-[11px]">
                        {s.previewLabel}
                      </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col justify-between rounded-[1.15rem] border border-white/10 bg-white/6 p-3 sm:rounded-[1.5rem] sm:p-5">
                      <div className="flex items-center gap-2.5 sm:gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden sm:h-20 sm:w-20">
                          {s.id === "welcome" ? (
                            <img src="/brand/favicon.png" alt="Negosyante favicon" className="h-full w-full object-contain" />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,132,209,0.45),rgba(15,23,42,0.9))] text-lg font-black text-white sm:h-20 sm:w-20 sm:text-4xl">
                              {s.previewMark}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-cyan-100/70 sm:text-[10px] sm:tracking-[0.3em]">{s.id === "welcome" ? "Start here" : "Quick look"}</p>
                          <p className="mt-1 text-[0.85rem] font-semibold text-white sm:text-lg">{s.title}</p>
                        </div>
                      </div>

                      <div className="mt-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3 text-[0.8rem] leading-relaxed text-slate-100 sm:mt-4 sm:p-4 sm:text-sm">
                        {role === "aspiring" && s.id === "welcome" && "Aspiring Negosyante: use the island to learn where to post, discover, and build trust."}
                        {role === "expert" && s.id === "welcome" && "Business / Marketing Expert: use the island to surface leads, visibility, and authority."}
                        {role === "aspiring" && s.id === "trending" && "Use trends to spot demand before you launch."}
                        {role === "expert" && s.id === "trending" && "Use trends to position your expertise with relevance."}
                        {role === "aspiring" && s.id === "forums" && "Forums help you ask better questions and get answers faster."}
                        {role === "expert" && s.id === "forums" && "Forums help you seed conversations and attract attention."}
                        {role === "aspiring" && s.id === "verified" && "Verified profiles can turn a hobby into a real business page."}
                        {role === "expert" && s.id === "verified" && "Verified profiles can turn expertise into inbound business."}
                        {s.id === "done" && "You’re ready to enter the platform."}
                        {s.id !== "done" && role === "default" && "Tap a role above to tailor the tour."}
                      </div>

                      <div className="mt-5 sm:mt-6" />
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 sm:gap-3 sm:pt-5">
          {index < slides.length - 1 ? (
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setIndex((i) => Math.min(slides.length - 1, i + 1))}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-2.5 py-2 pr-3 text-sm text-white shadow-lg shadow-black/20 backdrop-blur-md transition-transform hover:scale-[1.01] sm:gap-3 sm:px-3 sm:pr-4"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--ni-brand-cta)] text-base font-black leading-none text-white sm:h-10 sm:w-10 sm:text-lg">›</span>
              <span className="text-[0.8rem] font-semibold tracking-wide text-white/95 sm:text-sm">Next</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-[color:var(--ni-brand-cta)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-transform hover:scale-[1.01] sm:px-5 sm:py-3"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}