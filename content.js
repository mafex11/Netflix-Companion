// Netflix Companion — content script

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
  show90sButtons: true,
  showPipButton: true,
  playbackSpeed: 1,
  volumeBoost: 1,
  normalizer: false,
};

let settings = { ...DEFAULTS };
const recentClicks = new WeakSet();

chrome.storage.sync.get(DEFAULTS).then((stored) => {
  settings = { ...DEFAULTS, ...stored };
  if (location.pathname.startsWith("/watch")) applyMediaSettings();
});

// Push speed/volume/normalizer into the main world. setSpeed/setVolume/setNormalizer
// are global posters from controls.js; they call ensureInjected() themselves.
function applyMediaSettings() {
  if (typeof setSpeed === "function") setSpeed(settings.playbackSpeed);
  if (typeof setVolume === "function") setVolume(settings.volumeBoost);
  if (typeof setNormalizer === "function") setNormalizer(settings.normalizer);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "settings") {
    settings = { ...DEFAULTS, ...msg.settings };
    if (location.pathname.startsWith("/watch")) applyMediaSettings();
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

// Keyboard shortcuts. Active only on /watch pages, ignored while typing in a field.
// Keys use event.code (layout-independent). Reuses the global seek/frameStep/togglePip
// functions from controls.js (same content-script scope).
function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

// Change speed by a step, clamp to [0.1, 4], persist, push to player, and toast.
function nudgeSpeed(step) {
  const next = Math.min(4, Math.max(0.1, Math.round((settings.playbackSpeed + step) * 100) / 100));
  settings.playbackSpeed = next;
  if (typeof setSpeed === "function") setSpeed(next);
  if (typeof showToast === "function") showToast(next + "×");
  chrome.storage.sync.set({ playbackSpeed: next }).catch(() => {});
}

function onKeydown(e) {
  if (!location.pathname.startsWith("/watch")) return;
  if (isTypingTarget(e.target)) return;
  if (e.altKey || e.ctrlKey || e.metaKey) return;

  let handled = true;
  switch (e.code) {
    case "BracketLeft":
      // Rewind. seek()'s delta is inverted in injected.js, so back = positive.
      seek(e.shiftKey ? 90 : 5);
      break;
    case "BracketRight":
      // Forward.
      seek(e.shiftKey ? -90 : -5);
      break;
    case "Comma":
      if (e.shiftKey) nudgeSpeed(-0.25);
      else frameStep(1); // step back (frameStep dir is inverted like seek)
      break;
    case "Period":
      if (e.shiftKey) nudgeSpeed(0.25);
      else frameStep(-1); // step forward
      break;
    case "KeyP":
      if (e.shiftKey) { handled = false; break; }
      togglePip();
      break;
    default:
      handled = false;
  }

  if (handled) {
    e.preventDefault();
    e.stopPropagation();
  }
}

document.addEventListener("keydown", onKeydown, true);
