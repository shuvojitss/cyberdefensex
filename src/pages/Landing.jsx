import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

/* ─── Feature-rotator slide data (matches original HTML) ─── */
const SLIDES = [
  {
    key: "docs",
    bullet: "Real‑time briefs",
    accent: "emerald",
    pillText: "Co‑create",
    tailText: "product briefs",
    body: "Draft clear briefs together with multiplayer editing. Structure work with headings, checklists, and callouts.",
    description: "Collaborate on project briefs with your team in real-time. No more version conflicts or missed updates.",
    highlights: [
      { word: "briefs",     color: "emerald" },
      { word: "checklists", color: "violet"  },
    ],
    collaborators: [
      { letter: "N", color: "emerald" },
      { letter: "L", color: "violet"  },
    ],
  },
  {
    key: "comments",
    bullet: "Threaded reviews",
    accent: "amber",
    pillText: "Review in",
    tailText: "context",
    body: "Keep decisions attached to the work with inline threads. Mention teammates, resolve quickly, and move forward.",
    description: "Keep feedback organized with contextual comment threads. Never lose track of important decisions.",
    highlights: [
      { word: "threads", color: "amber" },
      { word: "Mention", color: "sky"   },
    ],
    collaborators: [
      { letter: "I", color: "amber" },
      { letter: "S", color: "sky"   },
    ],
  },
  {
    key: "commands",
    bullet: "Commands to tickets",
    accent: "violet",
    pillText: "Turn notes into",
    tailText: "tickets",
    body: "Use quick commands to convert writing into scoped tickets with owners, labels, and estimates.",
    description: "Transform ideas into actionable tasks with smart command shortcuts. From thought to execution, instantly.",
    highlights: [
      { word: "tickets", color: "violet"  },
      { word: "owners",  color: "emerald" },
    ],
    collaborators: [
      { letter: "J", color: "violet"  },
      { letter: "N", color: "emerald" },
    ],
  },
];

const AC = {
  emerald: {
    pill:      "ring-emerald-500/60 bg-emerald-500/10 text-emerald-200",
    iconBox:   "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    bar:       "bg-emerald-400",
    collab:    "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
    highlight: { bg: "rgba(16,185,129,0.18)", border: "rgba(16,185,129,0.35)" },
  },
  amber: {
    pill:      "ring-amber-500/60 bg-amber-500/10 text-amber-200",
    iconBox:   "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    bar:       "bg-amber-400",
    collab:    "bg-amber-500/20 border-amber-500/40 text-amber-300",
    highlight: { bg: "rgba(245,158,11,0.18)", border: "rgba(245,158,11,0.35)" },
  },
  violet: {
    pill:      "ring-violet-500/60 bg-violet-500/10 text-violet-200",
    iconBox:   "bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20",
    bar:       "bg-violet-400",
    collab:    "bg-violet-500/20 border-violet-500/40 text-violet-300",
    highlight: { bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.35)" },
  },
  sky: {
    pill:      "ring-sky-500/60 bg-sky-500/10 text-sky-200",
    iconBox:   "bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20",
    bar:       "bg-sky-400",
    collab:    "bg-sky-500/20 border-sky-500/40 text-sky-300",
    highlight: { bg: "rgba(14,165,233,0.18)", border: "rgba(14,165,233,0.35)" },
  },
};

/* Renders body copy with coloured highlight spans around keywords */
function HighlightedBody({ slide }) {
  const parts = [];
  let remaining = slide.body;
  slide.highlights.forEach(({ word, color }) => {
    const idx = remaining.toLowerCase().indexOf(word.toLowerCase());
    if (idx === -1) return;
    if (idx > 0) parts.push({ text: remaining.slice(0, idx), hl: null });
    parts.push({ text: remaining.slice(idx, idx + word.length), hl: AC[color].highlight });
    remaining = remaining.slice(idx + word.length);
  });
  if (remaining) parts.push({ text: remaining, hl: null });
  return (
    <p className="text-neutral-400 leading-relaxed text-lg mb-8">
      {parts.map((p, i) =>
        p.hl ? (
          <span key={i} className="rounded-md px-2 py-0.5 ring-1"
            style={{ background: p.hl.bg, boxShadow: `inset 0 0 0 1px ${p.hl.border}` }}>
            {p.text}
          </span>
        ) : <span key={i}>{p.text}</span>
      )}
    </p>
  );
}

