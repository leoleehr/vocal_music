/* ===== Pixel Studio 課堂投影片控制 ===== */
(function () {
  var MOBILE_Q = '(max-width:900px),(orientation:portrait) and (max-width:1100px)';
  var mq = matchMedia(MOBILE_Q);
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var stage = document.getElementById('stage');
  var title = document.body.getAttribute('data-title') || document.title;
  var i = 0;

  // 每張投影片加上錨點、左下角章節標註、右下角刷淡的 PIXEL STUDIO Logo
  var chapter = document.body.getAttribute('data-title') || '';
  slides.forEach(function (s, k) {
    s.id = 's' + (k + 1);
    if (s.classList.contains('cover')) return;
    var c = document.createElement('div');
    c.className = 'slide-chapter';
    c.textContent = chapter;
    s.appendChild(c);
    var b = document.createElement('div');
    b.className = 'slide-brand';
    b.innerHTML = '<img src="../../assets/pixel-studio-67-dark.png" alt="Pixel Studio 畫素音樂工作坊">';
    s.appendChild(b);
  });

  // 每張投影片的手機標頭：編號、起承轉合、互動類型
  var SEG = { 't-qi': ['起', 'var(--navy)'], 't-cheng': ['承', 'var(--gold)'], 't-zhuan': ['轉', 'var(--red)'], 't-he': ['合', 'var(--green)'] };
  var toc = [];
  slides.forEach(function (s, k) {
    var tag = s.querySelector('.kicker .tag'), seg = null;
    if (tag) Object.keys(SEG).forEach(function (c) { if (tag.classList.contains(c)) seg = SEG[c]; });
    var ixEl = s.querySelector('.ix-tag'), ix = ixEl ? ixEl.textContent.replace(/^\s*互動/, '').trim() : '';
    var head = s.querySelector('h2,h1,.quote,.timer'), label = head ? head.textContent.replace(/\s+/g, ' ').trim() : '';
    if (s.querySelector('#timer')) label = '休息十分鐘';
    var meta = document.createElement('div'); meta.className = 'slide-meta';
    meta.innerHTML = '<span class="sm-no">' + String(k + 1).padStart(2, '0') + '</span>' +
      (seg ? '<span class="sm-seg"><i style="background:' + seg[1] + '"></i>' + seg[0] + '</span>' : '') +
      (ix ? '<span class="sm-ix">' + ix + '</span>' : '');
    if (!s.classList.contains('cover')) s.insertBefore(meta, s.firstChild);
    toc.push({ href: '#s' + (k + 1), no: String(k + 1).padStart(2, '0'), label: label.length > 30 ? label.slice(0, 30) + '…' : label, dot: seg ? seg[1] : null, ix: !!ix });
  });

  // 行動裝置 App 頂欄、目錄按鈕與抽屜
  var bar = document.createElement('header');
  bar.className = 'appbar';
  var parts = title.split('｜');
  bar.innerHTML = '<a class="back" href="../../index.html#lessons" aria-label="回課程首頁">' + PixelUI.ICON.back + '</a>' +
    '<div class="ab-title"><small>' + (parts.length > 1 ? parts[0] : 'PIXEL STUDIO') + '</small><b>' + (parts[1] || title) + '</b></div>' +
    '<span class="ab-count">1 / ' + slides.length + '</span><span class="ab-progress"></span>';
  document.body.insertBefore(bar, document.body.firstChild);
  var sh = PixelUI.sheet('本堂目錄', toc);
  var fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'toc-fab'; fab.innerHTML = PixelUI.ICON.list + '目錄';
  fab.onclick = sh.open; document.body.appendChild(fab);
  PixelUI.labelTables(document);
  var abCount = bar.querySelector('.ab-count'), abProg = bar.querySelector('.ab-progress');
  function onScroll() {
    if (!mq.matches) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    abProg.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    var cur = 0;
    slides.forEach(function (s, k) { if (s.getBoundingClientRect().top < innerHeight * 0.35) cur = k; });
    abCount.textContent = (cur + 1) + ' / ' + slides.length;
    [].forEach.call(sh.list.children, function (a, k) { a.classList.toggle('cur', k === cur); });
  }
  addEventListener('scroll', onScroll, { passive: true });

  function fromHash() {
    var h = parseInt((location.hash || '').replace(/\D/g, ''), 10);
    return h > 0 && h <= slides.length ? h - 1 : 0;
  }
  function fit() {
    if (mq.matches) { stage.style.transform = ''; return; }
    var s = Math.min((innerWidth - 32) / 1280, (innerHeight - 76) / 720);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); });
    document.getElementById('counter').textContent = (i + 1) + ' / ' + slides.length;
    document.getElementById('progress').style.width = ((i + 1) / slides.length * 100) + '%';
    if (!mq.matches && location.hash !== '#' + (i + 1)) history.replaceState(null, '', '#' + (i + 1));
    document.dispatchEvent(new CustomEvent('slide:change', { detail: { index: i, mobile: mq.matches } }));
  }
  var INTERACTIVE = 'input,textarea,select,button,a,[contenteditable],canvas,.flip,.lm-ch,.checks li';
  document.getElementById('prev').onclick = function () { show(i - 1); };
  document.getElementById('next').onclick = function () { show(i + 1); };
  document.getElementById('full').onclick = function () {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
  };
  addEventListener('keydown', function (e) {
    if (mq.matches || document.documentElement.classList.contains('yt-open')) return;
    var tgt = e.target;
    if (tgt.closest && tgt.closest('input,textarea,select,[contenteditable]')) return;
    if (tgt.closest && tgt.closest('button,a,.flip,.checks li') && (e.key === ' ' || e.key === 'Enter')) return;
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].indexOf(e.key) > -1) { e.preventDefault(); show(i + 1); }
    else if (['ArrowLeft', 'PageUp', 'Backspace'].indexOf(e.key) > -1) { e.preventDefault(); show(i - 1); }
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') document.getElementById('full').click();
  });
  var x0 = null;
  addEventListener('touchstart', function (e) { x0 = e.target.closest && e.target.closest(INTERACTIVE) ? null : e.touches[0].clientX; }, { passive: true });
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
    // data-presets="70|100|140"：一鍵切換速度
    (m.getAttribute('data-presets') || '').split('|').filter(Boolean).forEach(function (v) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'preset'; b.textContent = v;
      b.onclick = function () { bpm = parseInt(v, 10); label(); start(); }; m.appendChild(b);
    });
    // data-challenge="id"：加速挑戰，唱穩一輪就 +5，記下班級紀錄（存在這台電腦）
    var cid = m.getAttribute('data-challenge');
    if (cid) {
      var key = 'pixel:metro-' + cid, rec = 0, base = bpm;
      try { rec = parseInt(localStorage.getItem(key), 10) || 0; } catch (e) {}
      var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'pass'; ok.textContent = '唱穩了 +5';
      var rb = document.createElement('span'); rb.className = 'record';
      var rs = document.createElement('button'); rs.type = 'button'; rs.className = 'restart'; rs.textContent = '回到 ' + base;
      function showRec() { rb.textContent = rec ? '班級紀錄 ' + rec + ' BPM' : '班級紀錄 —'; }
      ok.onclick = function () {
        if (bpm > rec) { rec = bpm; try { localStorage.setItem(key, rec); } catch (e) {} showRec(); }
        bpm = Math.min(200, bpm + 5); label(); start();
      };
      rs.onclick = function () { bpm = base; label(); if (mid) start(); };
      m.appendChild(ok); m.appendChild(rs); m.appendChild(rb); showRec();
    }
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
