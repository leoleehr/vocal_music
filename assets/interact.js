/* ===== Pixel Studio 課堂互動元件 =====
 * 互動狀態存在這台裝置的瀏覽器（localStorage）；作答與成果經 backend.js 送到課程試算表。
 * 元件以 class 宣告在投影片中，載入時自動建立：
 *   .quiz .poll .reveal .picker .score .wavelab .pitch .siren .resolab .scalepractice .staccato .stopwatch .mirror .dynmap .range .transpose .zero
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

  /* ---------- 下載／分享檔案 ----------
   * 手機優先用系統分享選單（可存到照片、檔案）；LINE、Facebook 等 App 內建瀏覽器會擋下載，改用長按儲存或提示改用瀏覽器開啟。
   */
  var IN_APP = /Line\/|FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK/i.test(navigator.userAgent);
  var TOUCH = !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  function saveFile(blob, name) {
    var file = null; try { file = new File([blob], name, { type: blob.type }); } catch (e) {}
    if (TOUCH && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(function (err) { if (!err || err.name !== 'AbortError') saveSheet(blob, name); });
      return;
    }
    if (IN_APP) { saveSheet(blob, name); return; }
    var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }
  function saveSheet(blob, name) {
    var isImg = /^image\//.test(blob.type);
    var sh = el('div', 'save-sheet', '<div class="ss-card" role="dialog" aria-label="儲存檔案"><button type="button" class="ss-x" aria-label="關閉">×</button><h3>' + (isImg ? '長按圖片即可儲存' : '這個瀏覽器無法直接下載錄音') + '</h3><div class="ss-body"></div><p class="ss-tip">' + (isImg ? '長按上方圖片，選「儲存圖片」或「加入照片」。' : '點右上角選單，選「用預設瀏覽器開啟」（Safari 或 Chrome）後再下載；也可以直接按「上傳給老師」。') + '</p></div>');
    var body = sh.querySelector('.ss-body'), r = new FileReader();
    r.onload = function () { body.innerHTML = isImg ? '<img alt="">' : '<audio controls></audio>'; body.firstChild.src = r.result; };
    r.readAsDataURL(blob);
    sh.addEventListener('click', function (e) { if (e.target === sh || e.target.classList.contains('ss-x')) sh.remove(); });
    document.body.appendChild(sh);
  }

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

  /* ---------- 共鳴觀測站：音高與音量即時曲線，錄下後標記共鳴腔體 ---------- */
  $$('.resolab').forEach(function (p) {
    var MAXS = parseInt(p.getAttribute('data-max'), 10) || 20, LO = 40, HI = 84, DBLO = -60, DBHI = 0, FPS_MS = 33;
    var ZONES = [{ k: 'chest', name: '胸腔', col: '#45b3e6' }, { k: 'mouth', name: '口腔', col: '#C7AF4A' }, { k: 'head', name: '頭腔', col: '#ec4a36' }];
    var key = 'resolab-' + LESSON, saved = LS.get(key, null);
    var data = saved ? saved.data : [], marks = saved ? saved.marks : [], sel = null, drag = null;
    var an = null, raf = 0, t0 = 0, last = 0, rec = null, chunks = [], blob = null, url = '', recent = [], playing = false;
    p.innerHTML = '<div class="rl-read"><div><small>音高</small><b class="rl-note">--</b><span class="rl-hz"></span></div><div><small>音量</small><b class="rl-db">--</b><span class="rl-bar"><i></i></span></div><div><small>錄製</small><b class="rl-time">0.0 秒</b></div></div>' +
      '<canvas class="rl-cv"></canvas><div class="rl-legend"><span class="lg-pitch">— 音高</span><span class="lg-vol">▇ 音量</span><span class="lg-ov">▨ 聲區</span><span class="muted">錄完後在圖上拖曳選一段，再按腔體按鈕標記；兩種共鳴重疊的地方就是聲區</span></div>' +
      '<div class="btn-row rl-main"><button type="button" class="btn primary go">● 開始錄製</button><button type="button" class="btn play" disabled>▶ 播放</button><button type="button" class="btn clear">清除</button><span class="rl-sep"></span>' + ZONES.map(function (z) { return '<button type="button" class="btn rl-z" data-z="' + z.k + '" disabled style="--zc:' + z.col + '">標記為' + z.name + '</button>'; }).join('') + '</div>' +
      '<ul class="rl-marks"></ul><p class="rl-sum"></p>' +
      '<div class="btn-row rl-out"><button type="button" class="btn png">下載觀測圖</button><a class="btn wav" href="#">下載錄音</a><button type="button" class="btn primary up">上傳給老師</button></div><audio class="rl-audio"></audio>';
    var cv = p.querySelector('canvas'), go = p.querySelector('.go'), play = p.querySelector('.play'), au = p.querySelector('audio'), wav = p.querySelector('.wav');
    var noteEl = p.querySelector('.rl-note'), hzEl = p.querySelector('.rl-hz'), dbEl = p.querySelector('.rl-db'), barEl = p.querySelector('.rl-bar i'), timeEl = p.querySelector('.rl-time');
    var buf = new Float32Array(2048);
    function zoneOf(k) { return ZONES.filter(function (z) { return z.k === k; })[0]; }
    function dur() { return Math.max(MAXS, data.length ? data[data.length - 1].t / 1000 : 0); }
    function geo() {
      var c = canvasFit(cv), L = 42, R = 40, T = 10, B = 22, w = c.w - L - R, h = c.h - T - B;
      return { c: c, L: L, T: T, w: w, h: h, X: function (t) { return L + t / dur() * w; }, Tm: function (x) { return Math.max(0, Math.min(dur(), (x - L) / w * dur())); }, Yp: function (m) { return T + h - (m - LO) / (HI - LO) * h; }, Yv: function (d) { return T + h - (d - DBLO) / (DBHI - DBLO) * h; } };
    }
    function stats(a, b) {
      var s = data.filter(function (d) { return d.t / 1000 >= a && d.t / 1000 <= b; });
      var ps = s.filter(function (d) { return d.m !== null; }).map(function (d) { return d.m; }).sort(function (x, y) { return x - y; });
      var vs = s.filter(function (d) { return d.m !== null; }).map(function (d) { return d.db; });
      if (!ps.length) return null;
      var q = function (r) { return ps[Math.min(ps.length - 1, Math.floor(r * (ps.length - 1)))]; };
      return { lo: q(0.1), hi: q(0.9), mid: q(0.5), db: vs.reduce(function (x, y) { return x + y; }, 0) / vs.length };
    }
    function draw(head) {
      var g = geo(), x = g.c.x;
      x.clearRect(0, 0, g.c.w, g.c.h);
      x.font = '11px ' + css('--display'); x.textBaseline = 'middle';
      for (var o = 48; o <= HI; o += 12) { x.strokeStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.moveTo(g.L, g.Yp(o)); x.lineTo(g.L + g.w, g.Yp(o)); x.stroke(); x.fillStyle = 'rgba(255,255,255,.45)'; x.textAlign = 'right'; x.fillText(nameOf(o).name, g.L - 6, g.Yp(o)); }
      x.textAlign = 'left'; x.fillStyle = 'rgba(69,179,230,.7)';
      [-60, -40, -20, 0].forEach(function (d) { x.fillText(d + ' dB', g.L + g.w + 4, Math.min(g.T + g.h - 4, Math.max(g.T + 6, g.Yv(d)))); });
      x.textAlign = 'center'; x.fillStyle = 'rgba(255,255,255,.4)';
      for (var s = 0; s <= dur(); s += 5) x.fillText(s + 's', g.X(s), g.T + g.h + 12);
      marks.forEach(function (mk) { var z = zoneOf(mk.z); x.fillStyle = z.col + '2a'; x.fillRect(g.X(mk.a), g.T, g.X(mk.b) - g.X(mk.a), g.h); x.fillStyle = z.col; x.font = '700 13px "Noto Sans TC",sans-serif'; x.fillText(z.name, (g.X(mk.a) + g.X(mk.b)) / 2, g.T + 12 + (mk.z === 'mouth' ? 16 : 0)); x.font = '11px ' + css('--display'); });
      overlaps().forEach(function (o) { // 聲區：斜線網底
        var x1 = g.X(o.a), x2 = g.X(o.b); x.save(); x.beginPath(); x.rect(x1, g.T, x2 - x1, g.h); x.clip();
        x.strokeStyle = 'rgba(255,255,255,.38)'; x.lineWidth = 1.5; for (var k = x1 - g.h; k < x2; k += 7) { x.beginPath(); x.moveTo(k, g.T + g.h); x.lineTo(k + g.h, g.T); x.stroke(); }
        x.restore(); x.lineWidth = 1; x.fillStyle = '#fff'; x.font = '700 12px "Noto Sans TC",sans-serif'; x.fillText('聲區', (x1 + x2) / 2, g.T + g.h - 10); x.font = '11px ' + css('--display');
      });
      if (sel) { x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(g.X(sel.a), g.T, g.X(sel.b) - g.X(sel.a), g.h); x.strokeStyle = 'rgba(255,255,255,.6)'; x.setLineDash([4, 4]); x.strokeRect(g.X(sel.a), g.T, g.X(sel.b) - g.X(sel.a), g.h); x.setLineDash([]); }
      // 音量：底部的填色區
      x.fillStyle = 'rgba(69,179,230,.28)'; x.beginPath(); x.moveTo(g.X(0), g.T + g.h);
      data.forEach(function (d) { x.lineTo(g.X(d.t / 1000), g.Yv(Math.max(DBLO, d.db))); });
      if (data.length) x.lineTo(g.X(data[data.length - 1].t / 1000), g.T + g.h);
      x.closePath(); x.fill();
      // 音高：線
      x.strokeStyle = css('--amber'); x.lineWidth = 3; x.beginPath(); var on = false;
      data.forEach(function (d) { if (d.m === null || d.m < LO || d.m > HI) { on = false; return; } var X = g.X(d.t / 1000), Y = g.Yp(d.m); on ? x.lineTo(X, Y) : x.moveTo(X, Y); on = true; });
      x.stroke(); x.lineWidth = 1;
      if (head !== undefined) { x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(g.X(head), g.T); x.lineTo(g.X(head), g.T + g.h); x.stroke(); }
    }
    function rng(st) { var a = nameOf(st.lo).name, b = nameOf(st.hi).name; return a === b ? a : a + '–' + b; }
    function zi(k) { return ZONES.map(function (z) { return z.k; }).indexOf(k); }
    function overlaps() { // 不同共鳴的標記重疊處＝聲區（共鳴轉換的位置）
      var out = [];
      for (var i = 0; i < marks.length; i++) for (var j = i + 1; j < marks.length; j++) {
        var m1 = marks[i], m2 = marks[j]; if (m1.z === m2.z) continue;
        var a = Math.max(m1.a, m2.a), b = Math.min(m1.b, m2.b); if (b - a < 0.1) continue;
        var lo = zi(m1.z) < zi(m2.z) ? m1 : m2, hi = lo === m1 ? m2 : m1;
        out.push({ a: a, b: b, from: lo.z, to: hi.z });
      }
      return out.sort(function (x, y) { return x.a - y.a; });
    }
    function listMarks() {
      var ul = p.querySelector('.rl-marks');
      ul.innerHTML = marks.map(function (mk, i) {
        var z = zoneOf(mk.z), st = stats(mk.a, mk.b);
        return '<li style="--zc:' + z.col + '"><b>' + z.name + '</b> ' + mk.a.toFixed(1) + '–' + mk.b.toFixed(1) + ' 秒　' + (st ? '音高 ' + rng(st) + '（中位 ' + nameOf(st.mid).name + '）　平均音量 ' + Math.round(st.db) + ' dB' : '這段沒有偵測到聲音') + ' <button type="button" class="rl-del" data-i="' + i + '" aria-label="刪除標記">×</button></li>';
      }).join('') + overlaps().map(function (o) {
        var st = stats(o.a, o.b);
        return '<li class="rl-ov"><b>聲區</b> ' + zoneOf(o.from).name + '↔' + zoneOf(o.to).name + '　' + o.a.toFixed(1) + '–' + o.b.toFixed(1) + ' 秒　' + (st ? '音高 ' + rng(st) + '（約 ' + nameOf(st.mid).name + '）　平均音量 ' + Math.round(st.db) + ' dB' : '這段沒有偵測到聲音') + '</li>';
      }).join('');
      $$('.rl-del', ul).forEach(function (b) { b.onclick = function () { marks.splice(+b.getAttribute('data-i'), 1); save(); refresh(); }; });
      var ch = marks.filter(function (m) { return m.z === 'chest'; })[0], hd = marks.filter(function (m) { return m.z === 'head'; })[0], sum = p.querySelector('.rl-sum');
      var a = ch && stats(ch.a, ch.b), b = hd && stats(hd.a, hd.b), parts = [];
      var ov = overlaps().map(function (o) { var st = stats(o.a, o.b); return st ? zoneOf(o.from).name + '→' + zoneOf(o.to).name + ' 約 <b>' + nameOf(st.mid).name + '</b>' + (rng(st) === nameOf(st.mid).name ? '' : '（' + rng(st) + '）') : null; }).filter(Boolean);
      if (ov.length) parts.push('共鳴轉換位置（聲區）：' + ov.join('；'));
      if (a && b) {
        var dm = Math.round(b.mid - a.mid), dd = Math.round(b.db - a.db);
        parts.push('胸腔 → 頭腔：音高 <b>' + (dm >= 0 ? '+' : '') + dm + ' 半音</b>（' + nameOf(a.mid).name + ' → ' + nameOf(b.mid).name + '），音量 <b>' + (dd >= 0 ? '+' : '') + dd + ' dB</b>' + (dd < -2 ? '：音高往上，音量明顯變小。' : dd > 2 ? '：音量反而變大，可能還在用胸腔往上推。' : '：音量差不多，試著讓頭腔更放鬆。'));
      }
      if (!parts.length && marks.length) parts.push('再標記一段胸腔與一段頭腔，就能比較音高與音量；兩段重疊的地方會標成聲區。');
      sum.innerHTML = parts.join('<br>');
    }
    function save() { LS.set(key, { data: data, marks: marks }); }
    function refresh() { listMarks(); draw(); $$('.rl-z', p).forEach(function (b) { b.disabled = !sel || !data.length; }); }
    function loop() {
      raf = requestAnimationFrame(loop);
      var now = performance.now(); if (now - last < FPS_MS) return; last = now;
      an.getFloatTimeDomainData(buf);
      var r = 0; for (var i = 0; i < buf.length; i++) r += buf[i] * buf[i]; r = Math.sqrt(r / buf.length);
      var db = r > 0 ? Math.max(DBLO, 20 * Math.log10(r)) : DBLO;
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      var mm = ok.length === 3 ? ok[1] : null, t = now - t0;
      data.push({ t: Math.round(t), m: mm === null ? null : +mm.toFixed(2), db: +db.toFixed(1) });
      noteEl.textContent = mm === null ? '--' : nameOf(mm).name; hzEl.textContent = mm === null ? '' : Math.round(freqOf(mm)) + ' Hz';
      dbEl.textContent = Math.round(db) + ' dB'; barEl.style.width = Math.max(0, (db - DBLO) / (DBHI - DBLO) * 100) + '%';
      timeEl.textContent = (t / 1000).toFixed(1) + ' 秒';
      draw();
      if (t >= MAXS * 1000) stop();
    }
    function stop() {
      cancelAnimationFrame(raf); raf = 0;
      if (rec && rec.state !== 'inactive') rec.stop();
      if (an) { an = null; micStop(); }
      go.textContent = '● 重新錄製'; save(); refresh();
    }
    go.onclick = function () {
      if (raf) return stop();
      micStart().then(function (a) {
        an = a; data = []; marks = []; sel = null; recent = []; t0 = performance.now(); last = 0; blob = null;
        p.classList.remove('has');
        if (window.MediaRecorder) {
          var type = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
          rec = new MediaRecorder(mic.stream, { mimeType: type }); chunks = [];
          rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
          rec.onstop = function () {
            blob = new Blob(chunks, { type: type }); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
            au.src = url; wav.download = '共鳴轉換_' + stamp() + (type === 'audio/webm' ? '.webm' : '.m4a');
            wav.onclick = function (e) { e.preventDefault(); saveFile(blob, wav.download); };
            p.classList.add('has'); play.disabled = false;
          };
          rec.start();
        }
        go.textContent = '■ 停止'; refresh(); loop();
      }).catch(function () { timeEl.textContent = '無法使用麥克風'; });
    };
    function stamp() { var d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0'); }
    play.onclick = function () {
      if (playing) { au.pause(); return; }
      au.currentTime = sel ? sel.a : 0; au.play(); playing = true; play.textContent = '■ 停止播放';
      (function tick() { if (!playing) return; draw(au.currentTime); if (sel && au.currentTime >= sel.b) { au.pause(); return; } requestAnimationFrame(tick); })();
    };
    au.onpause = au.onended = function () { playing = false; play.textContent = '▶ 播放'; draw(); };
    function px(e) { var r = cv.getBoundingClientRect(); return e.clientX - r.left; }
    cv.addEventListener('pointerdown', function (e) { if (raf || !data.length) return; var g = geo(); drag = g.Tm(px(e)); sel = { a: drag, b: drag }; cv.setPointerCapture(e.pointerId); draw(); });
    cv.addEventListener('pointermove', function (e) { if (drag === null) return; var t = geo().Tm(px(e)); sel = { a: Math.min(drag, t), b: Math.max(drag, t) }; draw(); });
    cv.addEventListener('pointerup', function () { if (drag === null) return; drag = null; if (sel && sel.b - sel.a < 0.2) sel = null; refresh(); });
    $$('.rl-z', p).forEach(function (b) {
      b.onclick = function () { if (!sel) return; var zk = b.getAttribute('data-z'); marks = marks.filter(function (m) { return m.z !== zk || m.b <= sel.a || m.a >= sel.b; }); marks.push({ z: zk, a: +sel.a.toFixed(2), b: +sel.b.toFixed(2) }); marks.sort(function (x, y) { return x.a - y.a; }); sel = null; save(); refresh(); };
    });
    p.querySelector('.clear').onclick = function () { if (raf) stop(); data = []; marks = []; sel = null; blob = null; p.classList.remove('has'); play.disabled = true; go.textContent = '● 開始錄製'; save(); refresh(); timeEl.textContent = '0.0 秒'; };
    function snapshot() { // 觀測圖 PNG：標題、曲線、標記與比較結果
      var lines = $$('.rl-marks li', p).map(function (li) { return li.textContent.replace('×', '').trim(); }).concat(p.querySelector('.rl-sum').innerText.split('\n')).filter(Boolean).slice(0, 8);
      var g = geo(), out = document.createElement('canvas'), r = window.devicePixelRatio || 1, W = g.c.w, H = g.c.h + 52 + lines.length * 17;
      out.width = W * r; out.height = H * r; var x = out.getContext('2d'); x.scale(r, r);
      x.fillStyle = '#101210'; x.fillRect(0, 0, W, H);
      x.fillStyle = '#f3f0e9'; x.font = '700 16px "Noto Sans TC",sans-serif'; x.textBaseline = 'top';
      var who = (window.PixelBackend && window.PixelBackend.profile && window.PixelBackend.profile()) || {};
      x.fillText('共鳴轉換觀測圖　' + (who.name || '') + '　' + stamp().replace('_', ' '), 12, 10);
      x.drawImage(cv, 0, 36, W, g.c.h);
      x.font = '13px "Noto Sans TC",sans-serif'; x.fillStyle = '#C7AF4A';
      lines.forEach(function (l, i) { x.fillText(l, 12, 44 + g.c.h + i * 17); });
      return out;
    }
    p.querySelector('.png').onclick = function () {
      if (!data.length) { say('先錄一段共鳴轉換', 'warn'); return; }
      snapshot().toBlob(function (img) { saveFile(img, '共鳴觀測圖_' + stamp() + '.png'); }, 'image/png');
    };
    p.querySelector('.up').onclick = function () {
      if (!data.length) { say('先錄一段共鳴轉換', 'warn'); return; }
      var summary = { marks: marks.map(function (mk) { var st = stats(mk.a, mk.b); return { zone: zoneOf(mk.z).name, from: mk.a, to: mk.b, low: st && nameOf(st.lo).name, high: st && nameOf(st.hi).name, db: st && Math.round(st.db) }; }), zones: overlaps().map(function (o) { var st = stats(o.a, o.b); return { between: zoneOf(o.from).name + '↔' + zoneOf(o.to).name, from: o.a, to: o.b, pitch: st && nameOf(st.mid).name, low: st && nameOf(st.lo).name, high: st && nameOf(st.hi).name }; }), summary: p.querySelector('.rl-sum').innerText };
      report(p, 'resonance', { item: '共鳴轉換', result: summary.marks.map(function (m) { return m.zone + ' ' + (m.low || '--') + '–' + (m.high || '--') + ' ' + (m.db === null ? '' : m.db + ' dB'); }).join('／') || '未標記', detail: summary });
      if (!window.PixelBackend) return;
      snapshot().toBlob(function (img) {
        window.PixelBackend.upload(img, { label: '共鳴觀測圖', seconds: '', filename: '共鳴觀測圖_' + stamp() + '.png', slide: slideNo(p) }).then(function () {
          if (blob) window.PixelBackend.upload(blob, { label: '共鳴轉換錄音', seconds: Math.round(dur()), filename: wav.download, slide: slideNo(p) });
        });
      }, 'image/png');
    };
    window.addEventListener('resize', function () { draw(); });
    refresh(); onLeave(p, function () { if (raf) stop(); au.pause(); });
  });

  /* ---------- 跟唱練習：音階發聲（.scalepractice）與促音和弦（.staccato），不用麥克風 ----------
   * 男聲／女聲選起始音，拍速與半音可調；每輪前 4 拍預備（主和弦提示音高），可設定每輪自動升半音、輪換母音
   */
  var KEYN = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  var MAJ = [0, 2, 4, 5, 7, 9, 11], SOLFA = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], QUAL = ['', 'm', 'm', '', '', 'm', 'dim'], VOWELS = ['[a]', '[i]', '[u]', '[e]', '[o]'];
  function degMidi(start, k) { return start + 12 * Math.floor(k / 7) + MAJ[((k % 7) + 7) % 7]; }
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'], FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  function chordName(start, d) { var k = start % 12, names = [2, 4, 6, 7, 9, 11].indexOf(k) > -1 ? SHARP : FLAT; return names[(start + MAJ[d]) % 12] + QUAL[d]; } // 升記號調用升名、降記號調用降名
  /* 五線譜：高音譜號（男聲用低八度高音譜號，譜號下標 8），依調號畫升降記號，音符以 E4（第一線）為基準計算位置 */
  var KEY_LETTER = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6], KEY_SIG = { 0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: 6, 5: -1, 10: -2, 3: -3, 8: -4, 1: -5 };
  var SHARP_POS = [8, 5, 9, 6, 3, 7, 4], FLAT_POS = [4, 7, 3, 6, 2, 5, 1];
  function tonicStep(start, male) { var w = start + (male ? 12 : 0); return KEY_LETTER[start % 12] + 7 * (Math.floor(w / 12) - 1) - 30; }
  // notes: [{ s: 譜表位置（E4=0，每格 1）, len: 'q'|'e'|'w' }]；groups：要連桁的八分音符索引；bars：在哪個音之後畫小節線
  function staffSVG(notes, start, male, groups, bars) {
    var Y = function (st) { return 70 - st * 5; }, ks = KEY_SIG[start % 12], n = Math.abs(ks);
    var x0 = 44 + n * 9 + 8, dx = Math.max(26, Math.min(40, 560 / notes.length)), W = x0 + notes.length * dx + 14, h = '';
    for (var l = 0; l <= 8; l += 2) h += '<line class="sf-l" x1="2" x2="' + (W - 4) + '" y1="' + Y(l) + '" y2="' + Y(l) + '"/>';
    h += '<text class="sf-clef" x="4" y="' + Y(2) + '">𝄞</text>' + (male ? '<text class="sf-8" x="15" y="' + (Y(-3) + 9) + '">8</text>' : '');
    for (var i = 0; i < n; i++) { var pos = ks > 0 ? SHARP_POS[i] : FLAT_POS[i]; h += '<text class="sf-acc" x="' + (40 + i * 9) + '" y="' + (Y(pos) + (ks > 0 ? 5 : 3)) + '">' + (ks > 0 ? '♯' : '♭') + '</text>'; }
    var xs = notes.map(function (_, i) { return x0 + i * dx + dx / 2; });
    var inGroup = {}; (groups || []).forEach(function (g) { var avg = g.reduce(function (a, k) { return a + notes[k].s; }, 0) / g.length, up = avg < 4; g.forEach(function (k) { inGroup[k] = { g: g, up: up }; }); });
    notes.forEach(function (nt, i) {
      var x = xs[i], y = Y(nt.s), up = inGroup[i] ? inGroup[i].up : nt.s < 4, led = '';
      for (var a = -2; a >= nt.s; a -= 2) led += '<line class="sf-l" x1="' + (x - 9) + '" x2="' + (x + 9) + '" y1="' + Y(a) + '" y2="' + Y(a) + '"/>';
      for (var b = 10; b <= nt.s; b += 2) led += '<line class="sf-l" x1="' + (x - 9) + '" x2="' + (x + 9) + '" y1="' + Y(b) + '" y2="' + Y(b) + '"/>';
      var head = nt.len === 'w' ? '<ellipse class="sf-open" cx="' + x + '" cy="' + y + '" rx="6.4" ry="4.4" transform="rotate(-20 ' + x + ' ' + y + ')"/>' : '<ellipse cx="' + x + '" cy="' + y + '" rx="5.6" ry="4" transform="rotate(-20 ' + x + ' ' + y + ')"/>';
      var stem = '', sx = up ? x + 5.2 : x - 5.2;
      if (nt.len !== 'w') {
        var tip = up ? y - 30 : y + 30;
        if (inGroup[i]) { var g = inGroup[i].g, ends = g.map(function (k) { return Y(notes[k].s); }); tip = up ? Math.min.apply(null, ends) - 28 : Math.max.apply(null, ends) + 28; }
        stem = '<line class="sf-stem" x1="' + sx + '" x2="' + sx + '" y1="' + y + '" y2="' + tip + '"/>';
        if (nt.dot) stem += '<circle cx="' + x + '" cy="' + (up ? y + 9 : y - 9) + '" r="1.8"/>';
      }
      h += '<g class="sn" data-i="' + i + '">' + led + head + stem + '</g>';
    });
    (groups || []).forEach(function (g) { var a = g[0], b = g[g.length - 1], up = inGroup[a].up, ends = g.map(function (k) { return Y(notes[k].s); }), tip = up ? Math.min.apply(null, ends) - 28 : Math.max.apply(null, ends) + 28, x1 = xs[a] + (up ? 5.2 : -5.2), x2 = xs[b] + (up ? 5.2 : -5.2); h += '<line class="sf-beam" x1="' + x1 + '" x2="' + x2 + '" y1="' + tip + '" y2="' + tip + '"/>'; });
    (bars || []).forEach(function (k) { var bx = xs[k] + dx / 2; h += '<line class="sf-bar" x1="' + bx + '" x2="' + bx + '" y1="' + Y(8) + '" y2="' + Y(0) + '"/>'; });
    h += '<line class="sf-bar" x1="' + (W - 8) + '" x2="' + (W - 8) + '" y1="' + Y(8) + '" y2="' + Y(0) + '"/><line class="sf-end" x1="' + (W - 4) + '" x2="' + (W - 4) + '" y1="' + Y(8) + '" y2="' + Y(0) + '"/>';
    return '<svg viewBox="0 -8 ' + W + ' 116" role="img" aria-label="五線譜">' + h + '</svg>';
  }
  function practice(p, kind) {
    var isScale = kind === 'scale', key = kind + '-' + LESSON;
    var RANGE = { male: [40, 57], female: [52, 69] }, DEF = { male: 48, female: 60 };
    var st = LS.get(key, null) || { voice: 'male', start: 48, bpm: 70, vowel: 0, rotate: true, up: isScale, loop: true, click: true, back: false, rec: 0 };
    var ctx = null, master = null, events = [], t0 = 0, raf = 0, timer = 0, round = 0, cur = -1, playing = false, pend = null;
    function opts() { var r = RANGE[st.voice], h = ''; for (var m = r[0]; m <= r[1]; m++) h += '<option value="' + m + '"' + (m === st.start ? ' selected' : '') + '>' + nameOf(m).name + '（' + KEYN[m % 12] + ' 調）</option>'; return h; }
    p.innerHTML = '<div class="pr-ctrl">' +
      '<div class="pr-seg voice"><button type="button" class="btn" data-v="male">男聲</button><button type="button" class="btn" data-v="female">女聲</button></div>' +
      '<label class="pr-f">起始音<select class="start"></select></label>' +
      '<div class="pr-f">音高<span class="pr-step"><button type="button" class="btn dn">− 半音</button><button type="button" class="btn upk">＋ 半音</button></span></div>' +
      '<div class="pr-f">拍速<span class="pr-step"><button type="button" class="btn bdn">−5</button><b class="bpm"></b><button type="button" class="btn bup">＋5</button></span></div></div>' +
      '<div class="pr-ctrl pr-opt"><span class="pr-vowels">' + VOWELS.map(function (v, i) { return '<button type="button" class="btn vw" data-i="' + i + '">' + v + '</button>'; }).join('') + '</span>' +
      '<label><input type="checkbox" class="o-rotate"> 每輪換母音</label><label><input type="checkbox" class="o-up"> 每輪升半音</label><label><input type="checkbox" class="o-loop"> 連續練習</label><label><input type="checkbox" class="o-click"> 節拍聲</label>' +
      (isScale ? '' : '<label><input type="checkbox" class="o-back"> 和弦走完再下行</label>') + '</div>' +
      '<div class="pr-now"><div class="pr-big">--</div><div class="pr-sub"></div></div>' +
      (isScale ? '' : '<div class="pr-chords"></div>') + '<div class="pr-staff"></div><div class="pr-cells"></div>' +
      '<div class="btn-row pr-run"><button type="button" class="btn primary go">▶ 開始跟唱</button>' + (isScale ? '' : '<button type="button" class="btn pass">唱穩了 +5 BPM</button><span class="pr-rec"></span>') + '<span class="pr-msg muted"></span></div>';
    var sel = p.querySelector('.start'), big = p.querySelector('.pr-big'), sub = p.querySelector('.pr-sub'), cells = p.querySelector('.pr-cells'), staffEl = p.querySelector('.pr-staff'), shownChord = -1, chordsEl = p.querySelector('.pr-chords'), msg = p.querySelector('.pr-msg'), go = p.querySelector('.go');
    function save() { LS.set(key, st); }
    function chordOrder() { var up = [0, 1, 2, 3, 4, 5, 6]; return st.back ? up.concat([5, 4, 3, 2, 1, 0]) : up; }
    var SCALE_DEG = [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0], ST_PAT = [0, 2, 4, 2, 0, 2, 4, 2];
    function drawStaff(ci) {
      var male = st.voice === 'male', ts = tonicStep(st.start, male);
      if (isScale) staffEl.innerHTML = staffSVG(SCALE_DEG.map(function (k, i) { return { s: ts + k, len: i === SCALE_DEG.length - 1 ? 'w' : 'q' }; }), st.start, male, [], [3, 7, 11]);
      else { var d = chordOrder()[ci || 0]; staffEl.innerHTML = staffSVG(ST_PAT.map(function (o) { return { s: ts + d + o, len: 'e', dot: true }; }).concat([{ s: ts + d, len: 'q', dot: true }]), st.start, male, [[0, 1, 2, 3], [4, 5, 6, 7]], [7]); }
      shownChord = ci || 0;
    }
    function jian(k) { return (k % 7 + 1) + (k >= 7 ? '̇' : ''); }
    function paintStatic() {
      $$('.voice .btn', p).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === st.voice); });
      sel.innerHTML = opts(); p.querySelector('.bpm').textContent = st.bpm + ' BPM';
      $$('.vw', p).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-i') === st.vowel); });
      ['rotate', 'up', 'loop', 'click', 'back'].forEach(function (o) { var c = p.querySelector('.o-' + o); if (c) c.checked = !!st[o]; });
      if (isScale) cells.innerHTML = SCALE_DEG.map(function (k, i) { var last = i === SCALE_DEG.length - 1; return '<span class="pr-cell' + (last ? ' hold' : '') + '" data-i="' + i + '"><b>' + jian(k) + '</b><small>' + SOLFA[k % 7] + (last ? '・4 拍' : '') + '</small></span>'; }).join('');
      else {
        chordsEl.innerHTML = chordOrder().map(function (d, i) { return '<span class="pr-chip" data-i="' + i + '">' + chordName(st.start, d) + '</span>'; }).join('');
        cells.innerHTML = ST_PAT.map(function (o, i) { return '<span class="pr-cell sm" data-i="' + i + '"><b>' + ['1', '', '3', '', '5'][o] + '</b></span>'; }).join('') + '<span class="pr-cell sm root" data-i="8"><b>1</b></span><span class="pr-cell sm pr-breath" data-i="9"><b>吸</b></span>';
        var r = p.querySelector('.pr-rec'); if (r) r.textContent = st.rec ? '班級紀錄 ' + st.rec + ' BPM' : '班級紀錄 —';
      }
      if (!playing) drawStaff(0);
      if (!playing) { big.textContent = KEYN[st.start % 12] + ' 調'; sub.textContent = '起始音 ' + nameOf(st.start).name + '・' + st.bpm + ' BPM・母音 ' + VOWELS[st.vowel] + '　按「開始跟唱」，先聽 4 拍預備'; }
    }
    function changed() { save(); paintStatic(); if (playing) { pend = true; msg.textContent = '設定會在下一輪套用'; } }
    // 聲音：鋼琴感的撥弦音與節拍聲，全部接到 master，停止時一次切斷
    function note(m, t, dur, vol) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = freqOf(m);
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
      var g2 = ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }
    function click(t, acc) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = acc ? 1500 : 1000;
      g.gain.setValueAtTime(acc ? 0.22 : 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.06);
    }
    function build() { // 回傳一輪的事件（單位：拍）
      var ev = [], s = st.start, b = 0;
      var triad = [degMidi(s, 0), degMidi(s, 2), degMidi(s, 4)];
      for (var i = 0; i < 4; i++) ev.push({ b: i, kind: 'prep', n: 4 - i, chord: i === 0 ? triad : null });
      b = 4;
      if (isScale) {
        SCALE_DEG.forEach(function (k, i) { ev.push({ b: b, kind: 'note', m: degMidi(s, k), dur: i === SCALE_DEG.length - 1 ? 4 : 1, cell: i, k: k }); b += 1; });
        b += 3; // 最後的 1 唱滿四拍
      } else {
        var order = chordOrder();
        order.forEach(function (d, ci) {
          ST_PAT.forEach(function (o, i) { ev.push({ b: b + i * 0.5, kind: 'note', m: degMidi(s, d + o), dur: 0.18, cell: i, chord: ci, d: d, k: d + o, stac: true }); });
          ev.push({ b: b + 4, kind: 'note', m: degMidi(s, d), dur: 0.22, cell: 8, chord: ci, d: d, k: d, stac: true });
          var nx = order[ci + 1];
          ev.push({ b: b + 5, kind: 'breath', cell: 9, chord: ci, d: d, cue: nx === undefined ? null : [degMidi(s, nx), degMidi(s, nx + 2), degMidi(s, nx + 4)], cueAt: b + 6 });
          b += 8;
        });
      }
      return { ev: ev, beats: b };
    }
    function schedule() {
      var r = build(), spb = 60 / st.bpm, start = ctx.currentTime + 0.12;
      events = r.ev.map(function (e) { var x = {}; for (var k in e) x[k] = e[k]; x.t = start + e.b * spb; return x; });
      events.forEach(function (e) {
        if (e.kind === 'prep') { click(e.t, e.n === 4); if (e.chord) e.chord.forEach(function (m) { note(m, e.t, spb * 2.2, 0.16); }); }
        if (e.kind === 'note') { note(e.m, e.t, e.stac ? Math.min(spb * e.dur * 2, 0.22) : spb * e.dur * 0.95, e.stac ? 0.3 : 0.26); }
        if (e.kind === 'breath' && e.cue) e.cue.forEach(function (m) { note(m, start + e.cueAt * spb, spb * 1.2, 0.1); });
      });
      if (st.click) for (var bt = 4; bt < r.beats; bt++) click(start + bt * spb, (bt - 4) % 4 === 0);
      t0 = start; cur = -1;
      var endMs = (start + r.beats * spb - ctx.currentTime) * 1000;
      clearTimeout(timer); timer = setTimeout(nextRound, endMs);
    }
    function nextRound() {
      if (!playing) return;
      if (!st.loop) { stop('練習完成'); return; }
      if (st.up) { if (st.start < RANGE[st.voice][1]) st.start++; else { stop('已到最高起始音，按「− 半音」降回來再練'); return; } }
      if (st.rotate) st.vowel = (st.vowel + 1) % VOWELS.length;
      round++; pend = false; msg.textContent = ''; save(); paintStatic(); schedule();
    }
    function frame() {
      var now = ctx.currentTime, idx = -1;
      for (var i = 0; i < events.length; i++) if (events[i].t <= now) idx = i; else break;
      if (idx === cur || idx < 0) return; cur = idx;
      var e = events[idx];
      $$('.pr-cell', cells).forEach(function (c) { c.classList.remove('on'); });
      $$('.sn', staffEl).forEach(function (c) { c.classList.remove('on'); });
      if (!isScale && e.kind !== 'prep' && e.chord !== shownChord) drawStaff(e.chord);
      if (e.kind === 'prep') { if (shownChord !== 0 || round) drawStaff(0); big.textContent = '預備 ' + e.n; sub.textContent = '第 ' + (round + 1) + ' 輪・' + KEYN[st.start % 12] + ' 調・起始音 ' + nameOf(st.start).name + '・母音 ' + VOWELS[st.vowel] + (e.n === 4 ? '　吸氣' : ''); if (chordsEl) $$('.pr-chip', chordsEl).forEach(function (c) { c.classList.remove('on', 'done'); }); return; }
      var cell = cells.querySelector('[data-i="' + e.cell + '"]'); if (cell) cell.classList.add('on');
      var sn = staffEl.querySelector('.sn[data-i="' + e.cell + '"]'); if (sn) sn.classList.add('on');
      if (isScale) { big.textContent = SOLFA[e.k % 7] + '　' + nameOf(e.m).name; sub.textContent = '母音 ' + VOWELS[st.vowel] + '・' + (e.cell < 8 ? '上行' : e.cell === 8 ? '高音 1 再唱一次，準備下行' : e.cell === SCALE_DEG.length - 1 ? '下行・唱滿四拍' : '下行') + '・第 ' + (round + 1) + ' 輪'; }
      else {
        $$('.pr-chip', chordsEl).forEach(function (c, i) { c.classList.toggle('on', i === e.chord); c.classList.toggle('done', i < e.chord); });
        if (e.kind === 'breath') { big.textContent = '吸'; sub.textContent = e.cue ? '下一個和弦：' + chordName(st.start, chordOrder()[e.chord + 1]) : '最後一個和弦，準備下一輪'; }
        else { big.textContent = chordName(st.start, e.d) + '　' + nameOf(e.m).name; sub.textContent = '母音 ' + VOWELS[st.vowel] + '・短、促、有力・第 ' + (round + 1) + ' 輪'; }
      }
    }
    function start() {
      ctx = ac(); master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
      playing = true; round = 0; go.textContent = '■ 停止'; msg.textContent = ''; p.classList.add('playing');
      schedule(); raf = setInterval(frame, 25);
    }
    function stop(m) {
      playing = false; clearTimeout(timer); clearInterval(raf);
      if (master) { try { master.gain.setValueAtTime(0, ctx.currentTime); master.disconnect(); } catch (e) {} master = null; }
      go.textContent = '▶ 開始跟唱'; p.classList.remove('playing'); msg.textContent = m || '';
      $$('.pr-cell', cells).forEach(function (c) { c.classList.remove('on'); }); paintStatic();
    }
    go.onclick = function () { playing ? stop() : start(); };
    $$('.voice .btn', p).forEach(function (b) { b.onclick = function () { st.voice = b.getAttribute('data-v'); st.start = DEF[st.voice]; changed(); }; });
    sel.onchange = function () { st.start = +sel.value; changed(); };
    p.querySelector('.dn').onclick = function () { st.start = Math.max(RANGE[st.voice][0], st.start - 1); changed(); };
    p.querySelector('.upk').onclick = function () { st.start = Math.min(RANGE[st.voice][1], st.start + 1); changed(); };
    p.querySelector('.bdn').onclick = function () { st.bpm = Math.max(40, st.bpm - 5); changed(); };
    p.querySelector('.bup').onclick = function () { st.bpm = Math.min(160, st.bpm + 5); changed(); };
    $$('.vw', p).forEach(function (b) { b.onclick = function () { st.vowel = +b.getAttribute('data-i'); changed(); }; });
    ['rotate', 'up', 'loop', 'click', 'back'].forEach(function (o) { var c = p.querySelector('.o-' + o); if (c) c.onchange = function () { st[o] = c.checked; changed(); }; });
    var pass = p.querySelector('.pass');
    if (pass) pass.onclick = function () { if (st.bpm > (st.rec || 0)) st.rec = st.bpm; st.bpm = Math.min(160, st.bpm + 5); changed(); say('下一輪 ' + st.bpm + ' BPM', 'ok'); };
    paintStatic(); onLeave(p, function () { if (playing) stop(); });
  }
  $$('.scalepractice').forEach(function (p) { practice(p, 'scale'); });
  $$('.staccato').forEach(function (p) { practice(p, 'staccato'); });

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
    // 觸控用 pointerdown 立即記錄拍點（不等 click 延遲，也不觸發雙擊放大）；鍵盤啟動按鈕時仍走 click
    tapB.addEventListener('pointerdown', function (e) { e.preventDefault(); tap(); });
    tapB.onclick = function (e) { if (e.detail === 0) tap(); };
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
          au.src = url; dl.href = url; dl.onclick = function (e) { e.preventDefault(); saveFile(blob, dl.download); }; dl.download = label + '_' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + (type === 'audio/webm' ? '.webm' : '.m4a');
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
