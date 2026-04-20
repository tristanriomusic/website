# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev Server

```bash
/usr/bin/python3 -m http.server 3000 --directory /Users/tristanrio/VibeCode/website
```

Preview server name (for `preview_start`): `Static Site (npx serve)` — config in `.claude/launch.json`

No Node.js / npm available — use Python for serving only.

## Architecture

Three standalone HTML pages, no build system, no framework:

- `index.html` — Landing page. 80s arcade warp starfield (Canvas 2D), breathing logo, single "Enter Space" nav button. XY granular synth (disabled, code preserved).
- `space/index.html` — Universe map. Full-canvas render loop: album cover background (CSS), rotated/inverted hand-drawn artwork overlay, 12 animated nebula orbs (each is a clickable universe), warp starfield. Edit mode: press `E` to drag zone positions.
- `dreams/index.html` — Journal synth. Textarea where each keystroke plays an E Lydian note. Playback engine replays text at 65 BPM with drum accompaniment.
- `miniplayer.js` — Persistent Bandcamp mini-player injected on all pages via `<script src>`. Uses `sessionStorage` to survive navigation. Activated by clicking the "Gods Told Me To Relax" orb in space.

## Key Patterns

**Space page zone system**: Each zone in `ZONES[]` has `{nx, ny, nrx, nry}` — normalized coords (0-1) relative to the displayed image rect. `nx/ny` = center, `nrx/nry` = click radius. Edit mode (press E) lets you drag handles to reposition; read back live coords with `JSON.stringify(ZONES.map(...))` in browser console.

**Image rendering pipeline** (space page): `clearRect` → draw artwork with `contrast(6)` filter → `difference` blend over image rect only → nebula orbs (`screen` blend) → warp stars (`screen`) → scanlines → vignette.

**Audio**: Web Audio API granular synth chain: masterEQ → masterGain → DynamicsCompressor → WaveShaper → destination. Hall reverb via convolver IR. Analog delay with tanh saturation feedback loop.

**No navigation framework**: pages link directly with `window.location.href`. Warp transition on main page ramps `warpAccel` up to 40× before navigating.

## Deployment

Pushed to `https://github.com/tristanriomusic/website` (main branch).
