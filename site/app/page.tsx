import Image from "next/image";
import { TelemetryRail, Nav, GitHubLink } from "@/components/Chrome";
import { Hero } from "@/components/Hero";
import { DeckBar } from "@/components/DeckBar";
import { Reveal } from "@/components/Reveal";
import { SKIP_FEATURES, SHORTCUTS, SHOWCASE, STORE_URL } from "@/lib/site";

const SecLabel = ({ children, center = false }: { children: React.ReactNode; center?: boolean }) => (
  <Reveal
    className={`flex items-center gap-[14px] font-mono text-[12px] uppercase tracking-[0.3em] text-inkDim before:h-px before:w-[28px] before:bg-red before:content-[''] ${
      center ? "justify-center" : ""
    }`}
  >
    {children}
  </Reveal>
);

export default function Page() {
  return (
    <main>
      <TelemetryRail />
      <Nav />
      <Hero />

      {/* 01 — auto-skip */}
      <section id="skip" className="relative py-24">
        <div className="mx-auto max-w-content px-7">
          <SecLabel>01 · The interruptions, gone</SecLabel>
          <Reveal delay={0.08}>
            <h2 className="mt-[22px] max-w-[18ch] font-display text-[clamp(36px,5vw,68px)] uppercase leading-[0.94] tracking-[0.01em]">
              Stop clicking. <span className="text-red">Start watching.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-[56ch] text-[clamp(15px,1.6vw,18px)] text-inkMid">
              Companion presses the buttons you&apos;d press anyway — the moment they appear.
              Every one has its own switch in the popup.
            </p>
          </Reveal>

          <div className="mt-[52px] grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
            {SKIP_FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-[14px] border border-line bg-[linear-gradient(160deg,#0e0e11_0%,#070708_130%)] p-7 transition-transform duration-300 hover:-translate-y-1 hover:border-[#34343a]">
                  <span className="absolute left-0 top-0 h-full w-[3px] origin-top scale-y-0 bg-red transition-transform duration-300 group-hover:scale-y-100" />
                  <span className="mb-5 grid h-[46px] w-[46px] place-items-center rounded-[10px] border border-line bg-panel2 text-redSoft">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                      <path d={f.icon} />
                    </svg>
                  </span>
                  <h3 className="mb-[10px] font-display text-[26px] uppercase tracking-[0.03em]">{f.title}</h3>
                  <p className="text-[15px] text-inkMid">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* deck-bar divider */}
      <div className="mx-auto max-w-content px-7">
        <Reveal>
          <DeckBar />
        </Reveal>
      </div>

      {/* 02 — player controls */}
      <section id="controls" className="relative py-24">
        <div className="mx-auto max-w-content px-7">
          <SecLabel>02 · Controls Netflix didn&apos;t ship</SecLabel>

          {SHOWCASE.map((s) => (
            <Reveal key={s.alt}>
              <div className="mt-14 grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={s.flip ? "lg:order-2" : ""}>
                  <h3 className="font-display text-[clamp(30px,4vw,46px)] uppercase leading-[0.96] tracking-[0.01em]">
                    {s.title[0]}
                    <span className="text-red">{s.title[1]}</span>
                    {s.title[2]}
                  </h3>
                  <p className="mt-4 max-w-[46ch] text-[16px] text-inkMid">{s.body}</p>
                  <ul className="mt-[22px] flex flex-col gap-[11px]">
                    {s.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-center gap-3 font-mono text-[13px] uppercase tracking-[0.04em] text-ink before:font-display before:text-red before:content-['→']"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="overflow-hidden rounded-[12px] border border-line shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                  <Image src={s.img} alt={s.alt} width={1280} height={800} className="block h-auto w-full" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 03 — keyboard shortcuts */}
      <section id="shortcuts" className="relative py-24">
        <div className="mx-auto max-w-content px-7">
          <SecLabel>03 · Hands on the keyboard</SecLabel>
          <Reveal delay={0.08}>
            <h2 className="mt-[22px] max-w-[18ch] font-display text-[clamp(36px,5vw,68px)] uppercase leading-[0.94] tracking-[0.01em]">
              Every control, <span className="text-red">a keystroke away.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-5 max-w-[56ch] text-[clamp(15px,1.6vw,18px)] text-inkMid">
              Active on any watch page, ignored while you type in search.
            </p>
          </Reveal>

          <div className="mt-[50px] grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SHORTCUTS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div className="flex items-center gap-4 rounded-[10px] border border-line bg-panel px-5 py-4">
                  <span className="flex gap-[7px]">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="min-w-[42px] rounded-[7px] border border-b-[3px] border-[#34343a] bg-[linear-gradient(to_bottom,#1d1d21,#121214)] px-3 py-2 text-center font-mono text-[15px] font-bold text-white"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                  <span className="font-mono text-[13px] uppercase tracking-[0.08em] text-inkMid">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — privacy */}
      <section
        id="privacy"
        className="relative border-y border-line bg-[linear-gradient(160deg,#0e0e11_0%,#070708_140%)] py-24"
      >
        <div className="mx-auto max-w-content px-7">
          <SecLabel>04 · Private by design</SecLabel>
          <Reveal delay={0.08}>
            <h2 className="mt-[22px] max-w-[18ch] font-display text-[clamp(36px,5vw,68px)] uppercase leading-[0.94] tracking-[0.01em]">
              Nothing leaves <span className="text-red">your browser.</span>
            </h2>
          </Reveal>
          <div className="mt-11 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { h: "No data collected", p: "No personal information, no browsing history, no analytics. The extension never phones home." },
              { h: "No servers, no accounts", p: "Everything runs as a lightweight content script inside your tab. No sign-in, no API calls." },
              { h: "Only your settings", p: "The single thing stored is your toggles, speed and volume preferences, and a local skip counter — synced via Chrome." },
            ].map((c, i) => (
              <Reveal key={c.h} delay={i * 0.08}>
                <div>
                  <h4 className="mb-[10px] font-mono text-[13px] uppercase tracking-[0.14em] text-redSoft">{c.h}</h4>
                  <p className="text-[14px] text-inkMid">{c.p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* final CTA */}
      <section id="get" className="relative py-[120px] text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[1100px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.18),transparent_60%)] blur-[20px]" />
        <div className="relative mx-auto max-w-content px-7">
          <SecLabel center>Ready when you are</SecLabel>
          <Reveal delay={0.08}>
            <h2 className="mx-auto mt-[22px] max-w-[16ch] font-display text-[clamp(36px,5vw,68px)] uppercase leading-[0.94] tracking-[0.01em]">
              Put Netflix on <span className="text-red">autopilot.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-5 max-w-[56ch] text-[clamp(15px,1.6vw,18px)] text-inkMid">
              Add Companion to Chrome, open any title, and the controls appear right in the player.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-[38px] flex flex-wrap justify-center gap-[14px]">
              <a
                href={STORE_URL}
                className="inline-flex items-center gap-[9px] rounded bg-red px-5 py-[11px] font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-redglow"
              >
                Add to Chrome — Free
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line py-[40px] pb-[60px]">
        <div className="mx-auto flex max-w-content flex-wrap items-center gap-[18px] px-7">
          <span className="font-display text-xl uppercase">
            Companion<span className="text-red">.</span>
          </span>
          <span className="flex-1" />
          <div className="flex gap-[22px] font-mono text-[12px] uppercase tracking-[0.1em] text-inkMid">
            <a href="#top" className="hover:text-ink">Top</a>
            <a href="#get" className="hover:text-ink">Install</a>
            <GitHubLink className="hover:text-ink">GitHub</GitHubLink>
          </div>
        </div>
        <div className="mx-auto mt-[22px] max-w-content px-7">
          <p className="max-w-[52ch] text-[12px] leading-[1.6] text-inkDim">
            Not affiliated with, endorsed by, or connected to Netflix, Inc. &quot;Netflix&quot; is a
            trademark of Netflix, Inc. Companion is an independent browser extension.
          </p>
        </div>
      </footer>
    </main>
  );
}
