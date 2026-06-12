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

function getVideo() {
  return document.querySelector("video");
}

// Find the native left-cluster button row, and a template button to clone styling from.
// Returns { cluster, template } or null if the control bar isn't present yet.
function findControlCluster() {
  const bar = document.querySelector('[data-uia="controls-standard"]');
  if (!bar || !bar.firstChild) return null;
  const cluster = bar.firstChild;
  // The first child element of the cluster is a real Netflix control button — clone its style.
  const template = cluster.querySelector("button");
  if (!template) return null;
  return { cluster, template };
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

// Inject all enabled buttons into the control bar. Idempotent: removes our previous
// buttons first, then re-adds according to current settings. Safe to call on every
// observer tick.
function injectControls(settings) {
  const found = findControlCluster();
  if (!found) return;
  const { cluster, template } = found;

  // Remove any of our previously-injected buttons so toggles take effect live and
  // we never double-insert when Netflix re-renders the bar.
  cluster.querySelectorAll(`.${MARK}`).forEach((el) => el.remove());

  if (settings.show5sButtons) {
    const back = makeButton(template, "Rewind 5 seconds", makeIcon("rewind5"));
    back.style.position = "relative";
    back.appendChild(makeSeekLabel(5));
    back.addEventListener("click", () => seek(-5));

    const fwd = makeButton(template, "Forward 5 seconds", makeIcon("forward5"));
    fwd.style.position = "relative";
    fwd.appendChild(makeSeekLabel(5));
    fwd.addEventListener("click", () => seek(5));

    // Insert the 5s buttons right after the play/pause button (cluster's first button).
    const anchor = cluster.querySelector("button");
    anchor.insertAdjacentElement("afterend", fwd);
    anchor.insertAdjacentElement("afterend", back);
  }

  if (settings.showSpeedButton) {
    const speedInner = document.createElement("span");
    speedInner.className = "nf-speed-label";
    speedInner.style.cssText = "font-size:13px;font-weight:700;";
    const video = getVideo();
    const currentRate = video ? video.playbackRate : 1;
    speedInner.textContent = currentRate === 1 ? "1x" : `${currentRate}x`;
    const speedBtn = makeButton(template, "Playback speed", speedInner);
    speedBtn.addEventListener("click", () => cycleSpeed(speedBtn));
    cluster.appendChild(speedBtn);
  }

  if (settings.showPipButton) {
    const pipBtn = makeButton(template, "Picture in picture", makeIcon("pip"));
    pipBtn.addEventListener("click", () => togglePip(pipBtn));
    cluster.appendChild(pipBtn);
  }
}
