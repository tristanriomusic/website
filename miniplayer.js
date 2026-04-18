/* ═══ PERSISTENT MINI BANDCAMP PLAYER ═══
   Slim top-left bar (size=small). Shown after closing the full modal player.
*/
(function() {
  const ALBUM_ID = '2211761745';

  const css = `
    #mini-player {
      position: fixed; top: 16px; left: 16px; z-index: 1000;
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
      height: 42px;
      border: 0;
      display: block;
      min-width: 0;
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

  const frame   = div.querySelector('#mini-player-frame');
  const closeBtn = div.querySelector('#mini-player-close');

  function showPlayer() {
    frame.src = `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=small/bgcol=000000/linkcol=aaffee/transparent=true/autoplay=1/`;
    div.classList.add('visible');
  }

  function hidePlayer() {
    div.classList.remove('visible');
    frame.src = '';
  }

  closeBtn.addEventListener('click', hidePlayer);

  window.miniPlayerShow    = showPlayer;
  window.miniPlayerHide    = hidePlayer;
  window.miniPlayerVisible = () => div.classList.contains('visible');
})();
