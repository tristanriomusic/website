/* ═══ PERSISTENT BANDCAMP PLAYER ═══
   One iframe, never removed from DOM — audio never stops.
   CSS-only toggle between mini bar (top-left) and expanded modal.
*/
(function() {
  const ALBUM_ID = '2211761745';

  const css = `
    #bc-backdrop {
      display: none;
      position: fixed; inset: 0; z-index: 498;
      background: rgba(0,0,0,0.65);
    }
    #bc-backdrop.on { display: block; }

    /* Wrapper — clips the iframe */
    #bc-player {
      display: none;
      position: fixed;
      overflow: hidden;
      background: #000;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 3px;
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 30px rgba(0,200,255,0.07);
      backdrop-filter: blur(10px);
      z-index: 499;
      /* mini defaults */
      top: 16px; left: 16px;
      width: 350px; height: 42px;
    }
    #bc-player.on { display: block; }

    /* iframe always same size inside wrapper; bottom-anchored so
       the controls row is visible when wrapper is 42px tall */
    #bc-player iframe {
      position: absolute;
      bottom: 0; left: 0;
      width: 350px;
      height: 388px;
      border: 0;
    }

    /* X button — only shown when expanded */
    #bc-close {
      display: none;
      position: absolute; top: 8px; right: 10px; z-index: 2;
      color: rgba(255,255,255,0.5); font-size: 16px;
      background: none; border: none; cursor: pointer;
      transition: color 0.2s;
    }
    #bc-close:hover { color: #fff; }

    /* ── Expanded ── */
    #bc-player.expanded {
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(85vw, 720px);
      height: min(75vh, 460px);
      border-radius: 4px;
      z-index: 500;
    }
    #bc-player.expanded iframe {
      position: absolute;
      top: 0; left: 0; bottom: auto;
      width: 100%; height: 100%;
    }
    #bc-player.expanded #bc-close { display: block; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.id = 'bc-backdrop';
  document.body.appendChild(backdrop);

  const player = document.createElement('div');
  player.id = 'bc-player';
  player.innerHTML = `
    <iframe id="bc-frame" src="" allow="autoplay"></iframe>
    <button id="bc-close" title="Close">&#x2715;</button>
  `;
  document.body.appendChild(player);

  const frame   = player.querySelector('#bc-frame');
  const closeBtn = player.querySelector('#bc-close');

  function ensureLoaded() {
    if (!frame.src || frame.src === window.location.href) {
      frame.src = `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=large/bgcol=000000/linkcol=aaffee/artwork=small/transparent=true/autoplay=1/`;
    }
  }

  function expand() {
    ensureLoaded();
    player.classList.add('on', 'expanded');
    backdrop.classList.add('on');
  }

  function minimize() {
    // just remove expanded — iframe stays alive, audio continues
    player.classList.remove('expanded');
    backdrop.classList.remove('on');
    player.classList.add('on');
  }

  function hide() {
    player.classList.remove('on', 'expanded');
    backdrop.classList.remove('on');
  }

  closeBtn.addEventListener('click', minimize);
  backdrop.addEventListener('click', minimize);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && player.classList.contains('expanded')) minimize();
  });

  window.bcExpand   = expand;
  window.bcMinimize = minimize;
  window.bcHide     = hide;
  window.bcVisible  = () => player.classList.contains('on');
  window.bcExpanded = () => player.classList.contains('expanded');

  // Legacy aliases
  window.miniPlayerShow = expand;
  window.miniPlayerVisible = window.bcVisible;
})();
