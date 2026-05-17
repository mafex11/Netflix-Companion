# Netflix Auto-Skip

A tiny Chrome extension that silently clicks Netflix's **Skip Intro**, **Skip Recap**, **Next Episode**, and **Are You Still Watching?** buttons so your binge never breaks rhythm.

No accounts. No servers. No tracking. ~80 lines of glue code.

---

## Features

- **Skip Intro** — opening titles disappear the moment they're skippable
- **Skip Recap** — "previously on…" gets dismissed instantly
- **Next Episode** — auto-advances at end credits, no waiting on the timer
- **Are You Still Watching?** — auto-confirms so a long binge doesn't pause overnight
- **Per-channel toggles** — turn off what you don't want (e.g. leave intros on for shows where the opening is part of the experience)
- **Skip counter** — running total displayed in the popup and as a badge on the toolbar icon. Click to reset.
- **Settings sync** — your toggles travel with you across signed-in Chrome profiles

## Install

### From the Chrome Web Store (recommended)
*(Coming soon — pending review.)*

### From source (developer mode)

1. Clone or download this repo.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `netflix-auto-skip/` folder.
5. Open a Netflix episode — that's it.

To pick up changes after editing, click the refresh icon on the extension card and reload your Netflix tab.

## How it works

Netflix renders skip buttons with stable `data-uia` attributes (their internal QA-test selectors). The content script:

1. Reads your toggle preferences from `chrome.storage.sync`.
2. Sets up a `MutationObserver` on the document — fires only when the DOM changes, no polling.
3. On each mutation, looks for buttons matching:
   - `[data-uia="player-skip-intro"]` — Skip Intro
   - `[data-uia="player-skip-recap"]` / `[data-uia="player-skip-preplay"]` — Skip Recap
   - `[data-uia="next-episode-seamless-button"]` — Next Episode
   - `[data-uia="continue-watching"]` / `[data-uia="interrupter-actions-positive"]` — Still Watching
4. If the matching toggle is on and the button is visible, calls `.click()`.
5. Sends a `{ type: "skipped" }` message to the background service worker, which increments the counter and updates the toolbar badge.
6. Listens for `chrome.runtime.onMessage` so popup toggles take effect live without a page reload.

A `WeakSet` of recently-clicked buttons prevents double-firing on rapid DOM mutations.

## Project layout

```
netflix-auto-skip/
├── manifest.json      Manifest V3 — permissions, content script, popup, service worker
├── content.js         Runs on netflix.com; observes DOM; clicks the buttons
├── background.js      Service worker — owns the skip-counter badge
├── popup.html         Popup UI (broadcast-deck aesthetic, custom flip switches)
├── popup.js           Reads/writes chrome.storage.sync; broadcasts changes to tabs
├── icons/             Toolbar icons (16, 48, 128 px)
└── preview*.html      Standalone marketing pages used to generate Web Store screenshots
```

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Persists toggle preferences and skip counter across sessions and devices |
| `*://*.netflix.com/*` | Required to inject the content script that detects and clicks Netflix's skip buttons. **No other domains are accessed.** |

The extension does **not**:
- collect, transmit, or store any user data
- make network requests to any server
- execute any remotely-loaded code (everything is bundled in the package)
- read your Netflix activity, history, or account info

The only thing saved is four booleans (your toggle states) and one integer (the skip counter).

## Updating the selectors

If a Netflix redesign breaks a skip behavior, the fix is one line. Open `content.js` and update the `SELECTORS` map at the top:

```js
const SELECTORS = {
  skipIntro: ['[data-uia="player-skip-intro"]'],
  skipRecap: [
    '[data-uia="player-skip-recap"]',
    '[data-uia="player-skip-preplay"]',
  ],
  nextEpisode: [
    '[data-uia="next-episode-seamless-button"]',
    '[data-uia="next-episode-seamless-button-draining"]',
  ],
  stillWatching: [
    '[data-uia="continue-watching"]',
    '[data-uia="interrupter-actions-positive"]',
  ],
};
```

To find the new selector: open Netflix DevTools, inspect the broken button, look for any `data-uia="..."` attribute on the element or its parent, and add it to the array. Multiple selectors per channel act as fallbacks.

## Development

There's no build step — pure HTML/CSS/JS. Edit a file, hit refresh on the extension card, reload Netflix.

To validate your changes before zipping:

```bash
node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))" && \
node --check content.js && \
node --check popup.js && \
node --check background.js && \
echo OK
```

## Packaging for the Chrome Web Store

```bash
cd netflix-auto-skip
zip -r ../netflix-auto-skip-1.0.0.zip . -x ".*" -x "*.DS_Store" -x "preview*.html" -x "README.md"
```

`manifest.json` must sit at the zip root — don't include the parent folder.

## Roadmap

- [ ] Skip Netflix ad breaks (for ad-tier subscribers) by speeding up `<video>` playback rate
- [ ] Per-show overrides ("don't skip intro for *Severance*")
- [ ] Keyboard shortcut to pause auto-skip for one episode
- [ ] Dark/light theme toggle for the popup

## Contributing

Issues and pull requests welcome. If you find a broken selector, please include:
- The show & episode where it broke
- A screenshot of the button's HTML from DevTools (right-click the button → Inspect)

## License

MIT.

## Disclaimer

Not affiliated with, endorsed by, or connected to Netflix, Inc.
"Netflix" is a trademark of Netflix, Inc.
