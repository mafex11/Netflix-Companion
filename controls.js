// Netflix Companion — player control injection
// Injects 5s seek, speed-cycle, and PiP buttons into Netflix's native control bar.
// All buttons clone an existing native button's classes so they inherit Netflix styling.

const SPEED_PRESETS = [1, 1.25, 1.5, 2];

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

// Build an SVG icon element from a path key in ICONS.
function makeIcon(pathKey) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "24");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", ICONS[pathKey]);
  svg.appendChild(path);
  return svg;
}

// Build a "5" badge overlay element for the seek buttons (so 5s reads distinct from 10s).
function makeSeekLabel(seconds) {
  const span = document.createElement("span");
  span.textContent = String(seconds);
  span.style.cssText =
    "position:absolute;bottom:6px;left:50%;transform:translateX(-50%);" +
    "font-size:9px;font-weight:700;pointer-events:none;";
  return span;
}

// Track current speed index so the cycle button advances predictably.
let speedIndex = 0;

// Count of times we actually mutated the control bar. If this climbs without bound
// while the video sits still, the injection is self-triggering the observer (a bug).
let injectionCount = 0;

function getVideo() {
  return document.querySelector("video");
}

// One-time structural dump of the control bar so we can see Netflix's real DOM layout.
// Prints a compact outline (tag.class[data-uia]) instead of full HTML to avoid flooding
// the console. Guarded by `dumped` so it only runs once per page load.
let dumped = false;
function describe(el) {
  if (!el || el.nodeType !== 1) return String(el && el.nodeName);
  const cls = (el.className && typeof el.className === "string")
    ? "." + el.className.trim().split(/\s+/).join(".")
    : "";
  const uia = el.getAttribute && el.getAttribute("data-uia");
  return el.tagName.toLowerCase() + cls + (uia ? `[data-uia="${uia}"]` : "");
}
function dumpControlBar() {
  if (dumped) return;
  const bar = document.querySelector('[data-uia="controls-standard"]');
  if (!bar) {
    console.log("[netflix-companion] DUMP: no [data-uia=controls-standard] found");
    return;
  }
  dumped = true;
  console.log("[netflix-companion] === CONTROL BAR DUMP ===");

  // List every native button under the control bar, with its data-uia/aria-label and
  // the chain of ancestor containers up to the bar. This shows exactly which group
  // holds the play/seek buttons so we can insert our buttons as their siblings.
  const buttons = bar.querySelectorAll("button");
  console.log("[netflix-companion] found", buttons.length, "native buttons:");
  buttons.forEach((btn, i) => {
    const uia = btn.getAttribute("data-uia") || "";
    const aria = btn.getAttribute("aria-label") || "";
    // Build ancestor chain (class of each parent) up to the bar.
    const chain = [];
    let p = btn.parentElement;
    while (p && p !== bar && chain.length < 5) {
      const cls = (typeof p.className === "string" ? p.className.trim().split(/\s+/).join(".") : "");
      chain.push(cls || p.tagName.toLowerCase());
      p = p.parentElement;
    }
    console.log(
      `  [${i}] data-uia="${uia}" aria="${aria}"  parents: ${chain.join("  <  ")}`
    );
  });
  console.log("[netflix-companion] === END DUMP ===");
}

// Find the native button row and a template button to clone styling from.
// Netflix puts all control buttons (play-pause, back10, forward10, volume, …,
// fullscreen) as siblings in one flat row — that row is the play-pause button's
// parent. We anchor to the play-pause button (always present) rather than to
// bar.firstChild, which is an outer wrapper that also contains the timeline scrubber.
// Returns { row, template } or null if the control bar isn't present yet.
function findControlCluster() {
  const playPause = document.querySelector('[data-uia^="control-play-pause"]');
  if (!playPause || !playPause.parentElement) return null;
  return { row: playPause.parentElement, template: playPause };
}

function seek(deltaSeconds) {
  const video = getVideo();
  if (!video) return;
  video.currentTime = Math.max(0, video.currentTime + deltaSeconds);
}

function cycleSpeed(btn) {
  const video = getVideo();
  if (!video) return;
  speedIndex = (speedIndex + 1) % SPEED_PRESETS.length;
  const rate = SPEED_PRESETS[speedIndex];
  video.playbackRate = rate;
  updateSpeedLabel(btn, rate);
}

