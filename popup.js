const KEYS = ["skipIntro", "skipRecap", "nextEpisode", "stillWatching"];
const CONTROL_KEYS = ["show5sButtons", "show90sButtons", "showPipButton"];
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
  count: 0,
};

function applyVisuals(settings) {
  for (const key of [...KEYS, ...CONTROL_KEYS]) {
    const input = document.getElementById(key);
    input.checked = settings[key];
    input.closest(".channel").classList.toggle("on", !!settings[key]);
  }
  document.getElementById("counterValue").textContent = String(settings.count ?? 0);
  const activeCount = KEYS.filter((k) => settings[k]).length;
  const status = document.getElementById("statusText");
  status.textContent = activeCount === 0
    ? "Standby"
    : activeCount === KEYS.length
      ? "All Live"
      : `${activeCount}/${KEYS.length} Live`;
}

async function load() {
  const settings = await chrome.storage.sync.get(DEFAULTS);
  applyVisuals(settings);
}

async function broadcast(settings) {
  const tabs = await chrome.tabs.query({ url: "*://*.netflix.com/*" });
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id, { type: "settings", settings }).catch(() => {});
  }
}

function wire() {
  for (const key of [...KEYS, ...CONTROL_KEYS]) {
    document.getElementById(key).addEventListener("change", async (e) => {
      const settings = await chrome.storage.sync.get(DEFAULTS);
      settings[key] = e.target.checked;
      await chrome.storage.sync.set(settings);
      applyVisuals(settings);
      broadcast(settings);
    });
  }

  document.getElementById("counter").addEventListener("click", async () => {
    await chrome.storage.sync.set({ count: 0 });
    chrome.runtime.sendMessage({ type: "resetCount" }).catch(() => {});
    document.getElementById("counterValue").textContent = "0";
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.count) {
      document.getElementById("counterValue").textContent =
        String(changes.count.newValue ?? 0);
    }
  });
}

load().then(wire);
