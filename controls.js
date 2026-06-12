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
