// Central place for launch URLs — fill in once the extension is approved & repo is public.
export const STORE_URL =
  "https://chromewebstore.google.com/detail/netflix-companion/ndmlfjmmoaclmcaeiihgfomkjmdfphig";
export const GITHUB_URL = "https://github.com/mafex11/Netflix-Companion";

export const SKIP_FEATURES = [
  {
    title: "Skip Intro",
    body: "Opening titles disappear the instant they become skippable. No more theme song on episode twelve.",
    icon: "M6 4l12 8-12 8V4zm12 0h2v16h-2V4z",
  },
  {
    title: "Skip Recap",
    body: '"Previously on…" is dismissed before it starts. Watching in one sitting? You don\'t need the refresher.',
    icon: "M12 5V1L7 6l5 5V7a5 5 0 11-5 5H5a7 7 0 107-7z",
  },
  {
    title: "Next Episode",
    body: "Advances the moment credits roll — no countdown, no waiting. Pure binge mode.",
    icon: "M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z",
  },
  {
    title: '"Still Watching?"',
    body: "Auto-confirms the prompt so a long binge never pauses itself overnight.",
    icon: "M12 1a11 11 0 100 22 11 11 0 000-22zm-1 5h2v6h-2V6zm0 8h2v2h-2v-2z",
  },
];

export const SHORTCUTS = [
  { keys: ["[", "]"], label: "Rewind / forward 5 seconds" },
  { keys: ["⇧ [", "⇧ ]"], label: "Rewind / forward 90 seconds" },
  { keys: [",", "."], label: "Step one frame" },
  { keys: ["<", ">"], label: "Decrease / increase speed" },
  { keys: ["P"], label: "Toggle picture-in-picture" },
];

export const SHOWCASE = [
  {
    title: ["Seek by ", "5 or 90", " seconds"],
    body: "Two new button pairs sit right beside Netflix's own 10-second controls — for nudging past a line you missed, or leaping over a long stretch. Step frame-by-frame when you need the exact moment.",
    points: ["5s rewind & forward", "90s rewind & forward", "Frame-by-frame step"],
    img: "/assets/feat-seek.png",
    alt: "5 and 90 second seek controls in the Netflix player",
    flip: false,
  },
  {
    title: ["Speed & ", "sound", ", your way"],
    body: "Slow a tense scene to 0.1× or fly through a slow one at 4×. Push volume up to 500% past Netflix's ceiling, and even out loud action against quiet dialogue with the normalizer.",
    points: ["Playback speed 0.1× – 4×", "Volume boost up to 500%", "Loudness normalizer"],
    img: "/assets/feat-speed.png",
    alt: "Speed and volume controls",
    flip: true,
  },
  {
    title: ["Picture-in-", "picture"],
    body: "Pop the video into a floating window and keep watching while you work in another tab — one click, or one keypress.",
    points: ["One-click floating player", "Keyboard toggle", "Works across tabs"],
    img: "/assets/feat-skip.png",
    alt: "Picture in picture and auto-skip controls",
    flip: false,
  },
];
