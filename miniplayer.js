/* ═══ PERSISTENT MINI BANDCAMP PLAYER ═══
   Mini bar: size=small (42px, track name + play/pause/skip built-in).
   Lives in top-left corner. Shown after the full modal player is dismissed.
*/
(function() {
  const ALBUM_ID = '2211761745';

  const css = `
    #bc-player {
      display: none;
      position: fixed; top: 16px; left: 16px; z-index: 1000;
      align-items: center;
      background: rgba(0,0,0,0.82);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 3px;
      box-shadow: 0 0 24px rgba(0,0,0,0.8), 0 0 30px rgba(0,200,255,0.07);
      overflow: hidden;
      backdrop-filter: blur(10px);
    }
    #bc-player.on { display: flex; }
    #bc-frame {
      width: 350px;
      height: 42px;
      border: 0;
      display: block;
      flex-shrink: 0;
    }
    #bc-close {
      color: rgba(255,255,255,0.3);
      font-size: 13px; cursor: pointer; line-height: 1;
      transition: color 0.2s;
      background: none; border: none;
      padding: 0 10px;
      flex-shrink: 0;
    }
    #bc-close:hover { color: #fff; }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const player = document.createElement('div');
  player.id = 'bc-player';
  player.innerHTML = `
    <iframe id="bc-frame" src="" allow="autoplay"></iframe>
    <button id="bc-close" title="Close">&#x2715;</button>
  `;
  document.body.appendChild(player);

  const frame   = player.querySelector('#bc-frame');
  const closeBtn = player.querySelector('#bc-close');

  function show() {
    if (!frame.src || frame.src === window.location.href) {
      frame.src = `https://bandcamp.com/EmbeddedPlayer/album=${ALBUM_ID}/size=small/bgcol=000000/linkcol=aaffee/transparent=true/autoplay=1/`;
    }
    player.classList.add('on');
  }

  function hide() {
    player.classList.remove('on');
    frame.src = '';
  }

  closeBtn.addEventListener('click', hide);

  window.miniPlayerShow    = show;
  window.miniPlayerHide    = hide;
  window.miniPlayerVisible = () => player.classList.contains('on');
})();
