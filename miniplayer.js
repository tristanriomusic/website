/* ═══ PERSISTENT MINI BANDCAMP PLAYER ═══
   One iframe. Mini mode = top-left slim bar.
   Expanded mode = full-screen overlay.
   Audio never stops between states since the src never changes.
*/
(function() {
  const ALBUM_ID = '2211761745';

  const css = `
    #mini-player-backdrop {
      display: none;
      position: fixed; inset: 0; z-index: 498;
      background: rgba(0,0,0,0.65);
    }
    #mini-player-backdrop.on { display: block; }

    #mini-player {
      position: fixed; top: 16px; left: 16px; z-index: 499;
      display: none;
      background: rgba(0,0,0,0.88);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 3px;
      overflow: hidden;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 30px rgba(0,200,255,0.06);
      /* mini dimensions */
      width: 300px;
      height: 42px;
    }
    #mini-player.on { display: block; }

    /* The iframe is taller than the container in mini mode;
       we anchor it to the bottom so only the controls row shows. */
    #mini-player iframe {
      position: absolute;
      bottom: 0; left: 0;
      width: 300px;
      height: 388px;
      border: 0;
      display: block;
    }

    /* Close button — hidden in mini mode */
    #mini-player-close {
      display: none;
      position: absolute; top: 8px; right: 10px; z-index: 2;
      color: rgba(255,255,255,0.45); font-size: 16px; line-height: 1;
      background: none; border: none; padding: 2px 4px;
      cursor: pointer; transition: color 0.2s;
    }
    #mini-player-close:hover { color: #fff; }

    /* Expanded state */
    #mini-player.expanded {
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: min(85vw, 720px);
      height: min(75vh, 430px);
      border-radius: 4px;
      z-index: 500;
    }
    #mini-player.expanded iframe {
      position: static;
      width: 100%;
      height: 100%;
    }
    #mini-player.expanded #mini-player-close { display: block; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const backdrop = document.createElement('div');
  backdrop.id = 'mini-player-backdrop';
  document.body.appendChild(backdrop);

  const div = document.createElement('div');
  div.id = 'mini-player';
  div.innerHTML = `
    <iframe id="mini-player-frame" src="" allow="autoplay"></iframe>
    <button id="mini-player-close" title="Close">&#x2715;</button>
  `;
  document.body.appendChild(div);

  const frame  = div.querySelector('#mini-player-frame');
  const closeBtn = div.querySelector('#mini-player-close');

  function buildSrc() {
    return `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=large/bgcol=000000/linkcol=aaffee/transparent=true/autoplay=1/`;
  }

  function ensureLoaded() {
    if (!frame.src || frame.src === window.location.href) {
      frame.src = buildSrc();
    }
  }

  function showMini() {
    ensureLoaded();
    div.classList.add('on');
    div.classList.remove('expanded');
    backdrop.classList.remove('on');
  }

  function expand() {
    ensureLoaded();
    div.classList.add('on', 'expanded');
    backdrop.classList.add('on');
  }

  function collapse() {
    div.classList.remove('expanded');
    backdrop.classList.remove('on');
    // audio continues — mini bar stays visible
  }

  function hide() {
    div.classList.remove('on', 'expanded');
    backdrop.classList.remove('on');
    frame.src = '';
  }

  closeBtn.addEventListener('click', collapse);
  backdrop.addEventListener('click', collapse);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && div.classList.contains('expanded')) collapse();
  });

  window.miniPlayerShow     = showMini;
  window.miniPlayerExpand   = expand;
  window.miniPlayerCollapse = collapse;
  window.miniPlayerHide     = hide;
  window.miniPlayerVisible  = () => div.classList.contains('on');
  window.miniPlayerExpanded = () => div.classList.contains('expanded');
})();
