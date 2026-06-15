// Netflix Companion — player control injection
// Injects 5s seek, speed-cycle, and PiP buttons into Netflix's native control bar.
// All buttons clone an existing native button's classes so they inherit Netflix styling.

// Marker class so we never inject our buttons twice and can find them later.
const MARK = "nf-companion-btn";

// SVG path data for our button icons (24x24 viewBox), matching Netflix's icon weight.
const ICONS = {
  rewind5:
    "M11 5V1L5 7l6 6V9c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H3c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z",
  forward5:
    "M13 5V1l6 6-6 6V9c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z",
  pip:
    "M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 16.01H3V4.98h18v14.03z",
};

// Build a button that visually matches `templateButton` (a native Netflix control button).
// `label` is used for aria-label + title. `inner` is an HTMLElement placed inside the button.
function makeButton(templateButton, label, inner) {
  const btn = document.createElement("button");
  btn.className = templateButton.className;
  btn.classList.add(MARK);
  btn.setAttribute("aria-label", label);
  btn.setAttribute("title", label);
  btn.type = "button";
  btn.appendChild(inner);
  return btn;
}

// Build an SVG icon element from a path key in ICONS. Sized to fill a native 44x44
// control button (the path scales from the 24x24 viewBox).
function makeIcon(pathKey) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "44");
  svg.setAttribute("height", "44");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", ICONS[pathKey]);
  svg.appendChild(path);
  return svg;
}

// Marker class for the wrapper divs we clone around each button.
const WRAP_MARK = "nf-companion-wrap";

// Wrap a button in a clone of a native button-wrapper div so it sits in the flex row
// exactly like a native control (each native button lives in its own w=52 wrapper).
function makeWrapper(wrapperTemplate, buttonEl) {
  const wrap = document.createElement("div");
  wrap.className = wrapperTemplate.className;
  wrap.classList.add(WRAP_MARK);
  wrap.appendChild(buttonEl);
  return wrap;
}

// Build a small numeric badge overlay for seek buttons (so they read distinct from the
// native 10s buttons). Two-digit text (e.g. "90") uses a smaller font so it still fits.
function makeSeekLabel(text) {
  const str = String(text);
  const span = document.createElement("span");
  span.textContent = str;
  const fontSize = str.length >= 2 ? "10px" : "13px";
  span.style.cssText =
    "position:absolute;bottom:11px;left:50%;transform:translateX(-50%);" +
    "font-size:" + fontSize + ";font-weight:700;pointer-events:none;";
  return span;
}

function getVideo() {
  return document.querySelector("video");
}

// Find the native button group and templates to clone.
// Structure (confirmed via DOM dump): each native control button lives inside its OWN
// wrapper div (~52px wide), and those wrappers are flex children of a "group" div that
// holds play / back10 / forward10 / volume on the left. We must insert our buttons as
// sibling WRAPPERS in that group — appending into the play button's own wrapper makes
// them stack vertically (the wrapper is display:block, 52px wide).
// Returns { group, wrapperTemplate, buttonTemplate } or null if not ready.
function findControlCluster() {
  const playPause = document.querySelector('[data-uia^="control-play-pause"]');
  const wrapperTemplate = playPause && playPause.parentElement; // the ~52px wrapper div
  const group = wrapperTemplate && wrapperTemplate.parentElement; // flex row of wrappers
  if (!playPause || !wrapperTemplate || !group) return null;
  return { group, wrapperTemplate, buttonTemplate: playPause };
}

// Inject the MAIN-world helper script once. Setting video.currentTime directly desyncs
// Netflix's Cadmium player and tears the <video> element down, so seeking must go through
// Netflix's own player API — which only lives on the page's window, unreachable from this
// isolated content-script world. injected.js runs in the main world and listens for our
// postMessage seek requests.
let injectedReady = false;
function ensureInjected() {
  if (injectedReady) return;
  injectedReady = true;
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("injected.js");
  s.onload = () => s.remove(); // tidy up the tag; the listener it registered persists
  (document.head || document.documentElement).appendChild(s);
}

function seek(deltaSeconds) {
  // Hand the seek to the main-world script, which calls Netflix's player API.
  ensureInjected();
  window.postMessage({ source: "nf-companion", type: "seek", delta: deltaSeconds }, "*");
}

// Pause and nudge by one frame. dir = -1 (back) or 1 (forward). Handled in injected.js.
function frameStep(dir) {
  ensureInjected();
  window.postMessage({ source: "nf-companion", type: "frameStep", dir: dir }, "*");
}