function updateSpeedLabel(btn, rate) {
  const label = btn.querySelector(".nf-speed-label");
  if (label) label.textContent = rate === 1 ? "1x" : `${rate}x`;
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
    const prev = btn.style.color;
    btn.style.color = "#e50914";
    setTimeout(() => {
      btn.style.color = prev;
    }, 600);
  }
}

// Desired button ids per setting key, so we can detect "already in the right state"
// without mutating the DOM. The MutationObserver that drives this watches the whole
// document subtree, so injectControls MUST NOT write to the DOM unless something is
// actually wrong — otherwise its own writes re-trigger the observer in an infinite
// loop (runaway CPU/memory, and Netflix's control bar never gets to render).
const CONTROL_IDS = {
  show5sButtons: ["nf-back5", "nf-fwd5"],
  showSpeedButton: ["nf-speed"],
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
function controlsInDesiredState(row, settings) {
  const want = desiredIds(settings);
  const have = new Set(
    Array.from(row.querySelectorAll(`.${MARK}`)).map((el) => el.dataset.nfControl)
  );
  if (want.size !== have.size) return false;
  for (const id of want) if (!have.has(id)) return false;
  return true;
}

// Inject/sync our buttons into the control bar. This runs on every observer tick, so
// the fast path is a pure READ: if the buttons already match the desired state we
// return without touching the DOM (no self-trigger, no loop). We only mutate when the
// state is wrong (first injection, a toggle changed, or Netflix re-rendered the bar).
function injectControls(settings) {
  const found = findControlCluster();
  if (!found) return;
  const { row, template } = found;

  // One-time: dump the real control-bar structure for debugging insertion point.
  dumpControlBar();

  // Fast path: nothing to do. Pure read — does not mutate the DOM.
  if (controlsInDesiredState(row, settings)) return;

  // State is wrong — rebuild our buttons. Remove ours first, then re-add.
  row.querySelectorAll(`.${MARK}`).forEach((el) => el.remove());

  // Native sibling anchors (all live in the same flat row).
  const back10 = row.querySelector('[data-uia="control-back10"]');
  const forward10 = row.querySelector('[data-uia="control-forward10"]');

  if (settings.show5sButtons) {
    const back = makeButton(template, "Rewind 5 seconds", makeIcon("rewind5"));
    back.dataset.nfControl = "nf-back5";
    back.style.position = "relative";
    back.appendChild(makeSeekLabel(5));
    back.addEventListener("click", () => seek(-5));

    const fwd = makeButton(template, "Forward 5 seconds", makeIcon("forward5"));
    fwd.dataset.nfControl = "nf-fwd5";
    fwd.style.position = "relative";
    fwd.appendChild(makeSeekLabel(5));
    fwd.addEventListener("click", () => seek(5));

    // Place 5s rewind just before native 10s rewind; 5s forward just after 10s forward.
    if (back10) back10.insertAdjacentElement("beforebegin", back);
    else row.appendChild(back);
    if (forward10) forward10.insertAdjacentElement("afterend", fwd);
    else row.appendChild(fwd);
  }

  if (settings.showPipButton) {
    const pipBtn = makeButton(template, "Picture in picture", makeIcon("pip"));
    pipBtn.dataset.nfControl = "nf-pip";
    pipBtn.addEventListener("click", () => togglePip(pipBtn));
    // Place PiP just after our 5s forward button if present, else after native 10s forward.
    const fwdAnchor = row.querySelector('[data-nf-control="nf-fwd5"]') || forward10;
    if (fwdAnchor) fwdAnchor.insertAdjacentElement("afterend", pipBtn);
    else row.appendChild(pipBtn);
  }

  if (settings.showSpeedButton) {
    const speedInner = document.createElement("span");
    speedInner.className = "nf-speed-label";
    speedInner.style.cssText = "font-size:13px;font-weight:700;";
    const video = getVideo();
    const currentRate = video ? video.playbackRate : 1;
    speedInner.textContent = currentRate === 1 ? "1x" : `${currentRate}x`;
    const speedBtn = makeButton(template, "Playback speed", speedInner);
    speedBtn.dataset.nfControl = "nf-speed";
    speedBtn.addEventListener("click", () => cycleSpeed(speedBtn));
    // Append speed at the end of the row (near native speed/fullscreen controls).
    row.appendChild(speedBtn);
  }

  injectionCount += 1;
  console.log("[netflix-companion] injected controls (mutation #" + injectionCount + ")");
}
