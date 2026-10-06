/* ===== Pixel Studio 課堂互動元件 =====
 * 所有資料只存在這台裝置的瀏覽器（localStorage），不會上傳。
 * 元件以 class 宣告在投影片中，載入時自動建立：
 *   .quiz .poll .reveal .picker .score .wavelab .pitch .breath .recorder
 *   .order .flips .phase .lyricmark .exit .log7 .qr   以及 .checks[data-id]
 */
(function () {
  'use strict';
  var LESSON = (location.pathname.match(/lesson-(\d+)/) || [])[1] || 'x';
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem('pixel:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('pixel:' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; return b; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var stoppers = [];
  function onLeave(root, fn) { stoppers.push({ slide: root.closest('.slide'), fn: fn }); }

  /* ---------- 音訊 ---------- */
  var AC = null;
  function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
  function tone(freq, dur, vol, type) {
    var c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime, v = vol || 0.3;
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.setValueAtTime(v, t + Math.max(0.05, dur - 0.08)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function chime() { tone(880, 0.18, 0.25); setTimeout(function () { tone(1320, 0.3, 0.2); }, 160); }

  var mic = { stream: null, an: null, users: 0 };
  function micStart() {
    if (mic.an) { mic.users++; return Promise.resolve(mic.an); }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('nomic'));
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
        var c = ac(); mic.stream = s; mic.an = c.createAnalyser(); mic.an.fftSize = 2048;
        c.createMediaStreamSource(s).connect(mic.an); mic.users = 1; return mic.an;
      });
  }
  function micStop() {
    mic.users = Math.max(0, mic.users - 1);
    if (!mic.users && mic.stream) { mic.stream.getTracks().forEach(function (t) { t.stop(); }); mic.stream = null; mic.an = null; }
  }
  var NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var SOLF = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  function midiOf(f) { return 12 * Math.log2(f / 440) + 69; }
  function freqOf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function nameOf(m) { var r = Math.round(m), k = ((r % 12) + 12) % 12; return { name: NOTE[k] + (Math.floor(r / 12) - 1), solf: SOLF[k] }; }
  function detectPitch(buf, sr) {
    var n = buf.length, i, j, rms = 0;
    for (i = 0; i < n; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / n) < 0.012) return -1;
    var r1 = 0, r2 = n - 1, th = 0.2;
    for (i = 0; i < n / 2; i++) if (Math.abs(buf[i]) < th) { r1 = i; break; }
    for (i = 1; i < n / 2; i++) if (Math.abs(buf[n - i]) < th) { r2 = n - i; break; }
    buf = buf.slice(r1, r2); n = buf.length;
    var c = new Float32Array(n);
    for (i = 0; i < n; i++) for (j = 0; j < n - i; j++) c[i] += buf[j] * buf[j + i];
    var d = 0; while (d < n - 1 && c[d] > c[d + 1]) d++;
    var mx = -1, T = -1; for (i = d; i < n; i++) if (c[i] > mx) { mx = c[i]; T = i; }
    if (T <= 0 || T >= n - 1) return -1;
    var a = (c[T - 1] + c[T + 1] - 2 * c[T]) / 2, b = (c[T + 1] - c[T - 1]) / 2;
    if (a) T = T - b / (2 * a);
    var f = sr / T; return f > 60 && f < 1400 ? f : -1;
  }
  function rmsOf(an, buf) { an.getFloatTimeDomainData(buf); var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.sqrt(s / buf.length); }
  function canvasFit(cv) {
    var r = window.devicePixelRatio || 1, w = cv.clientWidth || 600, h = cv.clientHeight || 140;
    if (cv.width !== Math.round(w * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    var x = cv.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0); return { x: x, w: w, h: h };
  }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#fff'; }

  /* ---------- 1. 選擇題（手指投票後揭曉） ---------- */
  $$('.quiz').forEach(function (q) {
    var ans = parseInt(q.getAttribute('data-answer'), 10), items = $$('li', q), letters = '1234';
    var list = el('div', 'quiz-opts'), why = q.querySelector('.why');
    items.forEach(function (li, k) {
      var b = btn('<b>' + letters[k] + '</b>' + li.innerHTML, 'quiz-opt');
      b.onclick = function () { q.classList.add('done'); b.classList.add(k + 1 === ans ? 'right' : 'wrong'); show(); };
      list.appendChild(b);
    });
    var ol = q.querySelector('ol'); ol.parentNode.replaceChild(list, ol);
    var foot = el('div', 'quiz-foot'), hint = el('span', 'muted', '先用手指比出 1–4，再揭曉'), rv = btn('揭曉答案');
    rv.onclick = show; foot.appendChild(hint); foot.appendChild(rv); q.insertBefore(foot, why);
    function show() { list.children[ans - 1].classList.add('right'); if (why) why.classList.add('on'); q.classList.add('done'); }
  });

  /* ---------- 2. 舉手計票 ---------- */
  $$('.poll').forEach(function (p) {
    var id = 'poll-' + p.getAttribute('data-id'), opts = p.getAttribute('data-options').split('|');
    var cnt = LS.get(id, opts.map(function () { return 0; }));
    var rows = opts.map(function (o, k) {
      var r = el('div', 'poll-row', '<button type="button" class="poll-hit"><span class="poll-label">' + esc(o) + '</span><span class="poll-bar"><i></i></span><span class="poll-n"></span></button><button type="button" class="poll-minus" aria-label="減一">−</button>');
      r.querySelector('.poll-hit').onclick = function () { cnt[k]++; save(); };
      r.querySelector('.poll-minus').onclick = function () { cnt[k] = Math.max(0, cnt[k] - 1); save(); };
      p.appendChild(r); return r;
    });
    var foot = el('div', 'poll-foot'), tot = el('span', 'muted'), rs = btn('清除');
    rs.onclick = function () { cnt = opts.map(function () { return 0; }); save(); };
    foot.appendChild(tot); foot.appendChild(rs); p.appendChild(foot);
    function save() { LS.set(id, cnt); draw(); }
    function draw() {
      var max = Math.max.apply(null, cnt.concat([1])), sum = cnt.reduce(function (a, b) { return a + b; }, 0);
      rows.forEach(function (r, k) { r.querySelector('i').style.width = (cnt[k] / max * 100) + '%'; r.querySelector('.poll-n').textContent = cnt[k]; });
      tot.textContent = '點一下選項 +1，共 ' + sum + ' 票';
    }
    draw();
  });

  /* ---------- 3. 揭曉 ---------- */
  $$('.reveal').forEach(function (r) {
    var b = btn(r.getAttribute('data-label') || '揭曉答案', 'reveal-btn');
    b.onclick = function () { r.classList.toggle('on'); b.textContent = r.classList.contains('on') ? '收起' : (r.getAttribute('data-label') || '揭曉答案'); };
    r.parentNode.insertBefore(b, r);
  });

  /* ---------- 4. 隨機點名 ---------- */
  $$('.picker').forEach(function (p) {
    var names = LS.get('names', []), used = [];
    p.innerHTML = '<div class="picker-name">準備抽籤</div><div class="btn-row"><button type="button" class="btn primary go">抽一位</button><label class="picker-opt"><input type="checkbox" checked> 不重複</label><button type="button" class="btn edit">編輯名單</button></div><div class="picker-edit"><textarea rows="5" placeholder="一行一位，例如：&#10;王小明&#10;第 3 組"></textarea><div class="btn-row"><button type="button" class="btn save">儲存名單</button></div></div><p class="picker-meta muted"></p>';
    var out = p.querySelector('.picker-name'), ta = p.querySelector('textarea'), meta = p.querySelector('.picker-meta'), noRep = p.querySelector('input');
    function info() { meta.textContent = names.length ? '名單 ' + names.length + ' 位，已抽 ' + used.length + ' 位（名單只存在這台電腦）' : '先按「編輯名單」貼上學員姓名或組別'; }
    p.querySelector('.edit').onclick = function () { ta.value = names.join('\n'); p.classList.toggle('editing'); };
    p.querySelector('.save').onclick = function () { names = ta.value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean); LS.set('names', names); used = []; p.classList.remove('editing'); info(); };
    p.querySelector('.go').onclick = function () {
      var pool = names.filter(function (n) { return !noRep.checked || used.indexOf(n) < 0; });
      if (!names.length) { p.classList.add('editing'); return; }
      if (!pool.length) { used = []; pool = names.slice(); }
      var t = 0, spin = setInterval(function () {
        out.textContent = pool[Math.floor(Math.random() * pool.length)];
        if (++t > 14) { clearInterval(spin); var pick = pool[Math.floor(Math.random() * pool.length)]; out.textContent = pick; used.push(pick); out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop'); info(); }
      }, 60);
    };
    info();
  });

  /* ---------- 5. 分組計分板 ---------- */
  $$('.score').forEach(function (s) {
    var id = 'score-' + s.getAttribute('data-id'), n = parseInt(s.getAttribute('data-teams'), 10) || 4;
    var st = LS.get(id, null) || { names: Array.from({ length: n }, function (_, k) { return '第 ' + (k + 1) + ' 組'; }), pts: Array(n).fill(0) };
    var grid = el('div', 'score-grid');
    st.names.forEach(function (nm, k) {
      var c = el('div', 'score-team', '<div class="score-name" contenteditable="true" spellcheck="false"></div><div class="score-pts"></div><div class="btn-row"><button type="button" class="btn dn">−1</button><button type="button" class="btn primary up">+1</button></div>');
      c.querySelector('.score-name').textContent = nm;
      c.querySelector('.score-name').addEventListener('input', function (e) { st.names[k] = e.target.textContent.trim(); LS.set(id, st); });
      c.querySelector('.up').onclick = function () { st.pts[k]++; save(); chime(); };
      c.querySelector('.dn').onclick = function () { st.pts[k] = Math.max(0, st.pts[k] - 1); save(); };
      grid.appendChild(c);
    });
    var rs = btn('分數歸零', 'score-reset');
    rs.onclick = function () { st.pts = st.pts.map(function () { return 0; }); save(); };
    s.appendChild(grid); s.appendChild(rs);
    function save() { LS.set(id, st); draw(); }
    function draw() {
      var top = Math.max.apply(null, st.pts);
      $$('.score-team', s).forEach(function (c, k) { c.querySelector('.score-pts').textContent = st.pts[k]; c.classList.toggle('lead', top > 0 && st.pts[k] === top); });
    }
    draw();
  });

  /* ---------- 6. 聲波實驗室：振幅、頻率、波長 ---------- */
  $$('.wavelab').forEach(function (w) {
    w.innerHTML = '<canvas></canvas><div class="wl-ctrl"><label>頻率 <input type="range" class="f" min="0" max="1000" value="500"></label><label>振幅 <input type="range" class="a" min="0" max="100" value="60"></label></div><div class="wl-row"><div class="wl-read"></div><div class="btn-row"><button type="button" class="btn p220">220 Hz</button><button type="button" class="btn p440">440 Hz</button><button type="button" class="btn p880">880 Hz</button><button type="button" class="btn primary play">▶ 播放</button></div></div>';
    var cv = w.querySelector('canvas'), fr = w.querySelector('.f'), am = w.querySelector('.a'), rd = w.querySelector('.wl-read'), play = w.querySelector('.play');
    var osc = null, gain = null;
    function freq() { return 110 * Math.pow(8, fr.value / 1000); }
    function setF(f) { fr.value = Math.round(Math.log(f / 110) / Math.log(8) * 1000); upd(); }
    function upd() {
      var f = freq(), a = am.value / 100, n = nameOf(midiOf(f));
      rd.innerHTML = '<b>' + Math.round(f) + ' Hz</b>　' + n.name + '（' + n.solf + '）　波長約 ' + (343 / f).toFixed(2) + ' 公尺　音量 ' + am.value + '%';
      if (osc) { osc.frequency.setTargetAtTime(f, ac().currentTime, 0.02); gain.gain.setTargetAtTime(a * 0.35, ac().currentTime, 0.03); }
      draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, f = freq(), a = am.value / 100, cyc = f / 110 * 1.5;
      x.clearRect(0, 0, c.w, c.h);
      x.strokeStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.moveTo(0, c.h / 2); x.lineTo(c.w, c.h / 2); x.stroke();
      var g = x.createLinearGradient(0, 0, c.w, 0);
      ['#e8412b', '#e2407f', '#8a4fc0', '#2f5fc4', '#45b3e6', '#6cbb4b', '#d6e03a', '#f4a62a'].forEach(function (col, k) { g.addColorStop(k / 7, col); });
      x.strokeStyle = g; x.lineWidth = 3; x.beginPath();
      for (var i = 0; i <= c.w; i += 2) { var y = c.h / 2 - Math.sin(i / c.w * cyc * Math.PI * 2) * a * (c.h / 2 - 8); i ? x.lineTo(i, y) : x.moveTo(i, y); }
      x.stroke();
    }
    function stop() { if (osc) { gain.gain.setTargetAtTime(0, ac().currentTime, 0.03); var o = osc; setTimeout(function () { o.stop(); }, 150); osc = null; } play.textContent = '▶ 播放'; }
    play.onclick = function () {
      if (osc) return stop();
      var c = ac(); osc = c.createOscillator(); gain = c.createGain(); gain.gain.value = 0;
      osc.frequency.value = freq(); osc.connect(gain); gain.connect(c.destination); osc.start();
      play.textContent = '■ 停止'; upd();
    };
    fr.oninput = upd; am.oninput = upd;
    w.querySelector('.p220').onclick = function () { setF(220); };
    w.querySelector('.p440').onclick = function () { setF(440); };
    w.querySelector('.p880').onclick = function () { setF(880); };
    setF(440); window.addEventListener('resize', draw);
    onLeave(w, stop);
  });

  /* ---------- 7. 音準挑戰：麥克風辨識音高 ---------- */
  $$('.pitch').forEach(function (p) {
    var ranges = { male: [48, 67], female: [55, 72] }, range = 'male';
    p.innerHTML = '<div class="pt-top"><div class="pt-note">--</div><div class="pt-sub"><span class="pt-hz">按「開始練習」立刻計時並辨識音高</span><span class="pt-target"></span></div><div class="pt-score">命中 <b>0</b><small class="pt-clock">00:00</small></div></div><div class="pt-needle"><span class="pt-zone"></span><i></i></div><canvas></canvas><div class="btn-row"><button type="button" class="btn primary mic">● 開始練習</button><button type="button" class="btn male on">男聲</button><button type="button" class="btn female">女聲</button><button type="button" class="btn ask">出題並播放</button><button type="button" class="btn again">再聽一次</button></div>';
    var cv = p.querySelector('canvas'), noteEl = p.querySelector('.pt-note'), hz = p.querySelector('.pt-hz'), tg = p.querySelector('.pt-target'), needle = p.querySelector('.pt-needle i'), sc = p.querySelector('.pt-score b');
    var an = null, buf = new Float32Array(2048), raf = 0, hist = [], target = null, holdStart = 0, score = 0, frame = 0, micT0 = 0, askT0 = 0, muteUntil = 0, clock = p.querySelector('.pt-clock');
    function playTarget() { tone(freqOf(target), 1.2, 0.3, 'triangle'); muteUntil = performance.now() + 1500; askT0 = muteUntil; }
    function pickTarget() { var r = ranges[range]; target = r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)); var n = nameOf(target); tg.textContent = '目標：' + n.name + '（' + n.solf + '）'; playTarget(); }
    function loop() {
      raf = requestAnimationFrame(loop);
      var now = performance.now(), el2 = Math.floor((now - micT0) / 1000);
      clock.textContent = String(Math.floor(el2 / 60)).padStart(2, '0') + ':' + String(el2 % 60).padStart(2, '0');
      if (++frame % 2) return;
      if (now < muteUntil) { p.classList.remove('hit'); holdStart = 0; return; }
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      hist.push(m); if (hist.length > 160) hist.shift();
      if (m !== null) {
        var n = nameOf(m), cents = Math.round((m - Math.round(m)) * 100);
        noteEl.textContent = n.name; hz.textContent = Math.round(f) + ' Hz　' + n.solf + '　' + (cents > 0 ? '+' : '') + cents + ' 音分';
        var off = target !== null ? (m - target) * 100 : cents;
        needle.style.left = (50 + Math.max(-50, Math.min(50, off / 2))) + '%';
        var ok = Math.abs(off) <= 30; p.classList.toggle('hit', ok);
        if (target !== null && ok) { if (!holdStart) holdStart = performance.now(); if (performance.now() - holdStart > 700) { score++; sc.textContent = score; chime(); muteUntil = performance.now() + 700; target = null; tg.textContent = '命中！用時 ' + Math.max(0, (holdStart - askT0) / 1000).toFixed(1) + ' 秒，按「出題並播放」繼續'; holdStart = 0; } }
        else holdStart = 0;
      } else { p.classList.remove('hit'); holdStart = 0; }
      draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, r = ranges[range], lo = r[0] - 3, hi = r[1] + 3, Y = function (m) { return c.h - (m - lo) / (hi - lo) * c.h; };
      x.clearRect(0, 0, c.w, c.h);
      if (target !== null) { x.fillStyle = 'rgba(108,187,75,.18)'; x.fillRect(0, Y(target + 0.3), c.w, Y(target - 0.3) - Y(target + 0.3)); }
      x.strokeStyle = css('--amber'); x.lineWidth = 3; x.beginPath(); var on = false;
      hist.forEach(function (m, i) { var X = i / 159 * c.w; if (m === null || m < lo || m > hi) { on = false; return; } on ? x.lineTo(X, Y(m)) : x.moveTo(X, Y(m)); on = true; });
      x.stroke();
    }
    function stop() { cancelAnimationFrame(raf); if (an) { an = null; micStop(); } p.querySelector('.mic').textContent = '● 開始練習'; }
    p.querySelector('.mic').onclick = function () {
      if (an) return stop();
      micT0 = performance.now(); clock.textContent = '00:00';
      micStart().then(function (a) { an = a; micT0 = performance.now(); p.querySelector('.mic').textContent = '■ 停止'; hz.textContent = '計時中，對著麥克風唱出聲音'; loop(); })
        .catch(function () { hz.textContent = '無法使用麥克風：請允許瀏覽器使用麥克風，並以 https 網址開啟'; });
    };
    p.querySelector('.ask').onclick = pickTarget;
    p.querySelector('.again').onclick = function () { if (target !== null) playTarget(); };
    ['male', 'female'].forEach(function (k) { p.querySelector('.' + k).onclick = function () { range = k; p.querySelector('.male').classList.toggle('on', k === 'male'); p.querySelector('.female').classList.toggle('on', k === 'female'); draw(); }; });
    draw(); onLeave(p, stop);
  });

  /* ---------- 8. 吐氣測量：按下開始即計時，吐完自動停止 ---------- */
  $$('.breath').forEach(function (b) {
    var key = 'breath-' + b.getAttribute('data-key'), cmpKey = b.getAttribute('data-compare');
    var IDLE = '按「開始」後立刻計時，請以 /s/ 平穩吐氣，吐完會自動停止';
    b.innerHTML = '<div class="br-top"><div><div class="br-sec">0.0</div><div class="muted br-unit">秒</div></div><div class="br-info"><div class="br-state">' + IDLE + '</div><div class="br-stab"></div><div class="br-cmp"></div></div></div><canvas></canvas><div class="btn-row"><button type="button" class="btn primary go">● 開始計時</button><button type="button" class="btn manual">不用麥克風</button><button type="button" class="btn reset">重設</button></div>';
    var cv = b.querySelector('canvas'), sec = b.querySelector('.br-sec'), state = b.querySelector('.br-state'), stab = b.querySelector('.br-stab'), cmp = b.querySelector('.br-cmp'), go = b.querySelector('.go'), man = b.querySelector('.manual');
    var an = null, buf = new Float32Array(2048), raf = 0, tick = 0, levels = [], peak = 0, th = 0, t0 = 0, lastLoud = 0, heard = false, vals = [], running = false, useMic = true;
    function compare() {
      var mine = LS.get(key, null), base = cmpKey ? LS.get('breath-' + cmpKey, null) : null;
      cmp.textContent = base && mine && cmpKey ? '開場 ' + base.toFixed(1) + ' 秒 → 現在 ' + mine.toFixed(1) + ' 秒（' + (mine >= base ? '+' : '') + (mine - base).toFixed(1) + '）' : (mine ? '上次紀錄：' + mine.toFixed(1) + ' 秒' : '');
    }
    function steadiness() {
      if (vals.length < 10) return null;
      var mean = vals.reduce(function (a, c) { return a + c; }, 0) / vals.length;
      var sd = Math.sqrt(vals.reduce(function (a, c) { return a + (c - mean) * (c - mean); }, 0) / vals.length);
      return Math.max(0, Math.round(100 - sd / mean * 100));
    }
    function finish(s) {
      running = false; clearInterval(tick); cancelAnimationFrame(raf);
      if (an) { an = null; micStop(); }
      sec.textContent = s.toFixed(1); LS.set(key, s); compare();
      var st = useMic ? steadiness() : null;
      stab.textContent = st != null ? '穩定度 ' + st + '%（越高代表吐氣越平穩）' : '';
      state.textContent = '完成！可以再測一次，會保留最新的秒數';
      go.textContent = '● 開始計時'; chime();
    }
    function start() {
      levels = []; vals = []; peak = 0; th = 0; heard = false; stab.textContent = '';
      t0 = performance.now(); lastLoud = t0; running = true; go.textContent = '■ 停止';
      sec.textContent = '0.0';
      tick = setInterval(function () { if (running) sec.textContent = ((performance.now() - t0) / 1000).toFixed(1); }, 100);
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      var r = rmsOf(an, buf), now = performance.now();
      levels.push(r); if (levels.length > 300) levels.shift();
      peak = Math.max(peak * 0.999, r); th = Math.max(0.01, peak * 0.2);
      if (r > th && r > 0.012) { heard = true; lastLoud = now; vals.push(r); state.textContent = '吐氣中…保持聲音大小不變'; }
      // 已聽到吐氣、且安靜超過 0.6 秒，就以最後有聲音的時間點結束
      if (heard && now - t0 > 1000 && now - lastLoud > 600) finish((lastLoud - t0) / 1000);
      draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, mx = Math.max(0.05, Math.max.apply(null, levels.concat([th * 2])));
      x.clearRect(0, 0, c.w, c.h);
      if (th) { x.strokeStyle = 'rgba(255,255,255,.25)'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(0, c.h - th / mx * c.h); x.lineTo(c.w, c.h - th / mx * c.h); x.stroke(); x.setLineDash([]); }
      x.fillStyle = css('--navy');
      levels.forEach(function (v, i) { var h = v / mx * c.h; x.fillRect(i / 300 * c.w, c.h - h, c.w / 300 + 0.5, h); });
    }
    function stopAll() { if (running) finish((performance.now() - t0) / 1000); }
    go.onclick = function () {
      if (running) { var end = useMic && heard ? lastLoud : performance.now(); return finish(Math.max(0, end - t0) / 1000); }
      if (!useMic) { start(); state.textContent = '計時中，吐完氣請按「停止」'; return; }
      // 先開始計時，再接上麥克風；麥克風無法使用時自動改為手動碼表
      start(); state.textContent = '計時中，請以 /s/ 吐氣';
      micStart().then(function (a) { if (!running) { micStop(); return; } an = a; loop(); })
        .catch(function () { useMic = false; man.textContent = '使用麥克風'; state.textContent = '無法使用麥克風，已改為手動計時：吐完氣請按「停止」'; });
    };
    man.onclick = function () {
      if (running) return;
      useMic = !useMic; man.textContent = useMic ? '不用麥克風' : '使用麥克風';
      state.textContent = useMic ? IDLE : '手動計時：按「開始」立刻計時，吐完氣按「停止」';
    };
    b.querySelector('.reset').onclick = function () {
      running = false; clearInterval(tick); cancelAnimationFrame(raf); if (an) { an = null; micStop(); }
      go.textContent = '● 開始計時'; sec.textContent = '0.0'; stab.textContent = ''; levels = []; th = 0; draw(); state.textContent = useMic ? IDLE : '手動計時：按「開始」立刻計時，吐完氣按「停止」';
    };
    compare(); draw(); onLeave(b, stopAll);
  });

  /* ---------- 9. 錄音 ---------- */
  $$('.recorder').forEach(function (r) {
    var max = parseInt(r.getAttribute('data-max'), 10) || 30, label = r.getAttribute('data-name') || '錄音';
    r.innerHTML = '<div class="rec-time">00:' + String(max).padStart(2, '0') + '</div><div class="btn-row"><button type="button" class="btn primary go">● 開始錄音</button></div><audio controls></audio><a class="btn dl" download>下載檔案</a><p class="muted rec-note">錄音只存在這台裝置，下載後請自行保存。</p>';
    var tm = r.querySelector('.rec-time'), go = r.querySelector('.go'), au = r.querySelector('audio'), dl = r.querySelector('.dl');
    var rec = null, chunks = [], left = max, tid = 0, usingMic = false;
    function fmt(s) { return '00:' + String(Math.max(0, s)).padStart(2, '0'); }
    function stop() { if (rec && rec.state !== 'inactive') rec.stop(); clearInterval(tid); }
    go.onclick = function () {
      if (rec && rec.state === 'recording') return stop();
      if (!window.MediaRecorder) { tm.textContent = '此瀏覽器不支援錄音'; return; }
      micStart().then(function () {
        usingMic = true;
        var type = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        rec = new MediaRecorder(mic.stream, { mimeType: type }); chunks = []; left = max;
        rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          var blob = new Blob(chunks, { type: type }), url = URL.createObjectURL(blob), d = new Date();
          au.src = url; dl.href = url; dl.download = label + '_' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + (type === 'audio/webm' ? '.webm' : '.m4a');
          r.classList.add('has'); go.textContent = '● 重新錄音'; tm.textContent = '完成'; if (usingMic) { usingMic = false; micStop(); }
        };
        rec.start(); go.textContent = '■ 停止'; tm.textContent = fmt(left);
        tid = setInterval(function () { left--; tm.textContent = fmt(left); if (left <= 0) stop(); }, 1000);
      }).catch(function () { tm.textContent = '無法使用麥克風'; });
    };
    onLeave(r, stop);
  });

  /* ---------- 10. 排序遊戲（點兩下交換） ---------- */
  $$('.order').forEach(function (o) {
    var items = o.getAttribute('data-items').split('|'), cur = items.map(function (_, k) { return k; }), sel = -1;
    var box = el('div', 'order-tiles'), foot = el('div', 'btn-row'), msg = el('p', 'order-msg muted', '點一張，再點另一張就會交換位置');
    var ck = btn('檢查', 'primary'), sh = btn('重新洗牌'), an = btn('顯示答案');
    foot.appendChild(ck); foot.appendChild(sh); foot.appendChild(an);
    o.appendChild(box); o.appendChild(foot); o.appendChild(msg);
    function shuffle() { do { cur.sort(function () { return Math.random() - 0.5; }); } while (cur.every(function (v, k) { return v === k; })); sel = -1; render(); msg.textContent = '點一張，再點另一張就會交換位置'; }
    function render(check) {
      box.innerHTML = '';
      cur.forEach(function (v, k) {
        var t = btn('<small>' + (k + 1) + '</small>' + esc(items[v]), 'order-tile' + (k === sel ? ' sel' : '') + (check ? (v === k ? ' ok' : ' no') : ''));
        t.onclick = function () { if (sel < 0) { sel = k; } else { var tmp = cur[sel]; cur[sel] = cur[k]; cur[k] = tmp; sel = -1; } render(); };
        box.appendChild(t);
      });
    }
    ck.onclick = function () { var n = cur.filter(function (v, k) { return v === k; }).length; render(true); msg.textContent = n === items.length ? '全部正確！' : '對了 ' + n + ' / ' + items.length + ' 張'; if (n === items.length) chime(); };
    sh.onclick = shuffle;
    an.onclick = function () { cur = items.map(function (_, k) { return k; }); render(true); msg.textContent = '這是正確順序'; };
    shuffle();
  });

  /* ---------- 11. 翻牌 ---------- */
  $$('.flips').forEach(function (f) {
    $$('.flip', f).forEach(function (c) {
      c.setAttribute('role', 'button'); c.tabIndex = 0;
      c.onclick = function () { c.classList.toggle('on'); };
      c.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); c.classList.toggle('on'); } };
    });
    var all = btn('全部翻開', 'flips-all');
    all.onclick = function () { var on = !f.classList.contains('allon'); f.classList.toggle('allon', on); $$('.flip', f).forEach(function (c) { c.classList.toggle('on', on); }); all.textContent = on ? '全部蓋回' : '全部翻開'; };
    f.parentNode.insertBefore(all, f.nextSibling);
  });

  /* ---------- 12. 分段計時（想—配對—分享、跟做） ---------- */
  $$('.phase').forEach(function (p) {
    var ph = p.getAttribute('data-phases').split(';').map(function (s) { var a = s.split('|'); return { name: a[0], sec: parseInt(a[1], 10) }; });
    var idx = 0, left = ph[0].sec, tid = 0;
    p.innerHTML = '<div class="ph-steps"></div><div class="ph-main"><div class="ph-name"></div><div class="ph-time"></div></div><div class="btn-row"><button type="button" class="btn primary go">開始</button><button type="button" class="btn next">下一段</button><button type="button" class="btn reset">重設</button></div>';
    var steps = p.querySelector('.ph-steps'), nm = p.querySelector('.ph-name'), tm = p.querySelector('.ph-time'), go = p.querySelector('.go');
    ph.forEach(function (s) { steps.appendChild(el('span', '', esc(s.name) + ' <small>' + Math.round(s.sec / 60 * 10) / 10 + ' 分</small>')); });
    function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function draw() { nm.textContent = ph[idx].name; tm.textContent = fmt(left); $$('span', steps).forEach(function (s, k) { s.classList.toggle('on', k === idx); s.classList.toggle('past', k < idx); }); }
    function next() { if (idx < ph.length - 1) { idx++; left = ph[idx].sec; chime(); } else { stop(); left = 0; nm.textContent = '時間到'; tone(660, 0.6, 0.3); } draw(); }
    function stop() { clearInterval(tid); tid = 0; go.textContent = '開始'; }
    go.onclick = function () { if (tid) { stop(); go.textContent = '繼續'; return; } go.textContent = '暫停'; tid = setInterval(function () { left--; if (left <= 0) next(); else draw(); }, 1000); };
    p.querySelector('.next').onclick = next;
    p.querySelector('.reset').onclick = function () { stop(); idx = 0; left = ph[0].sec; draw(); };
    draw(); onLeave(p, function () { if (tid) { stop(); go.textContent = '繼續'; } });
  });

  /* ---------- 13. 歌詞換氣點標記 ---------- */
  $$('.lyricmark').forEach(function (l) {
    var key = 'lyric-' + LESSON + '-' + (l.getAttribute('data-id') || '0'), marks = LS.get(key, {}), teacher = {};
    var lines = l.getAttribute('data-lines').split(';'), box = el('div', 'lm-lines');
    lines.forEach(function (line, li) {
      var row = el('p', 'lm-line'), ci = 0;
      line.split('').forEach(function (ch) {
        if (ch === '|' || ch === '^') { teacher[li + ':' + (ci - 1)] = ch === '|' ? '∨' : 'ˇ'; return; }
        var id = li + ':' + ci, s = el('span', 'lm-ch', esc(ch)); s.setAttribute('data-id', id);
        s.onclick = function () { var v = marks[id]; marks[id] = !v ? '∨' : v === '∨' ? 'ˇ' : ''; if (!marks[id]) delete marks[id]; LS.set(key, marks); paint(); };
        row.appendChild(s); ci++;
      });
      box.appendChild(row);
    });
    var foot = el('div', 'btn-row'), tv = btn('對照老師版'), cl = btn('清除我的標記');
    foot.appendChild(tv); foot.appendChild(cl);
    var msg = el('p', 'muted lm-msg', '點字的後面加上換氣記號：點一次 ∨ 大換氣，再點一次 ˇ 小換氣，再點一次取消');
    l.appendChild(box); l.appendChild(foot); l.appendChild(msg);
    tv.onclick = function () { l.classList.toggle('show-t'); tv.textContent = l.classList.contains('show-t') ? '隱藏老師版' : '對照老師版'; paint(); };
    cl.onclick = function () { marks = {}; LS.set(key, marks); paint(); };
    function paint() {
      var showT = l.classList.contains('show-t'), hit = 0, tot = Object.keys(teacher).length;
      $$('.lm-ch', l).forEach(function (s) {
        var id = s.getAttribute('data-id'), m = marks[id] || '', t = teacher[id] || '';
        s.setAttribute('data-m', m); s.setAttribute('data-t', showT ? t : '');
        s.classList.toggle('match', showT && !!t && m === t);
        if (t && m === t) hit++;
      });
      msg.textContent = showT ? '和老師版相同的記號：' + hit + ' / ' + tot + '。換氣點沒有唯一解，重點是唱到句尾還有氣。' : '點字的後面加上換氣記號：點一次 ∨ 大換氣，再點一次 ˇ 小換氣，再點一次取消';
    }
    paint();
  });

  /* ---------- 14. 出場券 ---------- */
  $$('.exit').forEach(function (x) {
    var key = 'exit-' + LESSON, prompts = x.getAttribute('data-prompts').split('|'), st = LS.get(key, {});
    prompts.forEach(function (pr, k) {
      var f = el('label', 'exit-field', '<span>' + esc(pr) + '</span><textarea rows="2"></textarea>');
      var ta = f.querySelector('textarea'); ta.value = st[k] || '';
      ta.oninput = function () { st[k] = ta.value; LS.set(key, st); };
      x.appendChild(f);
    });
    var foot = el('div', 'btn-row'), cp = btn('複製全部，貼到群組'), msg = el('span', 'muted');
    cp.onclick = function () {
      var title = document.body.getAttribute('data-title') || document.title;
      var text = title + ' 出場券\n' + prompts.map(function (p, k) { return '■ ' + p + '\n' + (st[k] || ''); }).join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { msg.textContent = '已複製'; }, function () { msg.textContent = '無法自動複製，請手動選取'; });
    };
    foot.appendChild(cp); foot.appendChild(msg); x.appendChild(foot);
  });

  /* ---------- 15. 七天紀錄表 ---------- */
  $$('.log7').forEach(function (t) {
    var key = 'log7-' + LESSON, cols = t.getAttribute('data-cols').split('|'), st = LS.get(key, {});
    var tb = el('table', 'log7-t'), h = '<tr><th>天數</th>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
    for (var d = 0; d < 7; d++) { h += '<tr><td>第 ' + (d + 1) + ' 天</td>' + cols.map(function (_, c) { return '<td><input type="text" data-k="' + d + '-' + c + '"></td>'; }).join('') + '</tr>'; }
    tb.innerHTML = h; t.appendChild(tb);
    $$('input', tb).forEach(function (i) { i.value = st[i.getAttribute('data-k')] || ''; i.oninput = function () { st[i.getAttribute('data-k')] = i.value; LS.set(key, st); }; });
    t.appendChild(el('p', 'muted log7-note', '填在自己的手機上，資料只存在這支手機。'));
  });

  /* ---------- 16. 作業勾選 ---------- */
  $$('.checks[data-id]').forEach(function (u) {
    var key = 'checks-' + u.getAttribute('data-id'), st = LS.get(key, []);
    $$('li', u).forEach(function (li, k) {
      li.classList.toggle('done', !!st[k]); li.tabIndex = 0; li.setAttribute('role', 'checkbox');
      var tg = function () { st[k] = !st[k]; li.classList.toggle('done', !!st[k]); li.setAttribute('aria-checked', !!st[k]); LS.set(key, st); };
      li.onclick = tg; li.onkeydown = function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); tg(); } };
    });
  });

  /* ---------- 17. QR Code ---------- */
  $$('.qr').forEach(function (q) {
    var href = q.getAttribute('data-href') || 'self';
    var url = href === 'self' ? location.href.split('#')[0] : new URL(href, location.href).href;
    var box = el('div', 'qr-box'); q.appendChild(box);
    q.appendChild(el('div', 'qr-url', esc(url.replace(/^https?:\/\//, ''))));
    if (window.QRCode) new window.QRCode(box, { text: url, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    else box.innerHTML = '<a href="' + esc(url) + '">' + esc(url) + '</a>';
    // 手機上不需要掃碼：同一頁顯示「已同步」，其他連結改成按鈕
    q.appendChild(href === 'self' ? el('div', 'qr-mobile here', '✓ 你已在手機上開啟這份簡報') : el('a', 'qr-mobile go', '開啟課前問卷 →'));
    if (href !== 'self') q.lastChild.href = url;
  });
  if (window.PixelUI) window.PixelUI.labelTables(document);

  /* ---------- 換頁時停止聲音與麥克風 ---------- */
  document.addEventListener('slide:change', function (e) {
    if (e.detail && e.detail.mobile) return;
    stoppers.forEach(function (s) { if (s.slide && !s.slide.classList.contains('active')) s.fn(); });
  });
})();