// Set playback rate (0.1–4). Handled in injected.js (main world).
function setSpeed(rate) {
  ensureInjected();
  window.postMessage({ source: "nf-companion", type: "setSpeed", rate: rate }, "*");
}

// Set volume boost multiplier (1–5). Handled in injected.js.
function setVolume(boost) {
  ensureInjected();
  window.postMessage({ source: "nf-companion", type: "setVolume", boost: boost }, "*");
}

// Enable/disable the audio normalizer (compressor). Handled in injected.js.
function setNormalizer(on) {
  ensureInjected();
  window.postMessage({ source: "nf-companion", type: "setNormalizer", on: on }, "*");
}

// Brief centered on-screen toast (used by speed shortcuts). Auto-removes.
let toastEl = null;
let toastTimer = null;
function showToast(text) {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.style.cssText =
      "position:fixed;top:12%;left:50%;transform:translateX(-50%);z-index:2147483647;" +
      "background:rgba(0,0,0,0.8);color:#fff;font-family:sans-serif;font-size:22px;" +
      "font-weight:700;padding:10px 18px;border-radius:6px;pointer-events:none;" +
      "transition:opacity 0.2s;opacity:0;";
    document.documentElement.appendChild(toastEl);
  }
  toastEl.textContent = text;
  toastEl.style.opacity = "1";
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (toastEl) toastEl.style.opacity = "0";
  }, 800);
}

async function togglePip(btn) {
  const video = getVideo();
  if (!video) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (err) {
    // PiP can be blocked by DRM/browser policy. Flash the button to signal failure.
    console.log("[netflix-companion] PiP failed", err);
    if (btn) {
      const prev = btn.style.color;
      btn.style.color = "#e50914";
      setTimeout(() => {
        btn.style.color = prev;
      }, 600);
    }
  }
}

// Desired button ids per setting key, so we can detect "already in the right state"
// without mutating the DOM. The MutationObserver that drives this watches the whole
// document subtree, so injectControls MUST NOT write to the DOM unless something is
// actually wrong — otherwise its own writes re-trigger the observer in an infinite
// loop (runaway CPU/memory, and Netflix's control bar never gets to render).
const CONTROL_IDS = {
  show5sButtons: ["nf-back5", "nf-fwd5"],
  show90sButtons: ["nf-back90", "nf-fwd90"],
  showPipButton: ["nf-pip"],
};

// Compute which of our button ids SHOULD be present given current settings.
function desiredIds(settings) {
  const ids = new Set();
  for (const [key, btnIds] of Object.entries(CONTROL_IDS)) {
    if (settings[key]) btnIds.forEach((id) => ids.add(id));
  }
  return ids;
}

// Read-only check: are exactly the desired buttons present, no more, no fewer?
function controlsInDesiredState(group, settings) {
  const want = desiredIds(settings);
  const have = new Set(
    Array.from(group.querySelectorAll(`.${MARK}`)).map((el) => el.dataset.nfControl)
  );
  if (want.size !== have.size) return false;
  for (const id of want) if (!have.has(id)) return false;
  return true;
}

// Return the wrapper div that holds a native button (its immediate parent).
function nativeWrapper(group, uia) {
  const btn = group.querySelector(`[data-uia="${uia}"]`);
  return btn ? btn.parentElement : null;
}

// Clone a native control button (and its wrapper) so size/styling/spacing are
// pixel-identical to Netflix's own buttons, then swap in our own arrow icon and a "5"
// badge. Cloning the 10s button gives us its exact inner structure (button > div > svg)
// and CSS sizing for free; we only replace the SVG path so it doesn't read "10".
// Returns the cloned WRAPPER ready to insert, or null if the native button is missing.
function cloneNativeSeek(group, sourceUia, nfId, label, iconKey, badgeText, onClick) {
  const src = group.querySelector(`[data-uia="${sourceUia}"]`);
  if (!src || !src.parentElement) return null;
  const wrap = src.parentElement.cloneNode(true);
  wrap.classList.add(WRAP_MARK);

  const btn = wrap.querySelector("button") || wrap;
  btn.classList.add(MARK);
  btn.dataset.nfControl = nfId;
  btn.removeAttribute("data-uia");
  btn.setAttribute("aria-label", label);
  btn.setAttribute("title", label);
  btn.style.position = "relative";

  // Swap the cloned SVG's path for our arrow (keeps native svg sizing; drops the "10").
  const svg = wrap.querySelector("svg");
  if (svg) {
    svg.removeAttribute("data-uia");
    // Crop the 24x24 viewBox inward to zoom the arrow so it fills the button like the
    // native 10s icon (the raw path leaves empty margin at 0 0 24 24).
    svg.setAttribute("viewBox", "1 0 22 23");
    svg.setAttribute("fill", "currentColor");
    // Nudge just the arrow icon up so it isn't clipped at the bottom. The "5" badge is a
    // separate absolutely-positioned overlay and is NOT affected by this transform.
    svg.style.transform = "translateY(-3px)";
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const ns = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", ICONS[iconKey]);
    svg.appendChild(path);
  }

  // React click listeners are NOT cloned, so the clone is inert until we attach ours.
  btn.addEventListener("click", onClick);

  // Overlay the seconds badge so it reads distinct from the native 10s icon.
  btn.appendChild(makeSeekLabel(badgeText));
  return wrap;
}