/* Pricing check icon */
function Check() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-sky-400 flex-shrink-0">
      <path d="m9 12 2 2 4-4" /><circle cx="12" cy="12" r="10" />
    </svg>
  );
}

/* Slide icon switcher */
function SlideIcon({ slideKey }) {
  if (slideKey === "docs")
    return (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" /></>);
  if (slideKey === "comments")
    return (<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />);
  return (<><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></>);
}

/* ══════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════ */
export default function Landing() {
  const nav        = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [idx,      setIdx]      = useState(0);
  const timerRef   = useRef(null);
  const usRef      = useRef(null); // ref on the UnicornStudio container div

  /* ── UnicornStudio 3-D background ──
     The element MUST be in the DOM before init() is called.
     useEffect fires after React commits the render, so usRef.current
     is guaranteed to point to the real DOM node here.               */
  useEffect(() => {
    if (!usRef.current) return;

    const boot = () => {
      if (!window.UnicornStudio) return;
      // destroy any previous instance so hot-reload works cleanly
      if (window.UnicornStudio.isInitialized) {
        try { window.UnicornStudio.destroy(); } catch (_) {}
        window.UnicornStudio.isInitialized = false;
      }
      window.UnicornStudio.init();
      window.UnicornStudio.isInitialized = true;
    };

    if (window.UnicornStudio) {
      boot();
    } else {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js";
      s.onload = boot;
      (document.head || document.body).appendChild(s);
    }
  }, []);

  /* ── Feature rotator — 5 s auto-advance ── */
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
  };
  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const goTo = (i) => { setIdx(i); startTimer(); };

  const slide = SLIDES[idx];
  const ac    = AC[slide.accent];

  return (
    <div
      className="min-h-screen bg-black text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-white"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" }}
    >
      {/* UnicornStudio 3-D canvas — ref ensures init() fires after mount */}
      <div ref={usRef}
  data-us-project="krvLrHX3sj3cg8BHywDj"
  className="absolute inset-0 z-0 w-full h-full"
/>
      {/* Backdrop glows */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-indigo-600/40 via-sky-500/30 to-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-tr from-fuchsia-600/30 via-purple-600/20 to-sky-500/20 blur-3xl" />
      </div>
      {/* ══════════ NAV ══════════ */}
      <header className="relative z-10">
        <nav className="flex max-w-7xl md:px-6 mr-auto ml-auto pt-4 pr-4 pb-4 pl-4 items-center justify-between">
          <a href="#" className="flex items-center gap-3">
            <svg viewBox="0 0 48 48" aria-hidden="true" strokeWidth="2" style={{ width: 36, height: 36 }}>
              <path d="M24 10 L26 22 L38 24 L26 26 L24 38 L22 26 L10 24 L22 22 Z" fill="currentColor" />
            </svg>
            <span className="text-lg font-medium tracking-tight">CyberDefenseX</span>
          </a>

          <button onClick={() => setMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 md:hidden">
            {menuOpen
              ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white"><path d="M4 12h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>}
            <span className="sr-only">Menu</span>
          </button>

          <div className="hidden items-center gap-8 md:flex">
            {["Platform","Templates","Docs","Community","Pricing"].map((l) => (
              <a key={l} href="#" className="text-sm font-medium text-[#fbfbfb] hover:text-white">{l}</a>
            ))}
            <div className="h-6 w-px bg-white/10" />
            <a href="#" className="text-sm font-medium text-slate-300 hover:text-white">Log in</a>
            <button onClick={() => nav("/login")}
              className="group relative inline-flex cursor-pointer transition-all duration-[1000ms] ease-[cubic-bezier(0.15,0.83,0.66,1)] hover:-translate-y-[3px] hover:scale-[1.1] hover:text-white text-white/70 tracking-tight rounded-full pt-[8px] pr-[16px] pb-[8px] pl-[16px] items-center justify-center"
              style={{ boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.1)", background:"radial-gradient(ellipse at bottom,rgba(71,81,92,1) 0%,rgba(0,0,0,1) 100%)" }}>
              <span className="relative z-10 text-sm font-normal">Sign Up</span>
              <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-[1px] w-[70%] -translate-x-1/2 opacity-20 transition-all duration-[1000ms] group-hover:opacity-80"
                style={{ background:"linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)" }} />
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="mx-auto max-w-7xl px-4 md:hidden">
            <div className="space-y-1 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur">
              {["Platform","Templates","Docs","Community","Pricing"].map((l) => (
                <a key={l} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/5" href="#">{l}</a>
              ))}
              <div className="my-2 h-px w-full bg-white/10" />
              <div className="flex items-center gap-2">
                <a href="#" className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-center text-sm font-medium text-slate-200">Log in</a>
                <a href="#" onClick={(e)=>{e.preventDefault();nav("/login");}} className="flex-1 rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-black">Sign up</a>
              </div>
            </div>
          </div>
        )}
      </header>
      {/* ══════════ HERO ══════════ */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:px-6 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">New: platformAutonomous. Transparent. Unbreakable</p>
            <h1 className="sm:text-5xl md:text-7xl text-4xl font-semibold tracking-tight">Secure systems at lightspeed</h1>
            <p className="mt-5 text-base md:text-lg text-slate-300">The world’s first fully autonomous AI + Blockchain + Self-Healing  Cyber Defense System with analyst-grade explainability and federated global intelligence.</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" className="button">
                <div className="points_wrapper">{Array.from({length:10}).map((_,i)=><i key={i} className="point"/>)}</div>
                <span className="inner">Get Started
                                    <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
              </button>
              <button onClick={()=>setDemoOpen(true)}
                className="group relative inline-flex items-center justify-center min-w-[120px] cursor-pointer rounded-xl px-[17px] py-[12px] text-white/70 tracking-tight font-semibold transition-all duration-[1000ms] ease-[cubic-bezier(0.15,0.83,0.66,1)] hover:-translate-y-[3px] hover:scale-[1.1] hover:text-white"
                style={{ boxShadow:"inset 0 0 0 1px rgba(255,255,255,0.1)", background:"radial-gradient(ellipse at bottom,rgba(71,81,92,1) 0%,rgba(0,0,0,1) 100%)" }}>
                <span className="relative z-10 font-normal">Watch demo</span>
                <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-[1px] w-[70%] -translate-x-1/2 opacity-20 transition-all duration-[1000ms] group-hover:opacity-80"
                  style={{ background:"linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 50%,rgba(255,255,255,0) 100%)" }}/>
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-400">
              <div className="flex -space-x-2">
                {["9c519027-8b76-493a-ae3c-8cf962ccdf04_320w","8d3cb9d4-adbe-41e5-a351-a4a6c22d6037_800w","69c45eba-968b-45e3-aff1-ebab9cb7b543_320w"].map((id)=>(
                  <img key={id} className="h-6 w-6 rounded-full ring-2 ring-black/60 object-cover"
                    src={`https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/${id}.jpg`} alt=""/>
                ))}
              </div>
              <span>Trusted by modern teams of all sizes</span>
            </div>
          </div>
        </div>

        {/* Editor preview */}
        <div className="-mb-8 max-w-7xl md:px-6 mr-auto ml-auto pr-4 pl-4">
          <div className="relative w-full overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.02] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 backdrop-blur-xl">
            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/80"/>
                <span className="h-3 w-3 rounded-full bg-yellow-400/80"/>
                <span className="h-3 w-3 rounded-full bg-green-500/80"/>
                <div className="ml-3 hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300 sm:flex"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="18" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>CyberHub — Presents: CyberDefenseX</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="hidden rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-200 hover:bg-white/10 sm:inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
                </button>
                <button className="hidden rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-200 hover:bg-white/10 sm:inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>
                </button>
                <button className="rounded-md bg-sky-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500">Publish</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left panel */}
              <aside className="hidden md:block md:col-span-3 bg-black/30 border-r border-white/10 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>v.1.1.0</div>
                  <button className="rounded-md border border-white/10 bg-white/5 p-1 text-slate-300 hover:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
                  </button>
                </div>
                <div className="space-y-1 text-slate-300">
                  <div className="bg-white/5 rounded-lg p-2 space-y-3">
                    <div className="mb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-400"><path d="M18 5a2 2 0 0 1 2 2v8.526a2 2 0 0 0 .212.897l1.068 2.127a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45l1.068-2.127A2 2 0 0 0 4 15.526V7a2 2 0 0 1 2-2z"/><path d="M20.054 15.987H3.946"/></svg>
                        <span className="text-xs font-medium">Dashboard</span>
                      </div>
                      <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400">Primary</span>
                    </div>
                    <ul className="space-y-1 pl-6 text-xs">
                      {[{l:"Header",d:"sky",a:true},{l:"Hero",d:"purple"},{l:"Features",d:"emerald"},{l:"Pricing",d:"amber"},{l:"Testimonials",d:"pink"}].map(({l,d,a})=>(
                        <li key={l} className={`flex items-center gap-2 rounded-md px-2 py-1 ${a?"bg-sky-500/10":"hover:bg-white/5"}`}><span className={`h-2 w-2 rounded-full bg-${d}-400`}/>{l}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 space-y-3">
                    <div className="mb-1 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-indigo-400"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/></svg>
                      <span className="text-xs font-medium">ThreatMap</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["0950426a-fd01-4dc5-a916-33b7c3a94646_320w","859fc099-059b-4ec4-b0f1-06e736a8bdf4_320w","f17ac654-630a-4fb6-ae2e-e2c4a8fe9274_320w"].map((id)=>(
                        <div key={id} className="aspect-video overflow-hidden rounded-md bg-white/5">
                          <img src={`https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/${id}.jpg`} className="h-full w-full object-cover opacity-90" alt=""/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              {/* Canvas */}
              <main className="relative md:col-span-6 bg-black/20">
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-400"><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8"/><path d="M10 19v-3.96 3.15"/><path d="M7 19h5"/><rect width="6" height="10" x="16" y="12" rx="2"/></svg>
                  <span>Breakpoint</span><span className="rounded-md bg-white/5 px-1.5 py-0.5">Desktop</span>
                  <span className="text-slate-500">|</span><span>1200</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button className="rounded-md border border-white/10 bg-white/5 p-1 hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg></button>
                    <button className="rounded-md border border-white/10 bg-white/5 p-1 hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg></button>
                  </div>
                </div>
                <div className="sm:p-6 pt-4 pr-4 pb-4 pl-4">
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 ring-1 ring-white/10">
                    <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/9fb3eba2-d3b1-4a3c-9feb-29a0b47b70c6_1600w.jpg" className="h-[360px] w-full object-cover sm:h-[460px]" alt=""/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"/>
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="max-w-xl rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur">
                        <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight">Orion Canvas</h3>
                        <p className="mt-1 text-sm text-slate-300">A limitless canvas with modern layout, motion, and type features—ready for production.</p>
                        <div className="mt-3 flex items-center gap-2">
                          <button className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/90">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>
                            Auto layout
                          </button>
                          <button className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2v20"/><path d="m15 19-3 3-3-3"/><path d="m19 9 3 3-3 3"/><path d="M2 12h20"/><path d="m5 9-3 3 3 3"/><path d="m9 5 3-3 3 3"/></svg>
                            Drag
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -bottom-6 right-4 hidden w-64 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur lg:block">
                    <div className="rounded-lg border border-white/10 bg-black/50 p-2">
                      <div className="aspect-[9/16] overflow-hidden rounded-md">
                        <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/e080ec8d-304b-41cc-a8e7-c2b6efc8ab07_800w.jpg" className="h-full w-full object-cover" alt=""/>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                          Mobile 390
                        </span>
                        <span className="rounded bg-white/5 px-1 py-0.5">Preview</span>
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              {/* Right panel */}
              <aside className="hidden md:block md:col-span-3 border-l border-white/10 bg-black/30 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/></svg>
                    Properties
                  </div>
                  <button className="rounded-md border border-white/10 bg-white/5 p-1 text-slate-300 hover:bg-white/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3 space-y-3">
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-300">Position</span><span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">Relative</span></div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">{["Top","Center","Bottom"].map((l)=><button key={l} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-slate-300 hover:bg-white/10">{l}</button>)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 space-y-3">
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-300 font-medium">Size</span><span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">Auto</span></div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-slate-300 font-medium text-center">W: 1200</div>
                      <div className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-slate-300 font-medium text-center">H: Auto</div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-2 text-[11px]">{["Fill","Fit","Fixed","Min"].map((l)=><button key={l} className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-slate-300 font-medium hover:bg-white/10 transition">{l}</button>)}</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 space-y-3">
                    <div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-300">Effects</span><span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">3</span></div>
                    <div className="space-y-2 text-[11px]">
                      {[["Blur","8px"],["Glow","20%"],["Blend","Overlay"]].map(([k,v])=>(
                        <div key={k} className="flex items-center justify-between"><span className="text-slate-300">{k}</span><span className="rounded bg-white/5 px-1.5 py-0.5 text-slate-400">{v}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
      {/* ══════════ FEATURES ══════════ */}
      <div className="relative overflow-hidden antialiased z-10 text-neutral-200 bg-black"
        onMouseEnter={()=>clearInterval(timerRef.current)} onMouseLeave={startTimer}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_70%_30%,rgba(120,119,198,0.15),transparent_60%)]"/>
        <section className="max-w-7xl mx-auto px-6 md:px-8 py-24 md:py-32">
          <div className="text-center mb-16 md:mb-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-emerald-400"><rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>Powerful  features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-4">Everything you need to secure faster</h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">From detection to response, CyberDefenseX automates your entire SOC—reducing human effort while increasing accuracy, speed, and trust.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Bullet list */}
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white mb-8">Build workflows that work for your team</h3>
              <div className="space-y-6">
                {SLIDES.map((s, i) => {
                  const active = i === idx;
                  return (
                    <button key={s.key} type="button" onClick={()=>goTo(i)}
                      className="group w-full flex items-start gap-4 text-left p-4 rounded-xl transition-all hover:bg-white/[0.02] border border-transparent hover:border-white/10">
                      <div className="flex-shrink-0">
                        <span className={`h-8 w-1 rounded-full ${active ? AC[s.accent].bar : "bg-neutral-700 group-hover:bg-neutral-600"} transition-colors block`}/>
                      </div>
                      <div>
                        <span className={`text-base sm:text-lg font-semibold block mb-2 ${active?"text-white":"text-neutral-500 group-hover:text-neutral-300"}`}>{s.bullet}</span>
                        <span className={`text-sm leading-relaxed ${active?"text-neutral-400":"text-neutral-500 group-hover:text-neutral-400"}`}>{s.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Animated card */}
            <div className="relative order-1 lg:order-2">
              <div className="relative rounded-2xl border border-neutral-800/80 bg-neutral-900/50 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-white/5 backdrop-blur-md overflow-hidden">
                {/* Breadcrumb header */}
                <div className="h-14 flex items-center gap-3 px-6 border-b border-neutral-800/70 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="truncate font-medium">Nebula workspace</span>
                    <span className="opacity-50">›</span>
                    <span className="truncate text-neutral-300 font-medium">Product strategy</span>
                  </div>
                  <div className="ml-auto flex items-center gap-2 opacity-60">
                    <div className="flex -space-x-1">
                      {slide.collaborators.map(({letter,color})=>(
                        <div key={letter+color} className={`w-6 h-6 rounded-full border flex items-center justify-center ${AC[color].collab}`}>
                          <span className="text-[10px] font-medium">{letter}</span>
                        </div>
                      ))}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </div>
                </div>

                {/* Card body */}
                <div className="relative px-8 py-10">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 text-neutral-700">
                    {[0,1,2].map((i)=><span key={i} className="w-1.5 h-1.5 rounded-full bg-current"/>)}
                  </div>
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${ac.iconBox}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <SlideIcon slideKey={slide.key}/>
                    </svg>
                  </div>
                  {/* Heading with animated pill */}
                  <div className="relative mb-6">
                    <h4 className="text-3xl font-semibold tracking-tight text-white flex flex-wrap items-center gap-3 mb-3">
                      <span className={`inline-flex items-center rounded-lg px-3 py-2 ring-1 text-lg ${ac.pill}`}>{slide.pillText}</span>
                      <span>{slide.tailText}</span>
                    </h4>
                  </div>
                  {/* Body with coloured keyword highlights */}
                  <HighlightedBody slide={slide}/>
                  {/* Skeleton lines */}
                  <div className="space-y-3 mb-6">
                    <div className="h-2 rounded-full bg-neutral-800/70 w-4/5"/>
                    <div className="h-2 rounded-full bg-neutral-800/70 w-full"/>
                    <div className="h-2 rounded-full bg-neutral-800/70 w-3/5"/>
                  </div>
                  <div className="space-y-3 opacity-60">
                    <div className="h-2 rounded-full bg-neutral-800/70 w-5/6"/>
                    <div className="h-2 rounded-full bg-neutral-800/70 w-3/4"/>
                    <div className="h-2 rounded-full bg-neutral-800/70 w-4/5"/>
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-950/90 to-transparent"/>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      {/* ══════════ PRICING ══════════ */}
      <div className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="border border-white/10 rounded-3xl p-12 lg:p-16"
            style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(40px)", WebkitBackdropFilter:"blur(40px)" }}>
            <div className="text-center mb-16">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-sky-400">
                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                </svg>
                Flexible pricing plans
              </p>
              <h3 className="text-3xl lg:text-4xl text-white tracking-tight mb-6 font-semibold">Choose your perfect plan</h3>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto">From solo creators to enterprise teams, Nebula scales with your needs. Start free and upgrade as you grow.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Starter */}
              <div className="relative rounded-2xl border border-white/10 p-8" style={{background:"rgba(255,255,255,0.02)"}}>
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-2">Starter</h4>
                  <p className="text-sm text-slate-400 mb-6">Perfect for individuals, research, students, and small teams.</p>
                  <div className="flex items-baseline gap-2"><span className="text-4xl text-white font-semibold">Free</span><span className="text-sm text-slate-400">forever</span></div>
                </div>
                <ul className="space-y-4 mb-8">{["3 active projects","Core design tools","Basic templates","Community support","Nebula subdomain"].map((f)=><li key={f} className="flex items-center gap-3"><Check/><span className="text-sm text-slate-300">{f}</span></li>)}</ul>
                <button onClick={() => nav("/login")} className="w-full py-4 px-6 rounded-xl text-sm font-medium text-white border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/5" style={{background:"rgba(255,255,255,0.03)"}}>Get Started Free</button>
              </div>

              {/* Pro */}
              <div className="relative rounded-2xl border border-sky-500/30 p-8" style={{background:"rgba(14,165,233,0.05)"}}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 text-xs font-medium text-white rounded-full border border-sky-500/30" style={{background:"rgba(14,165,233,0.15)"}}>Most Popular</span>
                </div>
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-2">Pro</h4>
                  <p className="text-sm text-slate-400 mb-6">Advanced features for professional security analyst and growing teams.</p>
                  <div className="flex items-baseline gap-2"><span className="text-4xl text-white font-semibold">$12</span><span className="text-sm text-slate-400">per month</span></div>
                </div>
                <ul className="space-y-4 mb-8">{["Unlimited projects","Advanced animations","Custom domains","Real-time collaboration","Priority support"].map((f)=><li key={f} className="flex items-center gap-3"><Check/><span className="text-sm text-slate-300">{f}</span></li>)}</ul>
                <button className="w-full py-4 px-6 rounded-xl text-sm font-medium text-white border border-sky-500/30 hover:border-sky-500/50 transition-all duration-300" style={{background:"rgba(14,165,233,0.15)"}}>Start Pro Trial</button>
              </div>

              {/* Enterprise */}
              <div className="relative rounded-2xl border border-white/10 p-8" style={{background:"rgba(255,255,255,0.02)"}}>
                <div className="mb-8">
                  <h4 className="text-xl font-semibold text-white mb-2">Enterprise</h4>
                  <p className="text-sm text-slate-400 mb-6">Powerful tools and dedicated support for large teams and organizations.</p>
                  <div className="flex items-baseline gap-2"><span className="text-4xl text-white font-semibold">Custom</span><span className="text-sm text-slate-400">pricing</span></div>
                </div>
                <ul className="space-y-4 mb-8">{["Unlimited everything","Advanced security & SSO","White-label options","Dedicated account manager","Custom integrations"].map((f)=><li key={f} className="flex items-center gap-3"><Check/><span className="text-sm text-slate-300">{f}</span></li>)}</ul>
                <button className="w-full py-4 px-6 rounded-xl text-sm font-medium text-white border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/5" style={{background:"rgba(255,255,255,0.03)"}}>Contact Sales</button>
              </div>
            </div>

            <div className="text-center mt-16 pt-12 border-t border-white/10">
              <p className="text-sm text-slate-400 mb-6">All plans include SSL certificates, global CDN, and 99.9% uptime guarantee. No setup fees or hidden costs.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-slate-200 border border-white/20 hover:border-white/30 transition-all duration-300 hover:bg-white/5" style={{background:"rgba(255,255,255,0.03)"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
                  Schedule Demo
                </button>
                <button className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 transition-all duration-300 hover:bg-white/5" style={{background:"rgba(255,255,255,0.02)"}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
                  View Full Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ══════════ FOOTER ══════════ */}
      <footer className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Design together. Publish instantly.</h2>
              <p className="mt-2 text-sm text-slate-400">Skip handoff. Nebula connects your ideas to production with one click deploys.</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <a href="#" onClick={(e) => { e.preventDefault(); nav("/login"); }} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-medium text-black hover:bg-white/90">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  Get started
                </a>
                <a href="#" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
                  Read docs
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
            <span>© {new Date().getFullYear()} Nebula Labs</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-300">Terms</a>
              <a href="#" className="hover:text-slate-300">Privacy</a>
              <a href="#" className="hover:text-slate-300">Status</a>
            </div>
          </div>
        </div>
      </footer>
      {/* ══════════ DEMO MODAL ══════════ */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={()=>setDemoOpen(false)}>
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl" onClick={(e)=>e.stopPropagation()}>
            <button onClick={()=>setDemoOpen(false)} className="absolute right-4 top-4 rounded-md border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <h3 className="text-lg font-semibold text-white mb-4">Watch the demo</h3>
            <div className="aspect-video w-full rounded-xl bg-black/50 flex items-center justify-center text-slate-400 text-sm border border-white/10">
              Demo video coming soon
            </div>
          </div>
        </div>
      )}
    </div>
  );
}