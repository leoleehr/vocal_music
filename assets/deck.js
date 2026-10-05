/* ===== Pixel Studio 課堂投影片控制 ===== */
(function () {
  var MOBILE_Q = '(max-width:900px),(orientation:portrait) and (max-width:1100px)';
  var mq = matchMedia(MOBILE_Q);
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var stage = document.getElementById('stage');
  var title = document.body.getAttribute('data-title') || document.title;
  var i = 0;

  // 每張投影片加上品牌標記與錨點
  slides.forEach(function (s, k) {
    s.id = 's' + (k + 1);
    if (s.classList.contains('cover')) return;
    var b = document.createElement('div');
    b.className = 'slide-brand';
    b.innerHTML = '<span>畫素音樂工作坊</span>' + PixelStudio.pixelWord('PIXEL');
    s.appendChild(b);
  });

  // 行動裝置頂欄
  var bar = document.createElement('div');
  bar.className = 'mobile-bar';
  bar.innerHTML = '<a href="../../index.html" aria-label="回課程首頁">' + PixelStudio.pixelWord('PIXEL') + '</a><span class="title">' + title + '</span><a href="../../index.html">課程首頁</a>';
  document.body.insertBefore(bar, document.body.firstChild);

  function fromHash() {
    var h = parseInt((location.hash || '').replace(/\D/g, ''), 10);
    return h > 0 && h <= slides.length ? h - 1 : 0;
  }
  function fit() {
    if (mq.matches) { stage.style.transform = ''; return; }
    var s = Math.min(innerWidth / 1340, (innerHeight - 56) / 770);
    stage.style.transform = 'scale(' + s + ')';
  }
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    document.getElementById('counter').textContent = (i + 1) + ' / ' + slides.length;
    document.getElementById('progress').style.width = ((i + 1) / slides.length * 100) + '%';
    if (!mq.matches && location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
  }
  document.getElementById('prev').onclick = function () { show(i - 1); };
  document.getElementById('next').onclick = function () { show(i + 1); };
  document.getElementById('full').onclick = function () {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
  };
  addEventListener('keydown', function (e) {
    if (mq.matches) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'button' && (e.key === ' ' || e.key === 'Enter')) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].indexOf(e.key) > -1) { e.preventDefault(); show(i + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].indexOf(e.key) > -1) { e.preventDefault(); show(i - 1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') document.getElementById('full').click();
  });
  var x0 = null;
  addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', function (e) {
    if (x0 === null || mq.matches) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  addEventListener('resize', fit);
  addEventListener('hashchange', function () { if (!mq.matches) show(fromHash()); });
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () { fit(); show(i); });

  // 休息倒數
  var left = 600, tid = null, el = document.getElementById('timer');
  if (el) {
    var draw = function () { el.textContent = String(Math.floor(left / 60)).padStart(2, '0') + ':' + String(left % 60).padStart(2, '0'); };
    document.getElementById('timerBtn').onclick = function () {
      if (tid) { clearInterval(tid); tid = null; this.textContent = '繼續倒數'; return; }
      this.textContent = '暫停';
      tid = setInterval(function () { left = Math.max(0, left - 1); draw(); if (!left) { clearInterval(tid); tid = null; } }, 1000);
    };
    document.getElementById('timerReset').onclick = function () { clearInterval(tid); tid = null; left = 600; draw(); document.getElementById('timerBtn').textContent = '開始倒數'; };
  }

  // 碼表
  document.querySelectorAll('.sw-ui').forEach(function (ui) {
    var out = ui.parentNode.querySelector('.sw-time'), btn = ui.querySelector('.sw-start'), t0 = 0, acc = 0, sid = null;
    function draw() { out.textContent = ((acc + (sid ? performance.now() - t0 : 0)) / 1000).toFixed(1); }
    btn.onclick = function () {
      if (sid) { acc += performance.now() - t0; clearInterval(sid); sid = null; btn.textContent = '繼續'; draw(); }
      else { t0 = performance.now(); sid = setInterval(draw, 100); btn.textContent = '停止'; }
    };
    ui.querySelector('.sw-reset').onclick = function () { clearInterval(sid); sid = null; acc = 0; btn.textContent = '開始'; draw(); };
  });

  // 節拍器
  var ctx = null;
  function click(first) {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = first ? 1500 : 1000;
    g.gain.setValueAtTime(0.35, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.07);
  }
  document.querySelectorAll('.metro').forEach(function (m) {
    var bpm = parseInt(m.getAttribute('data-bpm'), 10) || 60, beat = 0, mid = null;
    m.innerHTML = '<button type="button" class="go">▶ 節拍器</button><button type="button" class="dn" aria-label="減速">−</button><span class="bpm"></span><button type="button" class="up" aria-label="加速">＋</button><span class="dots"><span></span><span></span><span></span><span></span></span>';
    var dots = m.querySelectorAll('.dots span'), lab = m.querySelector('.bpm'), go = m.querySelector('.go');
    function label() { lab.textContent = bpm + ' BPM'; }
    function tick() {
      dots.forEach(function (d, k) { d.classList.toggle('on', k === beat); d.classList.toggle('first', k === 0); });
      click(beat === 0); beat = (beat + 1) % 4;
    }
    function stop() { if (mid) clearInterval(mid); mid = null; go.textContent = '▶ 節拍器'; dots.forEach(function (d) { d.classList.remove('on'); }); }
    function start() { stop(); beat = 0; tick(); mid = setInterval(tick, 60000 / bpm); go.textContent = '■ 停止'; }
    go.onclick = function () { mid ? stop() : start(); };
    m.querySelector('.up').onclick = function () { bpm = Math.min(200, bpm + 5); label(); if (mid) start(); };
    m.querySelector('.dn').onclick = function () { bpm = Math.max(40, bpm - 5); label(); if (mid) start(); };
    label();
    var slide = m.closest('.slide');
    new MutationObserver(function () { if (!mq.matches && !slide.classList.contains('active')) stop(); })
      .observe(slide, { attributes: true, attributeFilter: ['class'] });
  });

  fit();
  show(fromHash());
  if (mq.matches && location.hash) {
    var t = document.getElementById('s' + (fromHash() + 1));
    if (t) setTimeout(function () { t.scrollIntoView(); }, 50);
  }
})();
