const DEFAULTS = {
  skipIntro: true,
  skipRecap: true,
  nextEpisode: true,
  stillWatching: true,
  show5sButtons: true,
  showSpeedButton: true,
  showPipButton: true,
  count: 0,
};

async function refreshBadge() {
  const { count = 0 } = await chrome.storage.sync.get({ count: 0 });
  const text = count === 0 ? "" : count > 999 ? "1k+" : String(count);
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color: "#e50914" });
  await chrome.action.setBadgeTextColor({ color: "#ffffff" });
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(DEFAULTS);
  await chrome.storage.sync.set({ ...DEFAULTS, ...stored });
  refreshBadge();
});

chrome.runtime.onStartup.addListener(refreshBadge);

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "skipped") {
    chrome.storage.sync.get({ count: 0 }).then(({ count }) => {
      chrome.storage.sync.set({ count: count + 1 }).then(refreshBadge);
    });
  } else if (msg?.type === "resetCount") {
    chrome.storage.sync.set({ count: 0 }).then(refreshBadge);
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.count) refreshBadge();
});
