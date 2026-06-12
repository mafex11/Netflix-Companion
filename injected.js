// Netflix Companion — MAIN-world injected script.
// Runs in the page's own JS context (not the content-script isolated world), so it can
// reach window.netflix. The content script can't touch video.currentTime directly —
// doing so desyncs Netflix's Cadmium player and tears down the <video> element. Instead
// we seek through Netflix's official player API, which keeps the player state in sync.
//
// Communication: the content script posts window.postMessage({ source: "nf-companion",
// type: "seek", delta }) and we perform the seek here.

(function () {
  function getNetflixPlayer() {
    try {
      const videoPlayer =
        window.netflix &&
        window.netflix.appContext &&
        window.netflix.appContext.state.playerApp.getAPI().videoPlayer;
      if (!videoPlayer) return null;
      const ids = videoPlayer.getAllPlayerSessionIds() || [];
      // Prefer the "watch" session id; fall back to the first available.
      const id = ids.find((s) => s.startsWith("watch")) || ids[0];
      if (!id) return null;
      return videoPlayer.getVideoPlayerBySessionId(id);
    } catch (e) {
      console.log("[netflix-companion/main] could not get player", e);
      return null;
    }
  }

  function seekBy(deltaSeconds) {
    const player = getNetflixPlayer();
    if (!player) {
      console.log("[netflix-companion/main] seek failed: no player");
      return;
    }
    const current = player.getCurrentTime(); // milliseconds
    // NOTE: observed behavior on Netflix's player is inverted relative to a naive
    // current + delta — a negative delta seeks forward and vice-versa. Negate so the
    // rewind (left) button goes back and the forward (right) button goes forward.
    const target = Math.max(0, current - deltaSeconds * 1000);
    player.seek(target);
  }

  // Assumed frame rate. Netflix has no public frame API, so frame-step seeks by one
  // frame's worth of time. Most Netflix content is 24fps; this is approximate and may
  // not land on an exact encoded frame boundary.
  const FPS = 24;

  function frameStepBy(dir) {
    const player = getNetflixPlayer();
    if (!player) {
      console.log("[netflix-companion/main] frameStep failed: no player");
      return;
    }
    if (typeof player.pause === "function") player.pause();
    const current = player.getCurrentTime(); // milliseconds
    // Use the same inverted convention as seekBy so direction matches the seek buttons.
    const target = Math.max(0, current - dir * (1000 / FPS));
    player.seek(target);
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== "nf-companion") return;
    if (data.type === "seek") seekBy(data.delta);
    else if (data.type === "frameStep") frameStepBy(data.dir);
  });
})();