// Inject/sync our buttons into the control bar. This runs on every observer tick, so
// the fast path is a pure READ: if the buttons already match the desired state we
// return without touching the DOM (no self-trigger, no loop). We only mutate when the
// state is wrong (first injection, a toggle changed, or Netflix re-rendered the bar).
//
// Each native button lives in its own wrapper div inside `group` (a flex row). We mirror
// that: wrap each of our buttons in a clone of a native wrapper and insert THAT wrapper
// as a sibling of the native wrappers — never append a bare button into another button's
// wrapper (that stacks them vertically).
function injectControls(settings) {
  const found = findControlCluster();
  if (!found) return;
  const { group, wrapperTemplate, buttonTemplate } = found;

  // Fast path: nothing to do. Pure read — does not mutate the DOM.
  if (controlsInDesiredState(group, settings)) return;

  // State is wrong — rebuild. Remove our previous wrappers (and any stray buttons).
  group.querySelectorAll(`.${WRAP_MARK}`).forEach((el) => el.remove());
  group.querySelectorAll(`.${MARK}`).forEach((el) => el.remove());

  const forward10Wrap = nativeWrapper(group, "control-forward10");

  // The ~30px spacer div that sits between each native button wrapper — clone it so our
  // buttons get the same horizontal gaps. It's the sibling right after a button wrapper.
  const spacerTemplate =
    forward10Wrap &&
    forward10Wrap.nextElementSibling &&
    !forward10Wrap.nextElementSibling.querySelector("button")
      ? forward10Wrap.nextElementSibling
      : null;
  function makeSpacer() {
    if (!spacerTemplate) return null;
    const s = spacerTemplate.cloneNode(true);
    s.classList.add(WRAP_MARK); // tag so cleanup removes our spacers too
    return s;
  }

  // Insert our buttons as a contiguous block AFTER the native 10s forward button, each
  // followed by a spacer clone so spacing matches the native buttons. Moving anchor:
  // every new element goes right after the previous one.
  let anchor = forward10Wrap;
  function placeAfterAnchor(el) {
    if (anchor) anchor.insertAdjacentElement("afterend", el);
    else group.appendChild(el);
    anchor = el;
  }
  function placeButtonWithSpacing(wrap) {
    const spacer = makeSpacer();
    if (spacer) placeAfterAnchor(spacer); // gap before our button
    placeAfterAnchor(wrap);
  }

  if (settings.show5sButtons) {
    ensureInjected(); // load the main-world seek helper before the user can click
    const backWrap = cloneNativeSeek(
      group, "control-back10", "nf-back5", "Rewind 5 seconds", "rewind5", "5",
      () => seek(5)
    );
    if (backWrap) placeButtonWithSpacing(backWrap);

    const fwdWrap = cloneNativeSeek(
      group, "control-forward10", "nf-fwd5", "Forward 5 seconds", "forward5", "5",
      () => seek(-5)
    );
    if (fwdWrap) placeButtonWithSpacing(fwdWrap);
  }

  if (settings.show90sButtons) {
    ensureInjected();
    const back90 = cloneNativeSeek(
      group, "control-back10", "nf-back90", "Rewind 90 seconds", "rewind5", "90",
      () => seek(90)
    );
    if (back90) placeButtonWithSpacing(back90);

    const fwd90 = cloneNativeSeek(
      group, "control-forward10", "nf-fwd90", "Forward 90 seconds", "forward5", "90",
      () => seek(-90)
    );
    if (fwd90) placeButtonWithSpacing(fwd90);
  }

  if (settings.showPipButton) {
    const pipBtn = makeButton(buttonTemplate, "Picture in picture", makeIcon("pip"));
    pipBtn.dataset.nfControl = "nf-pip";
    pipBtn.addEventListener("click", () => togglePip(pipBtn));
    placeButtonWithSpacing(makeWrapper(wrapperTemplate, pipBtn));
  }
}
