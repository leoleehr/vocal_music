/* ===== Pixel Studio 課堂互動元件 =====
 * 互動狀態存在這台裝置的瀏覽器（localStorage）；作答與成果經 backend.js 送到課程試算表。
 * 元件以 class 宣告在投影片中，載入時自動建立：
 *   .quiz .poll .reveal .picker .score .wavelab .pitch .siren .stopwatch .mirror .dynmap .range .transpose .zero
 *   .rhythm-game .breath .recorder
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
  // 送到後台：PixelBackend 由 backend.js 提供；沒有載入時略過
  function slideNo(root) { var s = root && root.closest && root.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(root, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(root) }); }
  function say(msg, kind) { if (window.PixelBackend) window.PixelBackend.toast(msg, kind); }
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
      b.onclick = function () { if (!q.classList.contains('done')) report(q, 'quiz', { item: (q.querySelector('.q') || {}).textContent, result: k + 1 === ans ? '答對' : '答錯', value: k + 1, detail: { answer: li.textContent.trim() } }); q.classList.add('done'); b.classList.add(k + 1 === ans ? 'right' : 'wrong'); show(); };
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
    var pv = btn('儲存到後台'); pv.onclick = function () { var sum = cnt.reduce(function (a, b) { return a + b; }, 0); report(p, 'poll', { item: opts.join('／'), result: opts.map(function (o, k) { return o + ' ' + cnt[k]; }).join('、'), value: sum, detail: { options: opts, counts: cnt } }); say('已記錄投票結果', 'ok'); };
    foot.appendChild(pv);
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
    var sv = btn('儲存分數到後台', 'score-reset'); sv.onclick = function () { report(s, 'score', { item: st.names.join('／'), result: st.names.map(function (n, k) { return n + ' ' + st.pts[k]; }).join('、'), value: Math.max.apply(null, st.pts), detail: st }); say('已記錄分數', 'ok'); };
    s.appendChild(grid); s.appendChild(rs); s.appendChild(sv);
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
    p.innerHTML = '<div class="pt-top"><div class="pt-note">--</div><div class="pt-sub"><span class="pt-hz">按「開始練習」立刻計時並辨識音高</span><span class="pt-target"></span></div><div class="pt-score">命中 <b>0</b><small class="pt-clock">00:00</small></div></div><div class="pt-needle"><span class="pt-zone"></span><i></i></div><canvas></canvas><div class="btn-row"><button type="button" class="btn male on">男聲</button><button type="button" class="btn female">女聲</button><button type="button" class="btn ask">出題並播放</button><button type="button" class="btn primary mic">● 開始練習</button><button type="button" class="btn again">再聽一次</button></div>';
    var cv = p.querySelector('canvas'), noteEl = p.querySelector('.pt-note'), hz = p.querySelector('.pt-hz'), tg = p.querySelector('.pt-target'), needle = p.querySelector('.pt-needle i'), sc = p.querySelector('.pt-score b');
    var an = null, buf = new Float32Array(2048), raf = 0, hist = [], target = null, holdStart = 0, score = 0, frame = 0, micT0 = 0, askT0 = 0, muteUntil = 0, clock = p.querySelector('.pt-clock');
    function playTarget() { tone(freqOf(target), 1.2, 0.3, 'triangle'); muteUntil = performance.now() + 1500; askT0 = muteUntil; }
    // data-seq="scale"：依 C 大調音階依序出題（男聲 C3–C4、女聲 C4–C5）
    var SEQ = p.getAttribute('data-seq') === 'scale' ? [0, 2, 4, 5, 7, 9, 11, 12] : null, si = 0;
    function pickTarget() {
      if (SEQ) { target = (range === 'male' ? 48 : 60) + SEQ[si]; var q = nameOf(target); tg.textContent = '第 ' + (si + 1) + ' / 8 音：' + q.name + '（' + q.solf + '）'; playTarget(); return; }
      var r = ranges[range]; target = r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)); var n = nameOf(target); tg.textContent = '目標：' + n.name + '（' + n.solf + '）'; playTarget();
    }
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
        if (target !== null && ok) { if (!holdStart) holdStart = performance.now(); if (performance.now() - holdStart > 700) { score++; sc.textContent = score; report(p, 'pitch', { item: nameOf(target).name + '（' + nameOf(target).solf + '）', result: '命中', value: +Math.max(0, (holdStart - askT0) / 1000).toFixed(1) }); chime(); muteUntil = performance.now() + 700; target = null; tg.textContent = '命中！用時 ' + Math.max(0, (holdStart - askT0) / 1000).toFixed(1) + ' 秒，按「出題並播放」繼續'; holdStart = 0; if (SEQ) { if (si < SEQ.length - 1) { si++; setTimeout(function () { if (an) pickTarget(); }, 900); } else { si = 0; tg.textContent = '音階完成！按「從 C 開始」再唱一次'; } } } }
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
    p.querySelector('.ask').onclick = function () { if (SEQ) si = 0; pickTarget(); };
    if (SEQ) p.querySelector('.ask').textContent = '從 C 開始';
    p.querySelector('.again').onclick = function () { if (target !== null) playTarget(); };
    ['male', 'female'].forEach(function (k) { p.querySelector('.' + k).onclick = function () { range = k; p.querySelector('.male').classList.toggle('on', k === 'male'); p.querySelector('.female').classList.toggle('on', k === 'female'); si = 0; draw(); }; });
    draw(); onLeave(p, stop);
  });

  /* ---------- 警笛滑音：寬音域音高曲線，找出換聲區 ---------- */
  $$('.siren').forEach(function (p) {
    var key = 'siren-' + LESSON, LO = 36, HI = 84, saved = LS.get(key, null);
    p.innerHTML = '<div class="sr-read"><div><small>最低音</small><b class="sr-lo">--</b></div><div><small>最高音</small><b class="sr-hi">--</b></div><div class="sr-brk-box"><small>換聲點</small><b class="sr-brk">--</b></div></div><canvas></canvas><p class="sr-state muted">按「開始滑音」，以 /u/ 或 /ng/ 由最低音慢慢滑到最高音再滑回來</p><div class="btn-row"><button type="button" class="btn primary go">● 開始滑音</button><button type="button" class="btn mark">標記換聲點</button><button type="button" class="btn clear">清除</button></div>';
    var cv = p.querySelector('canvas'), st = p.querySelector('.sr-state'), go = p.querySelector('.go');
    var an = null, buf = new Float32Array(2048), raf = 0, frame = 0, hist = [], marks = [], last = null, lo = null, hi = null, brk = null, recent = [];
    function nm(m) { var n = nameOf(m); return n.name + '（' + n.solf + '）'; }
    function show() {
      p.querySelector('.sr-lo').textContent = lo === null ? '--' : nameOf(lo).name;
      p.querySelector('.sr-hi').textContent = hi === null ? '--' : nameOf(hi).name;
      p.querySelector('.sr-brk').textContent = brk === null ? '--' : nameOf(brk).name;
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      if (++frame % 2) return;
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      // 連續三格取中位數，減少八度誤判造成的跳點
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      var v = ok.length === 3 ? ok[1] : null;
      if (v !== null) {
        if (lo === null || v < lo) lo = v;
        if (hi === null || v > hi) hi = v;
        if (last !== null && Math.abs(v - last) >= 3) { marks.push({ i: hist.length, m: v, auto: true }); if (brk === null) brk = Math.round(Math.min(v, last)); }
        st.textContent = '現在：' + nm(v) + '　' + Math.round(f) + ' Hz';
      }
      last = v === null ? last : v;
      hist.push(v); if (hist.length > 360) { hist.shift(); marks.forEach(function (k) { k.i--; }); marks = marks.filter(function (k) { return k.i >= 0; }); }
      show(); draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, Y = function (m) { return c.h - (m - LO) / (HI - LO) * c.h; }, X = function (i) { return i / 359 * c.w; };
      x.clearRect(0, 0, c.w, c.h);
      x.font = '11px ' + css('--display'); x.textBaseline = 'middle';
      for (var o = LO; o <= HI; o += 12) { x.strokeStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.moveTo(30, Y(o)); x.lineTo(c.w, Y(o)); x.stroke(); x.fillStyle = 'rgba(255,255,255,.4)'; x.fillText(nameOf(o).name, 4, Math.min(c.h - 7, Math.max(7, Y(o)))); }
      if (brk !== null) { x.fillStyle = 'rgba(236,74,54,.16)'; x.fillRect(30, Y(brk + 1.5), c.w - 30, Y(brk - 1.5) - Y(brk + 1.5)); }
      x.strokeStyle = css('--amber'); x.lineWidth = 3; x.beginPath(); var on = false;
      hist.forEach(function (m, i) { if (m === null) { on = false; return; } on ? x.lineTo(X(i), Y(m)) : x.moveTo(X(i), Y(m)); on = true; });
      x.stroke();
      marks.forEach(function (k) { x.fillStyle = k.auto ? 'rgba(236,74,54,.75)' : css('--red'); x.beginPath(); x.arc(X(k.i), Y(k.m), k.auto ? 4 : 7, 0, Math.PI * 2); x.fill(); });
    }
    function save() { if (lo === null) return; LS.set(key, { lo: lo, hi: hi, brk: brk }); }
    function stop() {
      cancelAnimationFrame(raf);
      if (an) {
        an = null; micStop(); save();
        if (lo !== null) report(p, 'siren', { item: '警笛滑音', result: nameOf(lo).name + '–' + nameOf(hi).name + (brk !== null ? '，換聲點 ' + nameOf(brk).name : ''), value: brk === null ? '' : nameOf(brk).name, detail: { low: nameOf(lo).name, high: nameOf(hi).name, span: Math.round(hi - lo) } });
        st.textContent = lo === null ? '沒有收到穩定的聲音，靠近麥克風再試一次' : '音域 ' + nm(lo) + ' 到 ' + nm(hi) + (brk !== null ? '；換聲點約在 ' + nm(brk) + '，用鍵盤確認後記下來' : '');
      }
      go.textContent = '● 開始滑音';
    }
    go.onclick = function () {
      if (an) return stop();
      micStart().then(function (a) { an = a; recent = []; last = null; go.textContent = '■ 停止'; st.textContent = '聆聽中，從最低音開始慢慢往上滑'; loop(); })
        .catch(function () { st.textContent = '無法使用麥克風：請允許瀏覽器使用麥克風，並以 https 網址開啟'; });
    };
    p.querySelector('.mark').onclick = function () {
      if (last === null) { st.textContent = '先發出聲音，在聲音轉變的那一刻按下標記'; return; }
      brk = Math.round(last); marks.push({ i: Math.max(0, hist.length - 1), m: last, auto: false }); save(); show(); draw();
      st.textContent = '已標記換聲點：' + nm(brk);
    };
    p.querySelector('.clear').onclick = function () { hist = []; marks = []; last = null; lo = hi = brk = null; LS.set(key, null); show(); draw(); st.textContent = '已清除，按「開始滑音」再試一次'; };
    if (saved) { lo = saved.lo; hi = saved.hi; brk = saved.brk; st.textContent = '上次紀錄：' + nm(lo) + ' 到 ' + nm(hi) + (brk !== null ? '，換聲點 ' + nm(brk) : ''); }
    show(); draw(); window.addEventListener('resize', draw); onLeave(p, stop);
  });

  /* ---------- 碼表：繞口令計時，保留每一位的成績 ---------- */
  $$('.stopwatch').forEach(function (w) {
    var key = 'stopwatch-' + LESSON + '-' + (w.getAttribute('data-id') || '0'), runs = LS.get(key, []), t0 = 0, raf = 0;
    w.innerHTML = '<div class="sw-time">0.00</div><div class="btn-row"><button type="button" class="btn primary go">開始</button><button type="button" class="btn clear">清除紀錄</button></div><ol class="sw-runs"></ol>';
    var tm = w.querySelector('.sw-time'), go = w.querySelector('.go'), list = w.querySelector('.sw-runs');
    function show() {
      var best = runs.length ? Math.min.apply(null, runs) : 0;
      list.innerHTML = runs.map(function (s, k) { return '<li class="' + (s === best ? 'best' : '') + '">第 ' + (k + 1) + ' 位　' + s.toFixed(2) + ' 秒' + (s === best ? '　最快' : '') + '</li>'; }).join('');
    }
    function loop() { tm.textContent = ((performance.now() - t0) / 1000).toFixed(2); raf = requestAnimationFrame(loop); }
    function stop(save) {
      cancelAnimationFrame(raf); raf = 0; go.textContent = '開始'; w.classList.remove('on');
      if (save) { var sec = (performance.now() - t0) / 1000; tm.textContent = sec.toFixed(2); runs.push(+sec.toFixed(2)); if (runs.length > 12) runs.shift(); LS.set(key, runs); show(); }
    }
    go.onclick = function () { if (raf) return stop(true); t0 = performance.now(); go.textContent = '停止'; w.classList.add('on'); loop(); };
    w.querySelector('.clear').onclick = function () { stop(false); runs = []; LS.set(key, runs); tm.textContent = '0.00'; show(); };
    show(); onLeave(w, function () { if (raf) stop(false); });
  });

  /* ---------- 鏡子：手機前鏡頭，對照口型（畫面不錄製、不上傳） ---------- */
  $$('.mirror').forEach(function (m) {
    m.innerHTML = '<div class="mr-view"><video playsinline muted></video><p class="mr-hint">按「打開鏡子」，用前鏡頭看自己的口型<br><small>畫面只在這支手機上顯示，不會錄製或上傳</small></p></div><div class="btn-row"><button type="button" class="btn primary go">打開鏡子</button></div>';
    var v = m.querySelector('video'), go = m.querySelector('.go'), hint = m.querySelector('.mr-hint'), stream = null;
    function stop() { if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } v.srcObject = null; m.classList.remove('on'); go.textContent = '打開鏡子'; }
    go.onclick = function () {
      if (stream) return stop();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { hint.textContent = '這個瀏覽器無法使用鏡頭，請改用手機的自拍模式'; return; }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then(function (s) {
        stream = s; v.srcObject = s; v.play(); m.classList.add('on'); go.textContent = '關閉鏡子';
      }).catch(function () { hint.textContent = '無法使用鏡頭：請允許瀏覽器使用相機，並以 https 網址開啟'; });
    };
    onLeave(m, stop);
  });

  /* ---------- 情緒地圖：每段力度舉手計票（p／mp／mf／f） ---------- */
  $$('.dynmap').forEach(function (m) {
    var id = 'dyn-' + m.getAttribute('data-id'), secs = m.getAttribute('data-sections').split('|'), lv = (m.getAttribute('data-levels') || 'p|mp|mf|f').split('|');
    var st = LS.get(id, null) || secs.map(function () { return lv.map(function () { return 0; }); });
    var grid = el('div', 'dm-grid');
    grid.style.gridTemplateColumns = 'minmax(7em,1.2fr) repeat(' + lv.length + ',1fr)';
    grid.appendChild(el('div', 'dm-head', '段落'));
    lv.forEach(function (l) { grid.appendChild(el('div', 'dm-head dm-lv', esc(l))); });
    secs.forEach(function (sec, r) {
      grid.appendChild(el('div', 'dm-sec', esc(sec)));
      lv.forEach(function (l, c) {
        var b = el('button', 'dm-cell'); b.type = 'button'; b.setAttribute('data-r', r); b.setAttribute('data-c', c);
        b.onclick = function () { st[r][c]++; save(); };
        b.oncontextmenu = function (e) { e.preventDefault(); st[r][c] = Math.max(0, st[r][c] - 1); save(); };
        grid.appendChild(b);
      });
    });
    var res = el('p', 'dm-res'), foot = el('div', 'btn-row'), clr = btn('清除'), sv = btn('儲存到後台');
    foot.appendChild(sv); foot.appendChild(clr);
    m.appendChild(grid); m.appendChild(res); m.appendChild(foot);
    function winner(r) { var mx = Math.max.apply(null, st[r]); return mx ? st[r].indexOf(mx) : -1; }
    function draw() {
      $$('.dm-cell', grid).forEach(function (b) { var r = +b.getAttribute('data-r'), c = +b.getAttribute('data-c'); b.textContent = st[r][c] || ''; b.classList.toggle('win', winner(r) === c); });
      var parts = secs.map(function (s, r) { var w = winner(r); return w < 0 ? null : s + ' ' + lv[w]; }).filter(Boolean);
      res.textContent = parts.length ? '全班共識：' + parts.join(' → ') : '點格子計票（右鍵或長按減一），每段票數最多的力度就是全班共識';
    }
    function save() { LS.set(id, st); draw(); }
    clr.onclick = function () { st = secs.map(function () { return lv.map(function () { return 0; }); }); save(); };
    sv.onclick = function () { report(m, 'dynamics', { item: secs.join('／'), result: res.textContent.replace('全班共識：', ''), detail: { sections: secs, levels: lv, votes: st } }); say('已記錄情緒地圖', 'ok'); };
    draw();
  });

  /* ---------- 音域測量：參考音逐音上下，記錄可用音域與完全音域 ---------- */
  var LETTER = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  function degreesOf(a, b) { // 白鍵度數，頭尾都算：C3→C4 = 8 度
    var na = nameOf(Math.min(a, b)).name, nb = nameOf(Math.max(a, b)).name;
    var oa = +na.slice(-1), ob = +nb.slice(-1);
    return (ob - oa) * 7 + LETTER[nb[0]] - LETTER[na[0]] + 1;
  }
  $$('.range').forEach(function (p) {
    var key = 'range-me', st = LS.get(key, { lo: null, hi: null, flo: null, fhi: null }), ref = 60, an = null, raf = 0, frame = 0, buf = new Float32Array(2048), recent = [];
    p.innerHTML = '<div class="rg-read"><div><small>可用音域</small><b class="rg-use">--</b></div><div><small>完全音域</small><b class="rg-full">--</b></div><div><small>可用度數</small><b class="rg-deg">--</b></div></div>' +
      '<div class="rg-ref"><button type="button" class="btn dn" aria-label="往下一個音">▼</button><div class="rg-note"><small>參考音</small><b>C4</b><span class="rg-sung">你唱的音：--</span></div><button type="button" class="btn up" aria-label="往上一個音">▲</button></div>' +
      '<div class="btn-row"><button type="button" class="btn play">▶ 播放參考音</button><button type="button" class="btn primary mic">● 開始偵測</button><button type="button" class="btn setlo">設為可用最低</button><button type="button" class="btn sethi">設為可用最高</button><button type="button" class="btn clear">清除</button></div>' +
      '<p class="rg-state muted">由 C4 開始，以 /a/ 逐音往下唱；聲音變虛、音準不穩時，把前一個音設為「可用最低」。再回到 C4 往上，用同樣方式設定「可用最高」。</p>';
    var noteB = p.querySelector('.rg-note b'), sung = p.querySelector('.rg-sung'), state = p.querySelector('.rg-state'), mic = p.querySelector('.mic');
    function nm(m) { return m === null || m === undefined ? '--' : nameOf(m).name; }
    function show() {
      noteB.textContent = nameOf(ref).name + '（' + nameOf(ref).solf + '）';
      p.querySelector('.rg-use').textContent = st.lo !== null && st.hi !== null ? nm(st.lo) + '–' + nm(st.hi) : nm(st.lo) + ' / ' + nm(st.hi);
      p.querySelector('.rg-full').textContent = st.flo !== null ? nm(st.flo) + '–' + nm(st.fhi) : '--';
      p.querySelector('.rg-deg').textContent = st.lo !== null && st.hi !== null ? degreesOf(st.lo, st.hi) + ' 度' : '--';
    }
    function save(what) {
      LS.set(key, st); show();
      if (what && st.lo !== null && st.hi !== null) report(p, 'range', { item: '音域測量', result: '可用 ' + nm(st.lo) + '–' + nm(st.hi) + '（' + degreesOf(st.lo, st.hi) + ' 度）' + (st.flo !== null ? '；完全 ' + nm(st.flo) + '–' + nm(st.fhi) : ''), value: degreesOf(st.lo, st.hi), detail: st });
    }
    function play() { tone(freqOf(ref), 1.2, 0.3, 'triangle'); }
    p.querySelector('.dn').onclick = function () { ref = Math.max(36, ref - 1); show(); play(); };
    p.querySelector('.up').onclick = function () { ref = Math.min(84, ref + 1); show(); play(); };
    p.querySelector('.play').onclick = play;
    p.querySelector('.setlo').onclick = function () { st.lo = ref; if (st.hi !== null && st.hi < st.lo) st.hi = null; save(true); state.textContent = '可用最低音：' + nm(ref) + '。回到 C4，往上找可用最高音。'; ref = 60; show(); };
    p.querySelector('.sethi').onclick = function () { st.hi = ref; if (st.lo !== null && st.lo > st.hi) st.lo = null; save(true); state.textContent = '可用最高音：' + nm(ref) + '。這個結果會帶到「自定調」計算。'; };
    p.querySelector('.clear').onclick = function () { st = { lo: null, hi: null, flo: null, fhi: null }; ref = 60; save(false); state.textContent = '已清除，從 C4 重新開始。'; };
    function loop() {
      raf = requestAnimationFrame(loop);
      if (++frame % 2) return;
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      if (ok.length < 3) return;
      var v = Math.round(ok[1]);
      sung.textContent = '你唱的音：' + nm(v) + (v === ref ? '　✓ 對準參考音' : '');
      p.classList.toggle('hit', v === ref);
      if (st.flo === null || v < st.flo) st.flo = v;
      if (st.fhi === null || v > st.fhi) st.fhi = v;
      if (frame % 30 === 0) { LS.set(key, st); show(); }
    }
    function stop() { cancelAnimationFrame(raf); if (an) { an = null; micStop(); LS.set(key, st); show(); } mic.textContent = '● 開始偵測'; p.classList.remove('hit'); }
    mic.onclick = function () {
      if (an) return stop();
      micStart().then(function (a) { an = a; recent = []; mic.textContent = '■ 停止偵測'; loop(); })
        .catch(function () { state.textContent = '無法使用麥克風：請允許瀏覽器使用麥克風，並以 https 網址開啟。也可以只用參考音與鍵盤測量。'; });
    };
    show(); onLeave(p, stop);
  });

  /* ---------- 自定調計算器：歌曲最高音對齊我的可用最高音 ---------- */
  var KEYS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  $$('.transpose').forEach(function (t) {
    function opts(lo, hi, sel) { var h = ''; for (var m = lo; m <= hi; m++) h += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + nameOf(m).name + '（' + nameOf(m).solf + '）</option>'; return h; }
    var me = LS.get('range-me', {}), myHi = me && me.hi ? me.hi : 65;
    var key0 = parseInt(t.getAttribute('data-key') || '0', 10), top0 = parseInt(t.getAttribute('data-top') || '69', 10);
    t.innerHTML = '<div class="tp-form"><label>歌曲原調<select class="k">' + KEYS.map(function (k, i) { return '<option value="' + i + '"' + (i === key0 ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>' +
      '<label>歌曲最高音<select class="top">' + opts(55, 81, top0) + '</select></label>' +
      '<label>我的可用最高音<select class="me">' + opts(52, 81, myHi) + '</select></label></div><div class="tp-out"></div>' +
      (me && me.hi ? '<p class="muted tp-note">已帶入音域測量的可用最高音 ' + nameOf(me.hi).name + '</p>' : '<p class="muted tp-note">還沒測量音域？先到「音域測量」設定可用最高音，這裡會自動帶入。</p>');
    var out = t.querySelector('.tp-out');
    function shape(k) { // 常用開放和弦指型 + 移調夾
      var best = null;
      [['C', 0], ['G', 7], ['D', 2], ['A', 9], ['E', 4]].forEach(function (s) { var capo = ((k - s[1]) % 12 + 12) % 12; if (capo <= 7 && (!best || capo < best.capo)) best = { name: s[0], capo: capo }; });
      return best.capo ? best.name + ' 調指型、Capo ' + best.capo : best.name + ' 調指型，不用移調夾';
    }
    function calc() {
      var k = +t.querySelector('.k').value, top = +t.querySelector('.top').value, mine = +t.querySelector('.me').value, n = mine - top;
      var rows = [0, -1, -2].map(function (d) { var nk = ((k + n + d) % 12 + 12) % 12; return '<tr' + (d ? '' : ' class="main"') + '><td>' + (d ? '留 ' + (-d) + ' 個半音餘裕' : '最高音對齊') + '</td><td>' + (n + d > 0 ? '+' : '') + (n + d) + ' 半音</td><td><b>' + KEYS[nk] + ' 調</b></td><td>' + shape(nk) + '</td></tr>'; }).join('');
      out.innerHTML = '<table><tr><th>方案</th><th>移調</th><th>自定調</th><th>吉他</th></tr>' + rows + '</table>';
      t._last = { key: KEYS[k], top: nameOf(top).name, mine: nameOf(mine).name, n: n, result: KEYS[((k + n) % 12 + 12) % 12] };
    }
    $$('select', t).forEach(function (s) { s.onchange = calc; });
    var sv = btn('記錄這首的自定調', 'primary'); t.appendChild(sv);
    sv.onclick = function () { var r = t._last; report(t, 'transpose', { item: '原調 ' + r.key + '、最高音 ' + r.top, result: r.result + ' 調（' + (r.n > 0 ? '+' : '') + r.n + ' 半音）', value: r.n, detail: r }); say('已記錄自定調', 'ok'); };
    calc();
  });

  /* ---------- 第零號錄音對照：從手機選檔，和結業版接著播放 ---------- */
  $$('.zero').forEach(function (z) {
    z.innerHTML = '<label class="btn zr-pick">選擇第零號錄音檔<input type="file" accept="audio/*,video/webm,.m4a,.webm,.mp3,.wav"></label><audio controls></audio><p class="muted zr-note">從手機的下載資料夾選擇第一堂下載的「第零號錄音」。沒有下載的同學，老師會從課程雲端資料夾播放。</p><div class="btn-row"><button type="button" class="btn primary both" disabled>先聽第零號，再聽結業版</button></div>';
    var au = z.querySelector('audio'), inp = z.querySelector('input'), both = z.querySelector('.both'), url = '';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(f); au.src = url; z.classList.add('has'); both.disabled = false; z.querySelector('.zr-note').textContent = '已載入：' + f.name; };
    both.onclick = function () {
      var fin = z.closest('.slide').querySelector('.recorder audio');
      au.currentTime = 0; au.play();
      au.onended = function () { au.onended = null; if (fin && fin.src) { fin.currentTime = 0; fin.play(); } else say('結業版還沒錄，先在右邊錄下來', 'warn'); };
    };
    onLeave(z, function () { au.pause(); });
  });

  /* ---------- 節奏挑戰：聽節奏 → 唱出 Ta → 比對拍點 ---------- */
  var RHYTHMS = [
    { name: '四分音符', tip: '一拍一個音，最穩定的基礎', on: [0, 1, 2, 3] },
    { name: '八分音符', tip: '一拍兩個音，平均分配', on: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] },
    { name: '附點節奏', tip: '長—短，像心跳的「咚—噠」', on: [0, 1.5, 2, 3.5] },
    { name: '切分音', tip: '重音落在拍子中間，流行歌最常見', on: [0, 0.5, 1.5, 2, 3] },
    { name: '前八後十六', tip: '一個長音接兩個短音', on: [0, 0.5, 0.75, 1, 1.5, 1.75, 2, 3] },
    { name: '反拍', tip: '全部落在「拍子之間」，最考驗穩定度', on: [0.5, 1.5, 2.5, 3.5] }
  ];
  $$('.rhythm-game').forEach(function (g) {
    var idx = 0, bpm = parseInt(g.getAttribute('data-bpm'), 10) || 80, running = false, mode = 'mic';
    var LAT = 0.04; // 麥克風輸入延遲補償（秒）
    g.innerHTML =
      '<div class="rg-pats"></div>' +
      '<div class="rg-head"><div><b class="rg-name"></b><span class="rg-tip"></span></div><div class="rg-tempo"><button type="button" class="btn rg-dn" aria-label="減速">−</button><span class="rg-bpm"></span><button type="button" class="btn rg-up" aria-label="加速">＋</button></div></div>' +
      '<canvas class="rg-cv"></canvas>' +
      '<div class="rg-status"><span class="rg-state">先按「示範播放」聽一次，再按「開始挑戰」用 Ta 唱出節奏</span><span class="rg-score"></span></div>' +
      '<div class="btn-row"><button type="button" class="btn rg-demo">▶ 示範播放</button><button type="button" class="btn primary rg-go">● 開始挑戰</button><button type="button" class="btn rg-tap" disabled>拍點（J 鍵）</button><button type="button" class="btn rg-mode">改用拍點鍵</button></div>';
    var pats = g.querySelector('.rg-pats'), cv = g.querySelector('.rg-cv'), state = g.querySelector('.rg-state'), scoreEl = g.querySelector('.rg-score');
    var go = g.querySelector('.rg-go'), demo = g.querySelector('.rg-demo'), tapB = g.querySelector('.rg-tap'), modeB = g.querySelector('.rg-mode');
    RHYTHMS.forEach(function (r, k) {
      var b = btn(r.name, 'rg-pat'); b.onclick = function () { if (running) return; idx = k; result = null; paintPats(); draw(); };
      pats.appendChild(b);
    });
    var result = null, an = null, buf = new Float32Array(1024), raf = 0, onsets = [], start = 0, end = 0, nowBeat = -1;
    function spb() { return 60 / bpm; }
    function paintPats() {
      $$('.rg-pat', pats).forEach(function (b, k) { b.classList.toggle('on', k === idx); });
      g.querySelector('.rg-name').textContent = RHYTHMS[idx].name;
      g.querySelector('.rg-tip').textContent = RHYTHMS[idx].tip;
      g.querySelector('.rg-bpm').textContent = bpm + ' BPM';
    }
    function click(at, accent, vol) {
      var c = ac(), o = c.createOscillator(), gn = c.createGain();
      o.frequency.value = accent ? 1600 : 1100;
      gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(vol || 0.3, at + 0.004); gn.gain.exponentialRampToValueAtTime(0.001, at + 0.06);
      o.connect(gn); gn.connect(c.destination); o.start(at); o.stop(at + 0.08);
    }
    function note(at, dur) {
      var c = ac(), o = c.createOscillator(), gn = c.createGain();
      o.type = 'triangle'; o.frequency.value = 523.25;
      gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(0.32, at + 0.01); gn.gain.setValueAtTime(0.32, at + dur * 0.6); gn.gain.linearRampToValueAtTime(0, at + dur);
      o.connect(gn); gn.connect(c.destination); o.start(at); o.stop(at + dur + 0.02);
    }
    function countIn(t0) { for (var i = 0; i < 4; i++) click(t0 + i * spb(), i === 0, 0.35); return t0 + 4 * spb(); }
    function draw() {
      var c = canvasFit(cv), x = c.x, W = c.w, H = c.h, padL = 10, padR = 10, w = W - padL - padR;
      var X = function (b) { return padL + b / 4 * w; };
      x.clearRect(0, 0, W, H);
      for (var s = 0; s <= 16; s++) {
        x.strokeStyle = s % 4 === 0 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.07)'; x.lineWidth = s % 4 === 0 ? 1.5 : 1;
        x.beginPath(); x.moveTo(X(s / 4), 6); x.lineTo(X(s / 4), H - 6); x.stroke();
      }
      x.fillStyle = 'rgba(255,255,255,.45)'; x.font = '12px "Space Grotesk",sans-serif';
      for (var b = 0; b < 4; b++) x.fillText(String(b + 1), X(b) + 4, 18);
      if (nowBeat >= 0) { x.fillStyle = 'rgba(199,175,74,.12)'; x.fillRect(X(Math.floor(nowBeat)), 4, w / 4, H - 8); }
      var on = RHYTHMS[idx].on, mid = H * 0.42;
      on.forEach(function (b, k) {
        var st = result ? (result.hit[k] ? css('--green') : 'rgba(236,74,54,.85)') : css('--amber');
        x.fillStyle = st; x.beginPath(); x.roundRect ? x.roundRect(X(b) - 2, mid - 14, 14, 28, 4) : x.rect(X(b) - 2, mid - 14, 14, 28); x.fill();
      });
      (result ? result.det : onsets).forEach(function (d) {
        var b = typeof d === 'number' ? d : d.b; if (b < -0.5 || b > 4.5) return;
        x.fillStyle = d.ok === undefined ? css('--navy') : (d.ok ? css('--green') : 'rgba(255,255,255,.5)');
        x.beginPath(); x.moveTo(X(b), H - 12); x.lineTo(X(b) - 7, H - 26); x.lineTo(X(b) + 7, H - 26); x.closePath(); x.fill();
      });
      x.fillStyle = 'rgba(255,255,255,.4)'; x.font = '11px "Noto Sans TC",sans-serif';
      x.fillText('目標拍點', W - 64, mid - 20); x.fillText('你的拍點 ▼', W - 72, H - 30);
    }
    function score() {
      var tg = RHYTHMS[idx].on, det = onsets.map(function (b) { return { b: b, ok: false } }), hit = tg.map(function () { return null; });
      var tol = Math.min(0.13, spb() * 0.25) / spb(); // 以拍為單位的容許範圍
      tg.forEach(function (t, k) {
        var best = null;
        det.forEach(function (d) { if (!d.ok && Math.abs(d.b - t) <= tol && (!best || Math.abs(d.b - t) < Math.abs(best.b - t))) best = d; });
        if (best) { best.ok = true; hit[k] = (best.b - t) * spb() * 1000; }
      });
      var n = hit.filter(function (h) { return h !== null; }).length, extra = det.filter(function (d) { return !d.ok; }).length;
      var offs = hit.filter(function (h) { return h !== null; }), avg = offs.length ? offs.reduce(function (a, b) { return a + b; }, 0) / offs.length : 0;
      var pct = Math.max(0, Math.round((n - extra * 0.5) / tg.length * 100));
      result = { hit: hit.map(function (h) { return h !== null; }), det: det, n: n, extra: extra, avg: avg, pct: pct };
      var lean = Math.abs(avg) < 25 ? '時間點很準' : avg < 0 ? '整體偏快約 ' + Math.round(-avg) + ' 毫秒（搶拍）' : '整體偏慢約 ' + Math.round(avg) + ' 毫秒（拖拍）';
      scoreEl.textContent = pct + ' 分';
      state.textContent = '命中 ' + n + ' / ' + tg.length + (extra ? '，多唱 ' + extra + ' 個' : '') + '。' + (n ? lean : '再聽一次示範，跟著節拍器唱唱看');
      if (n === tg.length && !extra) chime();
      report(g, 'rhythm', { item: RHYTHMS[idx].name + '（' + bpm + ' BPM）', result: n + '/' + tg.length, value: pct, detail: { extra: extra, avgOffsetMs: Math.round(avg), mode: mode } });
      draw();
    }
    function finish() {
      running = false; cancelAnimationFrame(raf); nowBeat = -1;
      if (an) { an = null; micStop(); }
      tapB.disabled = true; go.textContent = '● 再挑戰一次'; demo.disabled = false;
      score();
    }
    function tick() {
      raf = requestAnimationFrame(tick);
      var t = ac().currentTime, b = (t - start) / spb();
      nowBeat = b >= 0 && b < 4 ? b : -1;
      if (an && t >= start - 0.15) {
        an.getFloatTimeDomainData(buf);
        var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        var r = Math.sqrt(s / buf.length);
        if (env.armed && r > env.th && r > env.low * 2.2 && t - env.last > 0.11) { onsets.push((t - LAT - start) / spb()); env.last = t; env.armed = false; env.peak = r; }
        if (!env.armed) { env.peak = Math.max(env.peak, r); if (r < env.peak * 0.55 || t - env.last > 0.3) { env.armed = true; env.low = r; } }
        else env.low = Math.min(env.low * 1.02 + 0.0005, Math.max(r, 0.002));
      } else if (an) {
        an.getFloatTimeDomainData(buf); var s2 = 0; for (var j = 0; j < buf.length; j++) s2 += buf[j] * buf[j];
        env.floor = Math.max(env.floor, Math.sqrt(s2 / buf.length)); env.th = Math.max(0.02, env.floor * 3); env.low = env.floor || 0.005;
      }
      if (t > end) return finish();
      draw();
    }
    var env = {};
    function begin(withMic) {
      result = null; onsets = []; scoreEl.textContent = '';
      env = { armed: true, last: -1, peak: 0, low: 0.005, floor: 0, th: 0.02 };
      var c = ac(); start = countIn(c.currentTime + 0.15); end = start + 4 * spb() + 0.35;
      running = true; go.textContent = '■ 停止'; demo.disabled = true;
      tapB.disabled = withMic; state.textContent = withMic ? '數四拍後開始，用 Ta 唱出節奏（不要跟著拍手）' : '數四拍後開始，在每個拍點按「拍點」或 J 鍵';
      cancelAnimationFrame(raf); tick();
    }
    go.onclick = function () {
      if (running) { running = false; cancelAnimationFrame(raf); nowBeat = -1; if (an) { an = null; micStop(); } tapB.disabled = true; demo.disabled = false; go.textContent = '● 開始挑戰'; state.textContent = '已停止'; draw(); return; }
      if (mode === 'tap') return begin(false);
      state.textContent = '開啟麥克風中…';
      micStart().then(function (a) { an = a; begin(true); })
        .catch(function () { mode = 'tap'; modeB.textContent = '改用麥克風'; state.textContent = '無法使用麥克風，已改為拍點鍵模式'; begin(false); });
    };
    demo.onclick = function () {
      if (running) return;
      var c = ac(), t0 = countIn(c.currentTime + 0.1), on = RHYTHMS[idx].on;
      on.forEach(function (b, k) { var nx = k + 1 < on.length ? on[k + 1] : 4; note(t0 + b * spb(), Math.min(0.35, (nx - b) * spb() * 0.8)); });
      result = null; onsets = []; scoreEl.textContent = ''; state.textContent = '示範播放中：前四下是預備拍';
      start = t0; end = t0 + 4 * spb() + 0.2; demo.disabled = true;
      (function anim() { var t = ac().currentTime, b = (t - start) / spb(); nowBeat = b >= 0 && b < 4 ? b : -1; draw(); if (t < end) requestAnimationFrame(anim); else { nowBeat = -1; demo.disabled = false; state.textContent = '換你了：按「開始挑戰」，數四拍後用 Ta 唱出同樣的節奏'; draw(); } })();
    };
    function tap() { if (!running || mode !== 'tap') return; onsets.push((ac().currentTime - start) / spb()); draw(); }
    tapB.onclick = tap;
    document.addEventListener('keydown', function (e) { if (running && mode === 'tap' && (e.key === 'j' || e.key === 'J')) { e.preventDefault(); e.stopPropagation(); tap(); } }, true);
    modeB.onclick = function () { if (running) return; mode = mode === 'mic' ? 'tap' : 'mic'; modeB.textContent = mode === 'mic' ? '改用拍點鍵' : '改用麥克風'; state.textContent = mode === 'mic' ? '麥克風模式：用 Ta 唱出節奏' : '拍點鍵模式：在每個拍點按「拍點」或 J 鍵'; };
    g.querySelector('.rg-up').onclick = function () { if (!running) { bpm = Math.min(132, bpm + 4); result = null; paintPats(); draw(); } };
    g.querySelector('.rg-dn').onclick = function () { if (!running) { bpm = Math.max(56, bpm - 4); result = null; paintPats(); draw(); } };
    paintPats(); draw(); window.addEventListener('resize', draw);
    onLeave(g, function () { if (running) go.onclick(); });
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
      report(b, 'breath', { item: /after/.test(b.getAttribute('data-key')) ? '吐氣後測' : /before/.test(b.getAttribute('data-key')) ? '吐氣前測' : '吐氣測量', result: s.toFixed(1) + ' 秒', value: +s.toFixed(1), detail: { steadiness: st, mode: useMic ? '麥克風' : '手動' } });
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
    r.innerHTML = '<div class="rec-time">' + String(Math.floor(max / 60)).padStart(2, '0') + ':' + String(max % 60).padStart(2, '0') + '</div><div class="btn-row"><button type="button" class="btn primary go">● 開始錄音</button></div><audio controls></audio><a class="btn dl" download>下載檔案</a><p class="muted rec-note">可下載保存，或按「上傳給老師」送到課程的雲端資料夾。</p>';
    var tm = r.querySelector('.rec-time'), go = r.querySelector('.go'), au = r.querySelector('audio'), dl = r.querySelector('.dl');
    var rec = null, chunks = [], left = max, tid = 0, usingMic = false, up = null;
    function fmt(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
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
          if (!up) { up = btn('上傳給老師', 'primary rec-up'); r.insertBefore(up, r.querySelector('.rec-note')); }
          var secs = max - Math.max(0, left), fname = dl.download;
          up.disabled = false; up.textContent = '上傳給老師';
          up.onclick = function () {
            if (!window.PixelBackend) return;
            up.disabled = true; up.textContent = '上傳中…';
            window.PixelBackend.upload(blob, { label: label, seconds: secs, filename: fname, slide: slideNo(r) }).then(function (res) { up.textContent = res && res.ok ? '✓ 已上傳給老師' : '上傳給老師'; up.disabled = !!(res && res.ok); });
          };
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
    ck.onclick = function () { var n = cur.filter(function (v, k) { return v === k; }).length; report(o, 'order', { item: items[0] + ' …（' + items.length + ' 張）', result: n + '/' + items.length, value: n }); render(true); msg.textContent = n === items.length ? '全部正確！' : '對了 ' + n + ' / ' + items.length + ' 張'; if (n === items.length) chime(); };
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
    // data-loop：最後一段結束後自動從頭再來（例：結業演唱每人 1 分鐘）
    var idx = 0, left = ph[0].sec, tid = 0, loop = p.hasAttribute('data-loop'), round = 1;
    p.innerHTML = '<div class="ph-steps"></div><div class="ph-main"><div class="ph-name"></div><div class="ph-time"></div></div><div class="btn-row"><button type="button" class="btn primary go">開始</button><button type="button" class="btn next">下一段</button><button type="button" class="btn reset">重設</button></div>';
    var steps = p.querySelector('.ph-steps'), nm = p.querySelector('.ph-name'), tm = p.querySelector('.ph-time'), go = p.querySelector('.go');
    ph.forEach(function (s) { steps.appendChild(el('span', '', esc(s.name) + ' <small>' + (s.sec < 60 ? s.sec + ' 秒' : Math.round(s.sec / 60 * 10) / 10 + ' 分') + '</small>')); });
    function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function draw() { nm.textContent = (loop ? '第 ' + round + ' 位　' : '') + ph[idx].name; tm.textContent = fmt(left); $$('span', steps).forEach(function (s, k) { s.classList.toggle('on', k === idx); s.classList.toggle('past', k < idx); }); }
    function next() { if (idx < ph.length - 1) { idx++; left = ph[idx].sec; chime(); } else if (loop) { idx = 0; left = ph[0].sec; round++; tone(660, 0.5, 0.3); stop(); go.textContent = '下一位開始'; } else { stop(); left = 0; nm.textContent = '時間到'; tone(660, 0.6, 0.3); } draw(); }
    function stop() { clearInterval(tid); tid = 0; go.textContent = '開始'; }
    go.onclick = function () { if (tid) { stop(); go.textContent = '繼續'; return; } go.textContent = '暫停'; tid = setInterval(function () { left--; if (left <= 0) next(); else draw(); }, 1000); };
    p.querySelector('.next').onclick = next;
    p.querySelector('.reset').onclick = function () { stop(); idx = 0; left = ph[0].sec; round = 1; draw(); };
    draw(); onLeave(p, function () { if (tid) { stop(); go.textContent = '繼續'; } });
  });

  /* ---------- 13. 歌詞換氣點標記 ----------
   * 歌詞來源（依序）：老師在這台電腦貼上的歌詞 → 後台「歌詞」分頁（需課程代碼）→ data-lines 預設片段
   * 歌詞格式：一行一句、空行分段、【主歌】這類標題行；字後面加 ∨ 或 | 為老師版大換氣，ˇ 或 ^ 為小換氣
   * data-marks 可改用其他記號（例："●|ŋ" 標韻腳與後鼻音），data-hint 為操作說明
   */
  $$('.lyricmark').forEach(function (l) {
    var lid = l.getAttribute('data-id') || '0', base = 'lyric-' + LESSON + '-' + lid;
    var fallback = l.getAttribute('data-lines').split(';').join('\n');
    var MK = (l.getAttribute('data-marks') || '∨|ˇ').split('|'), hint = l.getAttribute('data-hint') || '點字的後面加上換氣記號：點一次 ∨ 大換氣，再點一次 ˇ 小換氣，再點一次取消 ';
    function mkOf(ch) { var k = MK.indexOf(ch); if (k > -1) return MK[k]; if (MK[0] === '∨') { if (ch === '|') return '∨'; if (ch === '^') return 'ˇ'; } return ''; }
    var marks = {}, teacher = {}, key = '', src = '';
    var box = el('div', 'lm-lines');
    var foot = el('div', 'btn-row'), sd = btn('送出我的標記', 'primary'), tv = btn('對照老師版'), cl = btn('清除我的標記'), ed = btn('貼上完整歌詞');
    foot.appendChild(sd); foot.appendChild(tv); foot.appendChild(cl); foot.appendChild(ed);
    var msg = el('p', 'muted lm-msg');
    var editor = el('div', 'lm-editor', '<p class="muted">一行一句、空行分段，可加上【主歌】【副歌】標題行。要設定老師版換氣點，在字後面加上 ∨（大換氣）或 ˇ（小換氣）。歌詞只存在這台電腦；若要同步到學員手機，請貼到課程試算表的「歌詞」分頁。</p><textarea rows="10"></textarea><div class="btn-row"><button type="button" class="btn primary lm-save">儲存並顯示</button><button type="button" class="btn lm-reset">恢復預設片段</button><button type="button" class="btn lm-cancel">取消</button></div>');
    l.appendChild(box); l.appendChild(foot); l.appendChild(msg); l.appendChild(editor);
    var ta = editor.querySelector('textarea');
    function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
    function render(text, from) {
      src = from; teacher = {}; box.innerHTML = '';
      key = base + '-' + hash(text); marks = LS.get(key, {});
      var li = 0;
      text.replace(/\r/g, '').split('\n').forEach(function (raw) {
        var line = raw.trim();
        if (!line) { box.appendChild(el('div', 'lm-gap')); return; }
        if (/^[【\[［(（].*[】\]］)）]$/.test(line)) { box.appendChild(el('p', 'lm-label', esc(line.replace(/^[【\[［(（]|[】\]］)）]$/g, '')))); return; }
        var row = el('p', 'lm-line'), ci = 0, n = li++;
        line.split('').forEach(function (ch) {
          if (mkOf(ch) && ci > 0) { teacher[n + ':' + (ci - 1)] = mkOf(ch); return; }
          if (ch === ' ' || ch === '　') { row.appendChild(el('span', 'lm-sp', ' ')); return; }
          var id = n + ':' + ci, s = el('span', 'lm-ch', esc(ch)); s.setAttribute('data-id', id);
          s.onclick = function () { var k = MK.indexOf(marks[id] || ''); marks[id] = MK[k + 1] || ''; if (!marks[id]) delete marks[id]; LS.set(key, marks); paint(); };
          row.appendChild(s); ci++;
        });
        box.appendChild(row);
      });
      l.classList.toggle('long', li > 4);
      tv.disabled = !Object.keys(teacher).length;
      paint();
    }
    function paint() {
      var showT = l.classList.contains('show-t'), hit = 0, tot = Object.keys(teacher).length;
      $$('.lm-ch', l).forEach(function (s) {
        var id = s.getAttribute('data-id'), m = marks[id] || '', t = teacher[id] || '';
        s.setAttribute('data-m', m); s.setAttribute('data-k', MK.indexOf(m)); s.setAttribute('data-t', showT ? t : '');
        s.classList.toggle('match', showT && !!t && m === t);
        if (t && m === t) hit++;
      });
      var note = src === 'sheet' ? '（歌詞來自課程試算表）' : src === 'local' ? '（老師貼上的完整歌詞）' : '（預設片段，可按「貼上完整歌詞」換成整首主副歌）';
      msg.textContent = showT ? '和老師版相同的記號：' + hit + ' / ' + tot + '。' + (MK[0] === '∨' ? '換氣點沒有唯一解，重點是唱到句尾還有氣。' : '') : hint + note;
    }
    sd.onclick = function () {
      if (!Object.keys(marks).length) { say('請先在歌詞上點出記號', 'warn'); return; }
      var text = $$('.lm-line', l).map(function (row) { return $$('.lm-ch', row).map(function (s) { return s.textContent + (marks[s.getAttribute('data-id')] || ''); }).join(''); }).join(' / ');
      var hit = Object.keys(teacher).filter(function (k) { return marks[k] === teacher[k]; }).length;
      if (window.PixelBackend) window.PixelBackend.send('lyric', { item: lid, result: text, value: hit, detail: { teacherMarks: Object.keys(teacher).length, source: src } }, { slide: slideNo(l), okMsg: MK[0] === '∨' ? '換氣點已送出' : '標記已送出' });
    };
    tv.onclick = function () { l.classList.toggle('show-t'); tv.textContent = l.classList.contains('show-t') ? '隱藏老師版' : '對照老師版'; paint(); };
    cl.onclick = function () { marks = {}; LS.set(key, marks); paint(); };
    ed.onclick = function () { ta.value = LS.get(base + '-custom', '') || ''; l.classList.add('editing'); ta.focus(); };
    editor.querySelector('.lm-cancel').onclick = function () { l.classList.remove('editing'); };
    editor.querySelector('.lm-save').onclick = function () {
      var v = ta.value.trim(); if (!v) { say('請先貼上歌詞', 'warn'); return; }
      LS.set(base + '-custom', v); l.classList.remove('editing'); render(v, 'local');
    };
    editor.querySelector('.lm-reset').onclick = function () { try { localStorage.removeItem('pixel:' + base + '-custom'); } catch (e) {} l.classList.remove('editing'); render(fallback, 'default'); };
    ta.addEventListener('keydown', function (e) { e.stopPropagation(); });
    var custom = LS.get(base + '-custom', '');
    if (custom) render(custom, 'local');
    else {
      render(fallback, 'default');
      if (window.PixelBackend && window.PixelBackend.fetchLyrics) window.PixelBackend.fetchLyrics(lid).then(function (t) { if (t && !LS.get(base + '-custom', '')) render(t, 'sheet'); });
    }
  });

  /* ---------- 14. 出場券 ---------- */
  $$('.exit').forEach(function (x) {
    // data-key：同一堂第二份表單（例：模仿筆記），data-label 為表單名稱
    var xk = x.getAttribute('data-key'), label = x.getAttribute('data-label') || '出場券';
    var key = 'exit-' + LESSON + (xk ? '-' + xk : ''), prompts = x.getAttribute('data-prompts').split('|'), st = LS.get(key, {});
    prompts.forEach(function (pr, k) {
      var f = el('label', 'exit-field', '<span>' + esc(pr) + '</span><textarea rows="2"></textarea>');
      var ta = f.querySelector('textarea'); ta.value = st[k] || '';
      ta.oninput = function () { st[k] = ta.value; LS.set(key, st); };
      x.appendChild(f);
    });
    var foot = el('div', 'btn-row'), cp = btn('複製文字'), msg = el('span', 'muted'), sd = btn('送出給老師', 'primary');
    foot.appendChild(sd);
    sd.onclick = function () {
      if (!prompts.some(function (p, k) { return st[k] && st[k].trim(); })) { say('請先填寫' + label, 'warn'); return; }
      if (!window.PixelBackend) return;
      if (xk) window.PixelBackend.send('note', { item: label, result: prompts.map(function (p, k) { return p + '：' + (st[k] || ''); }).join('／'), detail: { prompts: prompts, answers: prompts.map(function (p, k) { return st[k] || ''; }) } }, { slide: slideNo(x), okMsg: label + '已送出' });
      else window.PixelBackend.send('exit', { answers: prompts.map(function (p, k) { return st[k] || ''; }) }, { slide: slideNo(x), okMsg: '出場券已送出' });
    };
    cp.onclick = function () {
      var title = document.body.getAttribute('data-title') || document.title;
      var text = title + ' ' + label + '\n' + prompts.map(function (p, k) { return '■ ' + p + '\n' + (st[k] || ''); }).join('\n');
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
    var lf = el('div', 'btn-row pb-send'), ls = btn('送出紀錄給老師', 'primary'); lf.appendChild(ls); t.appendChild(lf);
    ls.onclick = function () {
      var rows = []; for (var d = 0; d < 7; d++) rows.push([d + 1].concat(cols.map(function (_, c) { return st[d + '-' + c] || ''; })));
      if (!rows.some(function (r) { return r.slice(1).some(function (v) { return String(v).trim(); }); })) { say('請先填寫紀錄', 'warn'); return; }
      if (window.PixelBackend) window.PixelBackend.send('log7', { rows: rows, columns: cols }, { slide: slideNo(t), okMsg: '練習紀錄已送出' });
    };
    t.appendChild(el('p', 'muted log7-note', '填在自己的手機上，按「送出紀錄給老師」就會存進課程試算表。'));
  });

  /* ---------- 16. 作業勾選 ---------- */
  $$('.checks[data-id]').forEach(function (u) {
    var key = 'checks-' + u.getAttribute('data-id'), st = LS.get(key, []);
    $$('li', u).forEach(function (li, k) {
      li.classList.toggle('done', !!st[k]); li.tabIndex = 0; li.setAttribute('role', 'checkbox');
      var tg = function () { st[k] = !st[k]; li.classList.toggle('done', !!st[k]); li.setAttribute('aria-checked', !!st[k]); LS.set(key, st); report(u, 'homework', { item: li.textContent.replace(/▶/g, '').trim(), result: st[k] ? '完成' : '取消', value: st[k] ? 1 : 0 }); };
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
