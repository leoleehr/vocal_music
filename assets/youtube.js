/* ===== YouTube 歌曲播放：直接在頁面中播放，附播放、暫停、停止與進度 =====
 * <div class="yt" data-song="太陽"></div>          歌曲卡片：影片在卡片內播放
 * <span class="yt chip" data-song="太陽"></span>    行內按鈕：在右下角的小播放器播放
 * 使用 YouTube IFrame Player API；播放器維持可見（YouTube 規範至少 200×200）。
 */
(function () {
  'use strict';
  var SONGS = window.PIXEL_SONGS || {};
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
  var ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };

  /* ---------- 載入 IFrame API ---------- */
  var apiP = null;
  function api() {
    if (apiP) return apiP;
    apiP = new Promise(function (res) {
      if (window.YT && window.YT.Player) return res(window.YT);
      var prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function () { if (prev) prev(); res(window.YT); };
      var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    });
    return apiP;
  }

  /* ---------- 播放器控制器 ---------- */
  var all = [];
  function Ctl(root, name, opts) {
    var s = SONGS[name], self = this;
    this.root = root; this.name = name; this.song = s; this.player = null; this.state = -1; this.tick = 0; this.opts = opts || {};
    root.classList.add('ytp');
    root.innerHTML =
      '<div class="ytp-screen" style="background-image:url(https://i.ytimg.com/vi/' + s.id + '/hqdefault.jpg)"><button type="button" class="ytp-big" aria-label="播放">' + ICON.play + '</button><div class="ytp-slot"></div></div>' +
      '<div class="ytp-prog" role="slider" aria-label="播放進度" tabindex="0"><i></i></div>' +
      '<div class="ytp-bar">' +
        '<button type="button" class="ytp-btn ytp-toggle" aria-label="播放">' + ICON.play + '</button>' +
        '<button type="button" class="ytp-btn ytp-stop" aria-label="停止">' + ICON.stop + '</button>' +
        '<div class="ytp-meta"><b>' + esc(name) + '</b><span>' + esc(s.artist) + '・' + esc(s.kind) + '</span></div>' +
        '<span class="ytp-time">0:00</span>' +
        '<a class="ytp-btn ytp-ext" href="https://www.youtube.com/watch?v=' + s.id + '" target="_blank" rel="noopener" aria-label="在 YouTube 開啟">' + ICON.ext + '</a>' +
        (this.opts.closable ? '<button type="button" class="ytp-btn ytp-close" aria-label="關閉">' + ICON.close + '</button>' : '') +
      '</div>';
    this.$ = function (q) { return root.querySelector(q); };
    this.$('.ytp-big').onclick = function () { self.play(); };
    this.$('.ytp-toggle').onclick = function () { self.state === 1 || self.state === 3 ? self.pause() : self.play(); };
    this.$('.ytp-stop').onclick = function () { self.stop(); };
    var prog = this.$('.ytp-prog');
    prog.onclick = function (e) { if (!self.player || !self.player.getDuration) return; var r = prog.getBoundingClientRect(); self.player.seekTo((e.clientX - r.left) / r.width * self.player.getDuration(), true); };
    prog.onkeydown = function (e) { if (!self.player) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); self.player.seekTo(self.player.getCurrentTime() + (e.key === 'ArrowRight' ? 5 : -5), true); } };
    if (this.opts.closable) this.$('.ytp-close').onclick = function () { self.destroy(); if (self.opts.onClose) self.opts.onClose(); };
    all.push(this);
  }
  Ctl.prototype.ensure = function () {
    var self = this;
    if (this.ready) return this.ready;
    this.root.classList.add('loading');
    this.ready = api().then(function (YT) {
      return new Promise(function (res) {
        var slot = self.$('.ytp-slot'), div = document.createElement('div'); slot.appendChild(div);
        self.player = new YT.Player(div, {
          videoId: self.song.id, host: 'https://www.youtube-nocookie.com',
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1, controls: 0, disablekb: 1, iv_load_policy: 3, origin: location.origin },
          events: {
            onReady: function () { self.root.classList.remove('loading'); self.root.classList.add('loaded'); res(self.player); },
            onStateChange: function (e) { self.onState(e.data); },
            onError: function () { self.root.classList.add('error'); self.$('.ytp-time').textContent = '無法播放，請改用 YouTube 開啟'; }
          }
        });
      });
    });
    return this.ready;
  };
  Ctl.prototype.play = function () {
    all.forEach(function (c) { if (c !== this && (c.state === 1 || c.state === 3)) c.pause(); }, this);
    return this.ensure().then(function (p) { p.playVideo(); });
  };
  Ctl.prototype.pause = function () { if (this.player && this.player.pauseVideo) this.player.pauseVideo(); };
  Ctl.prototype.stop = function () { if (this.player && this.player.stopVideo) { this.player.seekTo(0, true); this.player.stopVideo(); this.onState(5); } };
  Ctl.prototype.onState = function (st) {
    var self = this; this.state = st;
    var playing = st === 1 || st === 3;
    this.root.classList.toggle('playing', playing);
    this.root.classList.toggle('started', st === 1 || st === 2 || st === 3);
    var t = this.$('.ytp-toggle'); t.innerHTML = playing ? ICON.pause : ICON.play; t.setAttribute('aria-label', playing ? '暫停' : '播放');
    clearInterval(this.tick);
    if (playing) this.tick = setInterval(function () { self.draw(); }, 250);
    this.draw();
  };
  Ctl.prototype.draw = function () {
    var p = this.player; if (!p || !p.getDuration) return;
    var d = p.getDuration() || 0, c = this.state === 5 ? 0 : (p.getCurrentTime() || 0);
    this.$('.ytp-prog i').style.width = (d ? c / d * 100 : 0) + '%';
    this.$('.ytp-time').textContent = fmt(c) + ' / ' + fmt(d);
  };
  Ctl.prototype.destroy = function () {
    clearInterval(this.tick);
    if (this.player && this.player.destroy) this.player.destroy();
    var i = all.indexOf(this); if (i > -1) all.splice(i, 1);
    this.root.remove();
  };

  /* ---------- 卡片（在原位置播放） ---------- */
  function card(name) {
    var el = document.createElement('div');
    if (!SONGS[name]) { el.textContent = name; return el; }
    new Ctl(el, name);
    return el;
  }

  /* ---------- 行內按鈕（右下角小播放器） ---------- */
  var dock = null;
  function openDock(name) {
    if (dock && dock.name === name) { dock.play(); return; }
    if (dock) dock.destroy();
    var el = document.createElement('div'); el.className = 'yt-dock';
    document.body.appendChild(el);
    dock = new Ctl(el, name, { closable: true, onClose: function () { dock = null; } });
    dock.play();
  }
  function chip(name) {
    var s = SONGS[name], el = document.createElement('button');
    el.type = 'button'; el.className = 'yt-chip';
    el.innerHTML = '<i aria-hidden="true">▶</i>' + esc(name);
    el.setAttribute('aria-label', '播放 ' + (s ? s.artist : '') + '《' + name + '》');
    el.onclick = function (e) { e.stopPropagation(); if (s) openDock(name); };
    return el;
  }

  function mount(root) {
    (root || document).querySelectorAll('.yt[data-song]').forEach(function (el) {
      var name = el.getAttribute('data-song');
      el.appendChild(el.classList.contains('chip') ? chip(name) : card(name));
      el.removeAttribute('data-song');
    });
  }
  // 投影片換頁時，暫停已離開畫面的卡片影片（右下角小播放器繼續播放）
  document.addEventListener('slide:change', function (e) {
    if (e.detail && e.detail.mobile) return;
    all.forEach(function (c) { var sl = c.root.closest('.slide'); if (sl && !sl.classList.contains('active')) c.pause(); });
  });
  // 找出某個元素裡的影片卡，讓其他元件讀取播放時間（例：唱名提示同步）
  function find(el) { for (var k = 0; k < all.length; k++) if (el === all[k].root || (el.contains && el.contains(all[k].root))) return all[k]; return null; }
  window.PixelYT = { card: card, chip: chip, mount: mount, open: openDock, songs: SONGS, find: find };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); }); else mount();
})();
