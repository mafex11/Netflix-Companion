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

  // ---- Playback speed -------------------------------------------------------
  // Set video.playbackRate directly (safe; only currentTime desyncs the player).
  // Netflix resets the rate on segment/episode changes, so cache the desired value
  // and re-assert it whenever the element fires ratechange.
  let desiredRate = 1;
  let rateGuardedEl = null;

  function applyRate() {
    const video = document.querySelector("video");
    if (!video) return;
    if (Math.abs(video.playbackRate - desiredRate) > 0.001) {
      video.playbackRate = desiredRate;
    }
    // Attach a one-time ratechange guard per element so Netflix's resets get corrected.
    if (rateGuardedEl !== video) {
      rateGuardedEl = video;
      video.addEventListener("ratechange", () => {
        if (Math.abs(video.playbackRate - desiredRate) > 0.001) {
          video.playbackRate = desiredRate;
        }
      });
    }
  }

  function setSpeed(rate) {
    desiredRate = Math.min(4, Math.max(0.1, Number(rate) || 1));
    applyRate();
  }

  // ---- Volume boost + normalizer -------------------------------------------
  // Route the video's audio through GainNode (boost) and a bypassable
  // DynamicsCompressorNode (normalizer). createMediaElementSource can only be called
  // ONCE per element, so cache the graph and rebuild only when the element changes.
  let audioGraph = null; // { element, ctx, source, gain, compressor, compressorActive }
  let desiredBoost = 1;
  let normalizerOn = false;

  function buildGraph(video) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      const ctx = new AC();
      const source = ctx.createMediaElementSource(video);
      const gain = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      // Gentle "normalizer" compression: tame loud peaks, lift the rest.
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      return { element: video, ctx, source, gain, compressor, compressorActive: null };
    } catch (e) {
      console.log("[netflix-companion/main] audio graph init failed", e);
      return null;
    }
  }

  // (Re)connect the graph for the current routing (with/without compressor).
  function wireGraph(g) {
    try {
      g.source.disconnect();
      g.gain.disconnect();
      g.compressor.disconnect();
    } catch (e) {
      // disconnect on a never-connected node is harmless
    }
    if (normalizerOn) {
      g.source.connect(g.gain);
      g.gain.connect(g.compressor);
      g.compressor.connect(g.ctx.destination);
    } else {
      g.source.connect(g.gain);
      g.gain.connect(g.ctx.destination);
    }
    g.compressorActive = normalizerOn;
  }

  function ensureGraph() {
    const video = document.querySelector("video");
    if (!video) return null;
    if (audioGraph && audioGraph.element === video) return audioGraph;
    // New (or first) element: build a fresh graph. The old source is dead once the
    // element is gone; we simply replace our cache.
    const g = buildGraph(video);
    if (!g) return null;
    audioGraph = g;
    wireGraph(g);
    return g;
  }

  function applyAudio() {
    // IMPORTANT: only route audio through Web Audio when the user actually wants boost
    // or normalization. Netflix audio is EME/DRM-protected; routing it through
    // createMediaElementSource can output silence in some Chrome configs, and once an
    // element is routed it can't be un-routed for that element's lifetime. So at the
    // default (boost 1×, normalizer off) we leave the native audio path completely
    // untouched, and never build a graph until the user opts in. This keeps the default
    // experience safe — the feature can only ever affect users who turn it on.
    const wantsAudioGraph = desiredBoost > 1.001 || normalizerOn;
    if (!wantsAudioGraph && !audioGraph) return;

    const g = ensureGraph();
    if (!g) return;
    if (g.ctx.state === "suspended") g.ctx.resume();
    g.gain.gain.value = desiredBoost;
    if (g.compressorActive !== normalizerOn) wireGraph(g);
  }

  function setVolume(boost) {
    desiredBoost = Math.min(5, Math.max(1, Number(boost) || 1));
    applyAudio();
  }

  function setNormalizer(on) {
    normalizerOn = !!on;
    applyAudio();
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== "nf-companion") return;
    if (data.type === "seek") seekBy(data.delta);
    else if (data.type === "frameStep") frameStepBy(data.dir);
    else if (data.type === "setSpeed") setSpeed(data.rate);
    else if (data.type === "setVolume") setVolume(data.boost);
    else if (data.type === "setNormalizer") setNormalizer(data.on);
  });
})();
