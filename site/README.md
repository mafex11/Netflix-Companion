# Netflix Companion — Launch Site

Marketing site for the Netflix Companion Chrome extension. Next.js (App Router) +
Tailwind CSS + Framer Motion. Static-exported, so it deploys anywhere.

## Develop

```bash
cd site
npm install
npm run dev      # http://localhost:3000
```

## Build (static export)

```bash
npm run build    # outputs ./out — a static site
```

Deploy `out/` to GitHub Pages, Netlify, Vercel, or any static host. On Vercel, just import
the repo and set the root directory to `site/` — no extra config.

## Before publishing

Set the real launch URLs in `lib/site.ts`:

```ts
export const STORE_URL = "https://chrome.google.com/webstore/detail/...";
export const GITHUB_URL = "https://github.com/<you>/netflix-companion";
```

Every "Add to Chrome" / "View source" / "GitHub" link reads from there.

## Structure

```
site/
├── app/
│   ├── layout.tsx     Fonts (Anton / Archivo / JetBrains Mono), metadata, globals
│   ├── page.tsx       The page — assembles all sections
│   └── globals.css    Grain + scanline overlays, focus styles
├── components/
│   ├── Chrome.tsx     Telemetry rail (scroll-driven counter) + sticky nav
│   ├── Hero.tsx       Hero with parallax launch-film player frame
│   ├── DeckBar.tsx    Player control-bar motif used as a section divider
│   └── Reveal.tsx     Framer Motion scroll-reveal wrapper
├── lib/site.ts        Launch URLs + feature/shortcut/showcase content
└── public/assets/     Launch video, popup + store screenshots, icon
```
