"use client";

import { useEffect, useState } from "react";
import { STORE_URL, GITHUB_URL } from "@/lib/site";

// Telemetry rail (the signature) — pulsing REC dot + a skip counter that ticks up with
// scroll progress, echoing the extension popup's header.
export function TelemetryRail() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const target = 1247;
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight || 1;
      const pct = Math.min(1, window.scrollY / max);
      setCount(Math.round(pct * target));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex h-[38px] items-center gap-[18px] border-b border-line bg-void/80 px-5 font-mono text-[11px] uppercase tracking-[0.22em] text-inkDim backdrop-blur-md">
      <span className="flex items-center gap-2 font-bold text-inkMid">
        <span className="h-2 w-2 animate-pulse2 rounded-full bg-red shadow-[0_0_10px_var(--red-glow)]" />
        Now Watching
      </span>
      <span className="flex-1" />
      <span className="hidden gap-[18px] sm:flex">
        <span>
          Skipped <b className="font-bold text-redSoft tabular-nums">{count.toLocaleString()}</b>
        </span>
        <span>
          Speed <b className="font-bold text-redSoft">1.0×</b>
        </span>
        <span>v1.2.0</span>
      </span>
    </div>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-[38px] z-[99] border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-void/80 backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-content items-center px-7">
        <a href="#top" className="font-display text-2xl uppercase tracking-[0.04em]">
          Companion<span className="text-red">.</span>
        </a>
        <div className="ml-auto hidden gap-7 text-sm font-semibold text-inkMid md:flex">
          <a href="#skip" className="transition-colors hover:text-ink">Auto-skip</a>
          <a href="#controls" className="transition-colors hover:text-ink">Controls</a>
          <a href="#shortcuts" className="transition-colors hover:text-ink">Shortcuts</a>
          <a href="#privacy" className="transition-colors hover:text-ink">Privacy</a>
        </div>
        <a
          href={STORE_URL}
          className="ml-7 max-md:ml-auto inline-flex items-center gap-2 rounded font-mono text-[13px] font-bold uppercase tracking-[0.08em] bg-red px-5 py-[11px] text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-redglow"
        >
          Add to Chrome
        </a>
      </div>
    </nav>
  );
}

// Used by the footer/CTA to wire GitHub link without prop drilling.
export function GitHubLink({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <a href={GITHUB_URL} className={className}>
      {children}
    </a>
  );
}
