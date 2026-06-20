// The player control-bar motif, reused as a section divider — echoes the real injected
// 5s / 90s / PiP buttons with the glowing "active" treatment.
export function DeckBar() {
  return (
    <div
      aria-hidden
      className="mx-auto flex max-w-[560px] items-center gap-[14px] rounded-[12px] border border-line bg-panel px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    >
      <Btn>
        <path d="M8 5v14l11-7z" />
      </Btn>
      <Btn on box="1 0 22 23" badge="5">
        <path d="M11 5V1L5 7l6 6V9c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H3c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
      </Btn>
      <Btn on box="1 0 22 23" badge="90">
        <path d="M13 5V1l6 6-6 6V9c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
      </Btn>
      <Btn on>
        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 16H3V5h18v14z" />
      </Btn>
      <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-line after:absolute after:inset-y-0 after:left-0 after:w-[34%] after:bg-red after:shadow-[0_0_12px_var(--red-glow)] after:content-['']" />
      <Btn>
        <path d="M3 9v6h4l5 5V4L7 9H3z" />
      </Btn>
    </div>
  );
}

function Btn({
  children,
  on = false,
  box = "0 0 24 24",
  badge,
}: {
  children: React.ReactNode;
  on?: boolean;
  box?: string;
  badge?: string;
}) {
  return (
    <span className={`relative grid h-[42px] w-[42px] place-items-center ${on ? "text-white" : "text-ink"}`}>
      {on && (
        <span className="absolute -inset-[5px] rounded-[9px] shadow-[0_0_0_2px_var(--red),0_0_20px_var(--red-glow)]" />
      )}
      <svg viewBox={box} className="h-[30px] w-[30px] fill-current">
        {children}
      </svg>
      {badge && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold">
          {badge}
        </span>
      )}
    </span>
  );
}
