/* ═══ PERSISTENT MINI BANDCAMP PLAYER ═══
   Activates when user first plays the album.
   Persists across page navigation via sessionStorage.
   Insert <script src="/miniplayer.js"></script> on every page.
*/
(function() {
  const ALBUM_ID  = '2211761745';
  const TRACK_ID  = '882901728'; // Dream — track 1
  const KEY       = 'miniplayerActive';

  const css = `
    #mini-player {
      position: fixed; top: 16px; left: 16px; z-index: 1000;
      display: none;
      flex-direction: column;
      background: rgba(0,0,0,0.75);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 4px;
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 40px rgba(0,200,255,0.08);
      overflow: hidden;
      backdrop-filter: blur(8px);
      width: 300px;
    }
    #mini-player.visible { display: flex; }
    #mini-player iframe {
      width: 300px;
      height: 42px;
      border: 0;
      display: block;
    }
    #mini-player-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 4px 10px;
      background: rgba(255,255,255,0.04);
    }
    #mini-player-label {
      color: rgba(255,255,255,0.45);
      font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
      font-family: Georgia, serif;
    }
    #mini-player-close {
      color: rgba(255,255,255,0.3);
      font-size: 14px; cursor: pointer; line-height: 1;
      transition: color 0.2s;
      background: none; border: none; padding: 0 2px;
    }
    #mini-player-close:hover { color: #fff; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const div = document.createElement('div');
  div.id = 'mini-player';
  div.innerHTML = `
    <div id="mini-player-bar">
      <span id="mini-player-label">Now Playing</span>
      <button id="mini-player-close" title="Close">&#x2715;</button>
    </div>
    <iframe id="mini-player-frame" src="" allow="autoplay"></iframe>
  `;
  document.body.appendChild(div);

  const frame = document.getElementById('mini-player-frame');
  const closeBtn = document.getElementById('mini-player-close');

  function buildSrc(autoplay) {
    return `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=small/bgcol=000000/linkcol=aaffee/track=${TRACK_ID}/transparent=true/${autoplay ? 'autoplay=1/' : ''}`;
  }

  function showPlayer(autoplay) {
    frame.src = buildSrc(autoplay);
    div.classList.add('visible');
    sessionStorage.setItem(KEY, '1');
  }

  function hidePlayer() {
    div.classList.remove('visible');
    frame.src = '';
    sessionStorage.removeItem(KEY);
  }

  closeBtn.addEventListener('click', hidePlayer);

  // Expose globally so space/index.html can call it when user clicks the album zone
  window.miniPlayerShow = function() { showPlayer(true); };
  window.miniPlayerVisible = function() { return div.classList.contains('visible'); };

  // Auto-restore on page load if was playing
  if (sessionStorage.getItem(KEY)) {
    // Small delay so page renders first
    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() { showPlayer(false); }, 400);
    });
  }
})();
