"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { STORE_URL, GITHUB_URL } from "@/lib/site";

const ChromeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 014 4h6A12 12 0 0012 0v6zm-7.46 1.5l3 5.2A4 4 0 0012 16l-3 5.2A12 12 0 014.54 9.5zM12 16a4 4 0 01-3.46-2L3 8.8A12 12 0 0022.9 13H12a4 4 0 010 3z" />
  </svg>
);

export function Hero() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const rotate = useTransform(scrollY, [0, 700], [4, -2]);
  const lift = useTransform(scrollY, [0, 700], [0, 38]);

  const fade = {
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <header id="top" className="relative overflow-hidden pb-24 pt-[188px]">
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[1100px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.18),transparent_60%)] blur-[20px]" />
      <div className="mx-auto max-w-content px-7">
        <motion.p
          {...fade}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-[26px] inline-flex items-center gap-3 font-mono text-[13px] font-bold uppercase tracking-[0.34em] text-redSoft before:h-px before:w-[34px] before:bg-red before:content-['']"
        >
          Chrome Extension · Free
        </motion.p>

        <motion.h1
          {...fade}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="max-w-[14ch] font-display text-[clamp(54px,9vw,132px)] uppercase leading-[0.9] tracking-[0.005em]"
        >
          Your Netflix,
          <br />
          <span className="text-red [text-shadow:0_0_50px_var(--red-glow)]">supercharged.</span>
        </motion.h1>

        <motion.p
          {...fade}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
          className="my-8 max-w-[56ch] text-[clamp(16px,2vw,21px)] text-inkMid"
        >
          The player controls Netflix left out. Auto-skip intros and recaps, jump 5 or 90
          seconds, pop out picture-in-picture, change speed, boost volume past 100% — without
          lifting your hand off the keyboard.
        </motion.p>

        <motion.div
          {...fade}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.24 }}
          className="flex flex-wrap items-center gap-[14px]"
        >
          <a
            href={STORE_URL}
            className="inline-flex items-center gap-[9px] rounded bg-red px-5 py-[11px] font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-redglow"
          >
            <ChromeIcon /> Add to Chrome
          </a>
          <a
            href={GITHUB_URL}
            className="inline-flex items-center gap-[9px] rounded border border-line px-5 py-[11px] font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-ink transition-transform duration-200 hover:-translate-y-0.5 hover:border-inkMid"
          >
            View source
          </a>
          <span className="font-mono text-[12px] tracking-[0.1em] text-inkDim">
            Free · No account · No tracking
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={reduce ? undefined : { rotateX: rotate, y: lift, transformPerspective: 1600 }}
          className="relative mt-16 overflow-hidden rounded-[14px] border border-line bg-black shadow-screen"
        >
          <div className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_120px_rgba(0,0,0,0.5)]" />
          <div className="absolute inset-x-0 top-0 z-[3] flex h-[34px] items-center gap-[7px] bg-gradient-to-b from-black/60 to-transparent px-[14px]">
            <i className="block h-[11px] w-[11px] rounded-full bg-[#2a2a2e]" />
            <i className="block h-[11px] w-[11px] rounded-full bg-[#2a2a2e]" />
            <i className="block h-[11px] w-[11px] rounded-full bg-[#2a2a2e]" />
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src="/assets/launch.mp4" autoPlay muted loop playsInline className="block w-full" />
        </motion.div>

        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-[14px] font-mono text-[12px] uppercase tracking-[0.14em] text-inkDim">
          {["Runs only on Netflix", "No ads or tracking", "Settings sync across devices", "100% local"].map(
            (t) => (
              <span key={t} className="flex items-center gap-[9px] before:h-[6px] before:w-[6px] before:rounded-full before:bg-red before:content-['']">
                {t}
              </span>
            )
          )}
        </div>
      </div>
    </header>
  );
}
