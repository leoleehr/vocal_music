/* ===== YouTube 歌曲播放：先顯示縮圖，點擊後在大視窗播放 =====
 * <div class="yt" data-song="太陽"></div>          歌曲卡片
 * <span class="yt chip" data-song="太陽"></span>    行內播放按鈕
 * window.PixelYT.card(name) / chip(name)           以程式建立
 */
(function () {
  'use strict';
  var SONGS = window.PIXEL_SONGS || {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function watch(id) { return 'https://www.youtube.com/watch?v=' + id; }

  var modal = null;
  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'yt-modal';
    modal.setAttribute('role', 'dialog');
    modal.innerHTML = '<div class="yt-modal-box"><div class="yt-modal-head"><b></b><a target="_blank" rel="noopener">在 YouTube 開啟 ↗</a><button type="button" aria-label="關閉">✕</button></div><div class="yt-frame"></div></div>';
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    modal.querySelector('button').onclick = close;
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('on')) { e.stopPropagation(); close(); } }, true);
    document.body.appendChild(modal);
    return modal;
  }
  function open(name) {
    var s = SONGS[name]; if (!s) return;
    var m = ensureModal();
    m.querySelector('b').textContent = s.artist + '《' + name + '》';
    m.querySelector('a').href = watch(s.id);
    m.querySelector('.yt-frame').innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + s.id + '?autoplay=1&rel=0&modestbranding=1" title="' + esc(s.artist + ' ' + name) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    m.classList.add('on');
    document.documentElement.classList.add('yt-open');
  }
  function close() {
    if (!modal) return;
    modal.classList.remove('on');
    modal.querySelector('.yt-frame').innerHTML = '';
    document.documentElement.classList.remove('yt-open');
  }
  function card(name) {
    var s = SONGS[name]; var el = document.createElement('button');
    el.type = 'button'; el.className = 'yt-card';
    if (!s) { el.disabled = true; el.textContent = name; return el; }
    el.innerHTML = '<span class="yt-thumb" style="background-image:url(https://i.ytimg.com/vi/' + s.id + '/hqdefault.jpg)"><i aria-hidden="true">▶</i></span>' +
      '<span class="yt-meta"><b>' + esc(name) + '</b><span>' + esc(s.artist) + '・' + esc(s.kind) + '</span></span>';
    el.setAttribute('aria-label', '播放 ' + s.artist + '《' + name + '》');
    el.onclick = function () { open(name); };
    return el;
  }
  function chip(name) {
    var s = SONGS[name]; var el = document.createElement('button');
    el.type = 'button'; el.className = 'yt-chip';
    el.innerHTML = '<i aria-hidden="true">▶</i>' + esc(name);
    el.setAttribute('aria-label', '播放 ' + (s ? s.artist : '') + '《' + name + '》');
    el.onclick = function (e) { e.stopPropagation(); open(name); };
    return el;
  }
  function mount(root) {
    (root || document).querySelectorAll('.yt[data-song]').forEach(function (el) {
      var name = el.getAttribute('data-song');
      el.appendChild(el.classList.contains('chip') ? chip(name) : card(name));
      el.removeAttribute('data-song');
    });
  }
  window.PixelYT = { open: open, close: close, card: card, chip: chip, mount: mount, songs: SONGS };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); }); else mount();
})();
