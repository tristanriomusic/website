/* ═══ PERSISTENT MINI BANDCAMP PLAYER ═══
   Shows a slim bar with just the Bandcamp small player (song name + controls).
   Triggered by the Gods Told Me To Relax zone click.
*/
(function() {
  const ALBUM_ID  = '2211761745';
  const KEY       = 'miniplayerActive';

  const css = `
    #mini-player {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      z-index: 1000;
      display: none;
      align-items: center;
      background: rgba(0,0,0,0.82);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 3px;
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 30px rgba(0,200,255,0.07);
      overflow: hidden;
      backdrop-filter: blur(10px);
      width: 400px;
      height: 42px;
    }
    #mini-player.visible { display: flex; }
    #mini-player iframe {
      flex: 1;
      width: 360px;
      height: 42px;
      border: 0;
      display: block;
    }
    #mini-player-close {
      color: rgba(255,255,255,0.3);
      font-size: 13px; cursor: pointer; line-height: 1;
      transition: color 0.2s;
      background: none; border: none;
      padding: 0 10px;
      flex-shrink: 0;
    }
    #mini-player-close:hover { color: #fff; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const div = document.createElement('div');
  div.id = 'mini-player';
  div.innerHTML = `
    <iframe id="mini-player-frame" src="" allow="autoplay"></iframe>
    <button id="mini-player-close" title="Close">&#x2715;</button>
  `;
  document.body.appendChild(div);

  const frame = document.getElementById('mini-player-frame');
  const closeBtn = document.getElementById('mini-player-close');

  function buildSrc(autoplay) {
    return `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=small/bgcol=000000/linkcol=aaffee/transparent=true/${autoplay ? 'autoplay=1/' : ''}`;
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

  window.miniPlayerShow = function() { showPlayer(true); };
  window.miniPlayerVisible = function() { return div.classList.contains('visible'); };
})();
