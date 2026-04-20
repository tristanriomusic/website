/* ═══ PERSISTENT BANDCAMP PLAYER ═══
   Single iframe — src never changes, audio never restarts.
   Mini mode clips the large embed to show just the control bar.
   Expanded mode reveals the full player.
*/
(function() {
  const ALBUM_ID = '2211761745';

  const css = `
    #bc-wrap {
      display: none;
      position: fixed;
      z-index: 1000;
      overflow: hidden;
      background: #000;
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 3px;
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 30px rgba(0,200,255,0.07);
      backdrop-filter: blur(10px);
      /* ── mini: top-left, 42px tall — shows bottom of iframe (controls) ── */
      top: 16px; left: 16px;
      width: 350px; height: 42px;
    }
    #bc-wrap.on { display: block; }

    #bc-frame {
      position: absolute;
      left: 0;
      width: 350px;
      height: 388px;
      border: 0;
      /* anchor controls at bottom of clip window */
      bottom: 0;
    }

    #bc-close {
      display: none;
      position: absolute; top: 8px; right: 8px; z-index: 2;
      color: rgba(255,255,255,0.5); font-size: 15px;
      background: none; border: none; cursor: none; padding: 2px 5px;
      transition: color 0.2s;
    }
    #bc-close:hover { color: #fff; }

    /* ── expanded ── */
    #bc-wrap.expanded {
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(85vw, 700px);
      height: 388px;
      border-radius: 4px;
    }
    #bc-wrap.expanded #bc-frame {
      width: 100%;
      height: 100%;
      bottom: auto; top: 0;
    }
    #bc-wrap.expanded #bc-close { display: block; }

    #bc-backdrop {
      display: none;
      position: fixed; inset: 0; z-index: 999;
      background: rgba(0,0,0,0.6);
    }
    #bc-backdrop.on { display: block; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.id = 'bc-backdrop';
  document.body.appendChild(backdrop);

  const wrap = document.createElement('div');
  wrap.id = 'bc-wrap';
  wrap.innerHTML = `
    <iframe id="bc-frame" src="" allow="autoplay"></iframe>
    <button id="bc-close">&#x2715;</button>
  `;
  document.body.appendChild(wrap);

  const frame    = wrap.querySelector('#bc-frame');
  const closeBtn = wrap.querySelector('#bc-close');

  function load() {
    if (!frame.src || frame.src === window.location.href) {
      frame.src = `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=large/bgcol=000000/linkcol=aaffee/artwork=small/transparent=true/autoplay=1/`;
    }
  }

  function expand() {
    load();
    wrap.classList.add('on', 'expanded');
    backdrop.classList.add('on');
  }

  function minimize() {
    // CSS only — iframe untouched, same song keeps playing
    wrap.classList.remove('expanded');
    backdrop.classList.remove('on');
  }

  function hide() {
    wrap.classList.remove('on', 'expanded');
    backdrop.classList.remove('on');
  }

  closeBtn.addEventListener('click', minimize);
  backdrop.addEventListener('click', minimize);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && wrap.classList.contains('expanded')) minimize();
  });

  window.miniPlayerExpand   = expand;
  window.miniPlayerMinimize = minimize;
  window.miniPlayerHide     = hide;
  window.miniPlayerShow     = expand;  // legacy alias
  window.miniPlayerVisible  = () => wrap.classList.contains('on');
  window.miniPlayerExpanded = () => wrap.classList.contains('expanded');
})();
