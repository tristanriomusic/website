/* ═══ DREAM PLAYER ═══
   Lives in the persistent outer shell (index.html).
   AudioContext never dies on page navigation — zero gaps, zero glitches.

   Darkness mode (called from space page when Darkness zone is hovered):
   • Slows playback to 70 % speed with pitch-shift (tape-drag effect).
   • Runs a randomised glitch engine: pitch lurches, dropout stutters,
     wow-flutter wobbles, and rapid stutter-repeats.
   • Everything fades cleanly in/out using AudioParam automation.
*/
(function () {
  const SRC         = 'dream.mp3';
  const VOLUME      = 0.65;
  const DARK_RATE   = 0.70;        // tape-drag target speed
  const STORAGE_KEY = 'dreamPlayerState';

  /* ── Persistence ── */
  function loadState() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveState(obj) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch {}
  }

  const saved    = loadState();
  let userPaused = saved.userPaused === true;
  let startPos   = 0;
  if (saved.time > 0) {
    startPos = (saved.ts && !userPaused)
      ? saved.time + (Date.now() - saved.ts) / 1000
      : saved.time;
    if (startPos > 600) startPos = 0;
  }

  /* ── Web Audio chain ──────────────────────────────────────────────
     source ──► glitchGain ──► gainNode ──► destination
     glitchGain handles darkness dropout stutters independently of the
     master gainNode (which handles navigation fades).               */
  const ctx        = new (window.AudioContext || window.webkitAudioContext)();
  const gainNode   = ctx.createGain();
  const glitchGain = ctx.createGain();
  gainNode.gain.value   = VOLUME;
  glitchGain.gain.value = 1.0;
  glitchGain.connect(gainNode);
  gainNode.connect(ctx.destination);

  /* Silent keep-alive — prevents audio thread from spinning down,
     which would cause a pop when it restarts.                       */
  const _ka = ctx.createOscillator();
  const _kg = ctx.createGain(); _kg.gain.value = 0;
  _ka.connect(_kg); _kg.connect(ctx.destination); _ka.start();

  let audioBuffer  = null;
  let sourceNode   = null;
  let isPlaying    = false;
  let startedAt    = 0;
  let startOffset  = 0;
  let pausedByZone = false;
  let pendingPlay  = false;

  /* ── Darkness state ─────────────────────────────────────────────── */
  let darknessOn  = false;
  let glitchTimer = null;

  function currentPos() {
    if (!isPlaying || !audioBuffer) return startPos;
    return (startOffset + (ctx.currentTime - startedAt)) % audioBuffer.duration;
  }

  function startPlayback(offset) {
    if (!audioBuffer) return;
    _stopSource();
    const src  = ctx.createBufferSource();
    src.buffer = audioBuffer;
    src.loop   = true;
    src.connect(glitchGain);
    const safe = ((offset % audioBuffer.duration) + audioBuffer.duration) % audioBuffer.duration;
    // If already in darkness, start at the slowed rate immediately
    src.playbackRate.value = darknessOn ? DARK_RATE : 1.0;
    src.start(0, safe);
    sourceNode  = src;
    startedAt   = ctx.currentTime;
    startOffset = safe;
    isPlaying   = true;
    updateBtn();
  }

  function _stopSource() {
    if (sourceNode) {
      try { sourceNode.stop(); } catch {}
      sourceNode.disconnect();
      sourceNode = null;
    }
    isPlaying = false;
  }

  function _tryResume() {
    ctx.resume().then(() => {
      if (!isPlaying && !userPaused && !pausedByZone && audioBuffer) {
        pendingPlay = false;
        startPlayback(startPos);
      }
    }).catch(() => {});
  }

  ctx.addEventListener('statechange', () => {
    if (ctx.state === 'running') {
      if ((pendingPlay || !isPlaying) && !userPaused && !pausedByZone && audioBuffer) {
        pendingPlay = false;
        if (!isPlaying) startPlayback(startPos);
      }
    }
  });

  window.addEventListener('pagehide', () => {
    saveState({ time: currentPos(), ts: Date.now(), userPaused });
  });

  /* ── Fetch + decode ── */
  fetch(SRC)
    .then(r => { if (!r.ok) throw r.status; return r.arrayBuffer(); })
    .then(buf => ctx.decodeAudioData(buf))
    .then(decoded => {
      audioBuffer = decoded;
      if (!userPaused) {
        if (ctx.state === 'running') startPlayback(startPos);
        else { pendingPlay = true; updateBtn(); }
      }
    })
    .catch(e => console.warn('[DreamPlayer] load failed:', e));

  function onShellInteraction() {
    _tryResume();
    document.removeEventListener('click',   onShellInteraction);
    document.removeEventListener('keydown', onShellInteraction);
  }
  document.addEventListener('click',   onShellInteraction);
  document.addEventListener('keydown', onShellInteraction);

  /* ── Iframe lifecycle ── */
  const frame = document.getElementById('site-frame');
  if (frame) {
    frame.addEventListener('load', () => {
      try {
        const fw = frame.contentWindow;
        if (fw && !fw.dreamPlayer) fw.dreamPlayer = window.dreamPlayer;
      } catch {}
      _tryResume();
      try {
        frame.contentWindow.addEventListener('pagehide', () => {
          if (!isPlaying || userPaused || pausedByZone) return;
          const now = ctx.currentTime;
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(VOLUME, now);
          gainNode.gain.linearRampToValueAtTime(VOLUME * 0.82, now + 0.03);
          gainNode.gain.setTargetAtTime(VOLUME, now + 0.03, 0.035);
        }, { once: true });
      } catch {}
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     DARKNESS ENGINE
     ═══════════════════════════════════════════════════════════════ */

  function _rampRate(target, tauSec) {
    if (!sourceNode) return;
    const now = ctx.currentTime;
    sourceNode.playbackRate.cancelScheduledValues(now);
    sourceNode.playbackRate.setTargetAtTime(target, now, tauSec);
  }

  /* Individual glitch types ─────────────────────────────────────── */

  function _glitchPitchLurch() {
    if (!sourceNode) return;
    // Pitch suddenly lurches down (0.3–0.5×) or up (1.3–1.8×) then drags back
    const now   = ctx.currentTime;
    const up    = Math.random() < 0.45;
    const lurch = up
      ? DARK_RATE * (1.35 + Math.random() * 0.55)   // above normal
      : DARK_RATE * (0.25 + Math.random() * 0.30);  // below normal
    const holdMs = 18 + Math.random() * 90;
    sourceNode.playbackRate.cancelScheduledValues(now);
    sourceNode.playbackRate.setValueAtTime(DARK_RATE, now);
    sourceNode.playbackRate.linearRampToValueAtTime(lurch, now + 0.012);
    sourceNode.playbackRate.setTargetAtTime(DARK_RATE, now + holdMs / 1000, 0.06);
  }

  function _glitchDropout() {
    // Brief near-silence — digital tape dropout
    const now     = ctx.currentTime;
    const muteDur = 0.012 + Math.random() * 0.055;
    glitchGain.gain.cancelScheduledValues(now);
    glitchGain.gain.setValueAtTime(1, now);
    glitchGain.gain.linearRampToValueAtTime(0.03, now + 0.006);
    glitchGain.gain.linearRampToValueAtTime(1,    now + muteDur);
  }

  function _glitchWowFlutter() {
    if (!sourceNode) return;
    // Slow sinusoidal wow or erratic flutter across ~0.5–1.5 s
    const now    = ctx.currentTime;
    const dur    = 0.5 + Math.random() * 1.0;
    const depth  = 0.04 + Math.random() * 0.07;
    const cycles = 1 + Math.floor(Math.random() * 4);
    const pts    = 80;
    const curve  = new Float32Array(pts);
    for (let i = 0; i < pts; i++) {
      const phase = (i / (pts - 1)) * Math.PI * 2 * cycles;
      // Add a tiny random jitter per sample for "flutter" texture
      curve[i] = DARK_RATE + depth * Math.sin(phase) + (Math.random() - 0.5) * 0.008;
    }
    sourceNode.playbackRate.cancelScheduledValues(now);
    sourceNode.playbackRate.setValueCurveAtTime(curve, now, dur);
    sourceNode.playbackRate.setTargetAtTime(DARK_RATE, now + dur, 0.08);
  }

  function _glitchStutterRepeat() {
    if (!sourceNode) return;
    // Rapid pitch stutter: flickers between DARK_RATE and a weird rate
    const now    = ctx.currentTime;
    const flicks = 3 + Math.floor(Math.random() * 5);
    const alt    = DARK_RATE * (0.55 + Math.random() * 0.9);
    sourceNode.playbackRate.cancelScheduledValues(now);
    for (let i = 0; i < flicks; i++) {
      sourceNode.playbackRate.setValueAtTime(i % 2 === 0 ? alt : DARK_RATE, now + i * 0.032);
    }
    sourceNode.playbackRate.setTargetAtTime(DARK_RATE, now + flicks * 0.032, 0.05);
  }

  function _glitchSpaceReversal() {
    if (!sourceNode) return;
    // Smooth pitch sweep down to near-zero then snap back — like cosmic breathing
    const now = ctx.currentTime;
    const low = DARK_RATE * (0.15 + Math.random() * 0.25);
    sourceNode.playbackRate.cancelScheduledValues(now);
    sourceNode.playbackRate.setValueAtTime(DARK_RATE, now);
    sourceNode.playbackRate.linearRampToValueAtTime(low,       now + 0.18);
    sourceNode.playbackRate.linearRampToValueAtTime(DARK_RATE, now + 0.34);
  }

  /* Glitch scheduler ──────────────────────────────────────────────── */
  const GLITCH_TYPES = [
    { fn: _glitchPitchLurch,     weight: 3 },
    { fn: _glitchDropout,        weight: 3 },
    { fn: _glitchWowFlutter,     weight: 2 },
    { fn: _glitchStutterRepeat,  weight: 2 },
    { fn: _glitchSpaceReversal,  weight: 1 },
  ];
  const TOTAL_WEIGHT = GLITCH_TYPES.reduce((s, g) => s + g.weight, 0);

  function _pickGlitch() {
    let r = Math.random() * TOTAL_WEIGHT;
    for (const g of GLITCH_TYPES) { r -= g.weight; if (r <= 0) return g.fn; }
    return GLITCH_TYPES[0].fn;
  }

  function _scheduleNextGlitch() {
    if (!darknessOn) return;
    const delay = 350 + Math.random() * 1500;   // 0.35 – 1.85 s
    glitchTimer = setTimeout(() => {
      if (darknessOn && isPlaying) _pickGlitch()();
      _scheduleNextGlitch();
    }, delay);
  }

  function activateDarkness() {
    darknessOn = true;
    // Tape drag: slow to 70 % over ~2 s (exponential feel)
    _rampRate(DARK_RATE, 0.75);
    _scheduleNextGlitch();
  }

  function deactivateDarkness() {
    darknessOn = false;
    clearTimeout(glitchTimer);
    glitchTimer = null;
    // Restore rate and gain smoothly
    const now = ctx.currentTime;
    if (sourceNode) {
      sourceNode.playbackRate.cancelScheduledValues(now);
      sourceNode.playbackRate.setTargetAtTime(1.0, now, 0.5);
    }
    glitchGain.gain.cancelScheduledValues(now);
    glitchGain.gain.setTargetAtTime(1.0, now, 0.08);
  }

  /* ── UI ── */
  const style = document.createElement('style');
  style.textContent = `
    #dream-player {
      position: fixed; top: 16px; left: 16px; z-index: 10;
      display: flex; align-items: center; gap: 10px;
      background: rgba(0,0,0,0.72);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 3px; padding: 7px 14px 7px 10px;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 20px rgba(0,200,255,0.05);
      opacity: 1; transition: opacity 0.9s ease; pointer-events: auto;
    }
    #dream-player.faded { opacity: 0; pointer-events: none; }
    #dream-hover-zone {
      position: fixed; top: 0; left: 0;
      width: 240px; height: 76px; z-index: 9; pointer-events: auto;
    }
    #dream-toggle {
      background: none; border: none;
      color: rgba(255,255,255,0.75); font-size: 15px;
      cursor: pointer; padding: 0; line-height: 1; transition: color 0.2s;
    }
    #dream-toggle:hover { color: #fff; }
    #dream-label {
      color: rgba(255,255,255,0.5); font-size: 10px;
      letter-spacing: 0.22em; text-transform: uppercase;
      font-family: Georgia, serif; white-space: nowrap; user-select: none;
    }
  `;
  document.head.appendChild(style);

  const player    = document.createElement('div');
  player.id       = 'dream-player';
  player.innerHTML = `<button id="dream-toggle">▶</button><span id="dream-label">Dream</span>`;
  document.body.appendChild(player);

  const hoverZone = document.createElement('div');
  hoverZone.id    = 'dream-hover-zone';
  document.body.appendChild(hoverZone);

  const toggleBtn = document.getElementById('dream-toggle');

  function updateBtn() {
    if (toggleBtn) toggleBtn.textContent = isPlaying ? '⏸' : '▶';
  }

  toggleBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (isPlaying) {
      startPos = currentPos(); userPaused = true;
      _stopSource(); ctx.suspend();
    } else {
      userPaused = false; pausedByZone = false;
      ctx.resume().then(() => startPlayback(startPos));
    }
    updateBtn();
    resetHideTimer(3000);
  });

  let hideTimer = null;
  function resetHideTimer(ms) {
    clearTimeout(hideTimer); player.classList.remove('faded');
    hideTimer = setTimeout(() => player.classList.add('faded'), ms || 10000);
  }
  function showPlayer() {
    clearTimeout(hideTimer); player.classList.remove('faded');
    hideTimer = setTimeout(() => player.classList.add('faded'), 3000);
  }
  resetHideTimer(10000);
  player.addEventListener('mouseenter',    showPlayer);
  hoverZone.addEventListener('mouseenter', showPlayer);

  /* ── Public API ── */
  window.dreamPlayer = {
    pause() {
      if (!isPlaying) return;
      startPos = currentPos(); pausedByZone = true;
      _stopSource(); ctx.suspend(); updateBtn();
    },
    resume() {
      if (!pausedByZone || userPaused) return;
      pausedByZone = false;
      ctx.resume().then(() => startPlayback(startPos));
    },
    tryUnlock() {
      if (!userPaused && !pausedByZone) _tryResume();
    },
    darknessMode(active) {
      if (active === darknessOn) return;
      if (active) activateDarkness();
      else        deactivateDarkness();
    },
    get paused() { return !isPlaying; },
  };
})();
