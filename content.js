// Netflix Auto-Skip — content script

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

const DEFAULTS = {
  skipIntro: true,
  skipRecap: true,
  nextEpisode: true,
  stillWatching: true,
  show5sButtons: true,
  showPipButton: true,
};

let settings = { ...DEFAULTS };
const recentClicks = new WeakSet();

console.log("[netflix-auto-skip] content script loaded on", location.href);

chrome.storage.sync.get(DEFAULTS).then((stored) => {
  settings = { ...DEFAULTS, ...stored };
  console.log("[netflix-auto-skip] settings", settings);
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "settings") {
    settings = { ...DEFAULTS, ...msg.settings };
    console.log("[netflix-auto-skip] settings updated", settings);
  }
});

function findVisible(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.offsetParent !== null) return el;
  }
  return null;
}

function clickOnce(button, key) {
  if (recentClicks.has(button)) return;
  recentClicks.add(button);
  button.click();
  console.log("[netflix-auto-skip] clicked", key, button);
  chrome.runtime.sendMessage({ type: "skipped", key }).catch(() => {});
}

function trySkip() {
  if (!location.pathname.startsWith("/watch") && !location.pathname.startsWith("/browse")) return;
  for (const [key, selectors] of Object.entries(SELECTORS)) {
    if (!settings[key]) continue;
    const button = findVisible(selectors);
    if (button) clickOnce(button, key);
  }
  // injectControls is defined in controls.js (loaded first). It is idempotent and
  // only acts on /watch pages where the control bar exists.
  if (typeof injectControls === "function" && location.pathname.startsWith("/watch")) {
    injectControls(settings);
  }
}

const observer = new MutationObserver(trySkip);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
});

trySkip();
