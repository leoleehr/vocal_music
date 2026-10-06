/* ===== Pixel Studio 資料回收：學員資料、送出佇列、Google 試算表後台 =====
 * 需要先載入 config.js。所有資料以 JSON 送到 Google Apps Script（見 backend/README.md）。
 */
(function () {
  'use strict';
  var CFG = window.PIXEL_CONFIG || {}, URL_ = (CFG.endpoint || '').trim();
  var LESSON = (location.pathname.match(/lesson-(\d+)/) || [])[1];
  if (LESSON) LESSON = String(parseInt(LESSON, 10));
  var K = { profile: 'pixel:profile', queue: 'pixel:queue', device: 'pixel:device' };
  function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var device = get(K.device, null);
  if (!device) { device = Math.random().toString(36).slice(2, 10); set(K.device, device); }

  /* ---------- 提示訊息 ---------- */
  var toastEl = null, toastT = 0;
  function toast(msg, kind) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'pb-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.className = 'pb-toast on ' + (kind || '');
    toastEl.textContent = msg;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3200);
  }

  /* ---------- 學員資料 ---------- */
  function profile() { return get(K.profile, null); }
  function complete(p) { return !!(p && p.name && p.dept && p.code); }
  var modal = null, pending = [];
  function openProfile(reason) {
    return new Promise(function (resolve, reject) {
      pending.push({ resolve: resolve, reject: reject });
      if (!modal) build();
      var p = profile() || {};
      modal.querySelector('[name=name]').value = p.name || '';
      modal.querySelector('[name=dept]').value = p.dept || '';
      modal.querySelector('[name=code]').value = p.code || '';
      modal.querySelector('.pb-reason').textContent = reason || '填寫一次即可，之後送出的問卷與課堂互動都會附上你的姓名與科系。';
      modal.querySelector('.pb-err').textContent = '';
      modal.querySelector('.pb-clear').style.display = p.name ? '' : 'none';
      modal.classList.add('on'); document.documentElement.classList.add('pb-open');
      setTimeout(function () { modal.querySelector('[name=name]').focus(); }, 60);
    });
  }
  function closeProfile(ok) {
    modal.classList.remove('on'); document.documentElement.classList.remove('pb-open');
    var list = pending; pending = [];
    list.forEach(function (p) { ok ? p.resolve(profile()) : p.reject(new Error('cancel')); });
  }
  function build() {
    modal = document.createElement('div'); modal.className = 'pb-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-label', '學員資料');
    modal.innerHTML = '<form class="pb-box" novalidate>' +
      '<div class="pb-head"><b>學員資料</b><button type="button" class="pb-x" aria-label="關閉">✕</button></div>' +
      '<p class="pb-reason"></p>' +
      '<label><span>姓名</span><input name="name" autocomplete="name" maxlength="30" required></label>' +
      '<label><span>科系</span><input name="dept" list="pb-depts" maxlength="40" placeholder="例如：資訊工程系" required></label>' +
      '<datalist id="pb-depts"><option value="資訊工程系"><option value="電機工程系"><option value="電子工程系"><option value="機械工程系"><option value="通訊工程系"><option value="材料與纖維系"><option value="工業管理系"><option value="資訊管理系"><option value="行銷與流通管理系"><option value="醫務管理系"><option value="護理系"><option value="應用外語系"></datalist>' +
      '<label><span>課程代碼</span><input name="code" autocomplete="off" maxlength="30" placeholder="老師在課堂上公布" required></label>' +
      '<p class="pb-err" aria-live="polite"></p>' +
      '<div class="pb-actions"><button type="button" class="pb-clear">換人使用</button><button type="submit" class="pb-save">儲存</button></div>' +
      '<p class="pb-note">資料只會送到老師的課程試算表，用於課程回饋與學習紀錄。</p></form>';
    document.body.appendChild(modal);
    var f = modal.querySelector('form'), err = modal.querySelector('.pb-err');
    modal.querySelector('.pb-x').onclick = function () { closeProfile(false); };
    modal.addEventListener('click', function (e) { if (e.target === modal) closeProfile(false); });
    modal.querySelector('.pb-clear').onclick = function () { try { localStorage.removeItem(K.profile); } catch (e) {} f.reset(); refreshChips(); err.textContent = '已清除，請填寫新的學員資料'; };
    f.onsubmit = function (e) {
      e.preventDefault();
      var p = { name: f.name.value.trim(), dept: f.dept.value.trim(), code: f.code.value.trim(), device: device };
      if (!p.name || !p.dept || !p.code) { err.textContent = '請填寫姓名、科系與課程代碼'; return; }
      var btn = f.querySelector('.pb-save'); btn.disabled = true; btn.textContent = '確認中…';
      checkCode(p.code).then(function (ok) {
        btn.disabled = false; btn.textContent = '儲存';
        if (ok === false) { err.textContent = '課程代碼不正確，請向老師確認'; return; }
        set(K.profile, p); refreshChips(); closeProfile(true);
        send('profile', {}, { silent: true });
        toast('已儲存：' + p.name + '・' + p.dept, 'ok');
      });
    };
  }
  function checkCode(code) {
    if (!URL_) return Promise.resolve(null);
    return fetch(URL_ + '?code=' + encodeURIComponent(code)).then(function (r) { return r.json(); })
      .then(function (j) { return j && j.valid; }).catch(function () { return null; });
  }
  function saveProfile(p) { p.device = device; set(K.profile, p); refreshChips(); }
  function ensureProfile(reason) { var p = profile(); return complete(p) ? Promise.resolve(p) : openProfile(reason); }

  /* ---------- 學員資料按鈕 ---------- */
  var chips = [];
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
  function chip(cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pb-chip ' + (cls || '');
    b.onclick = function () { openProfile(); };
    chips.push(b); paint(b); return b;
  }
  function paint(b) {
    var p = profile();
    b.innerHTML = ICON + '<span>' + (complete(p) ? esc(p.name) + '<small>' + esc(p.dept) + '</small>' : '填寫學員資料') + '</span>';
    b.classList.toggle('empty', !complete(p));
  }
  function refreshChips() { chips.forEach(paint); }

  /* ---------- 送出佇列 ---------- */
  var flushing = false, warnedNoUrl = false;
  function enqueue(item) { var q = get(K.queue, []); q.push(item); set(K.queue, q.slice(-300)); }
  function post(items, code) {
    return fetch(URL_, { method: 'POST', body: JSON.stringify({ code: code, items: items }) }).then(function (r) { return r.json(); });
  }
  function flush() {
    if (flushing || !URL_) return Promise.resolve();
    var q = get(K.queue, []), p = profile();
    if (!q.length || !complete(p)) return Promise.resolve();
    flushing = true;
    var batch = q.slice(0, 40);
    return post(batch, p.code).then(function (j) {
      flushing = false;
      if (!j || !j.ok) { if (j && j.error === 'code') { toast('課程代碼不正確，請重新填寫學員資料', 'err'); openProfile('課程代碼不正確，請向老師確認後重新輸入。'); } return; }
      var done = {}; (j.results || []).forEach(function (r) { if (r.ok) done[r.id] = 1; });
      set(K.queue, get(K.queue, []).filter(function (it) { return !done[it.id]; }));
      if (get(K.queue, []).length) return flush();
    }).catch(function () { flushing = false; });
  }
  function itemOf(type, data, opts) {
    var p = profile() || {};
    return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: type, data: data || {}, ts: new Date().toISOString(),
      lesson: (opts && opts.lesson) || LESSON || '', slide: (opts && opts.slide) || '', page: location.pathname.split('/').slice(-2).join('/'),
      profile: { name: p.name || '', dept: p.dept || '', device: device } };
  }
  // 一般資料：先放進佇列，再送出；沒有網路或尚未設定後台時，下次自動補送
  function send(type, data, opts) {
    opts = opts || {};
    return ensureProfile(opts.reason).then(function () {
      var it = itemOf(type, data, opts);
      enqueue(it);
      if (!URL_) { if (!opts.silent && !warnedNoUrl) { warnedNoUrl = true; toast('後台尚未設定，資料已先存在這台裝置', 'warn'); } return { queued: true }; }
      return flush().then(function () {
        var still = get(K.queue, []).some(function (x) { return x.id === it.id; });
        if (!opts.silent) toast(still ? '網路不穩，已暫存，稍後自動補送' : (opts.okMsg || '已送出給老師'), still ? 'warn' : 'ok');
        return { sent: !still };
      });
    }).catch(function () { return { cancelled: true }; });
  }
  // 互動紀錄：不打斷課堂；沒有學員資料時只先暫存，填寫後補送
  function log(type, data, opts) {
    var it = itemOf(type, data, opts || {});
    enqueue(it);
    if (complete(profile())) flush();
  }
  // 錄音：檔案較大，不進佇列，直接上傳
  function upload(blob, meta) {
    return ensureProfile('上傳錄音前，請先填寫學員資料。').then(function (p) {
      if (!URL_) { toast('後台尚未設定，無法上傳錄音', 'warn'); return { ok: false }; }
      toast('上傳中…', '');
      return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.readAsDataURL(blob); })
        .then(function (b64) {
          var it = itemOf('recording', { base64: b64, mime: blob.type, filename: meta.filename, label: meta.label, seconds: meta.seconds }, meta);
          return post([it], p.code);
        }).then(function (j) {
          var r = j && j.results && j.results[0];
          if (r && r.ok) { toast('錄音已上傳給老師', 'ok'); return { ok: true, url: r.url }; }
          toast(j && j.error === 'code' ? '課程代碼不正確' : '上傳失敗，請稍後再試', 'err'); return { ok: false };
        }).catch(function () { toast('上傳失敗，請檢查網路後再試', 'err'); return { ok: false }; });
    }).catch(function () { return { ok: false }; });
  }

  addEventListener('online', flush);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  function init() {
    // 頂欄放學員資料按鈕：網站頁面放在 topbar，投影片放在 App 列與桌機控制列
    var tb = document.querySelector('.topbar .wrap'); if (tb) tb.appendChild(chip('top'));
    var ab = document.querySelector('.appbar'); if (ab) ab.insertBefore(chip('icon'), ab.querySelector('.ab-count'));
    var ui = document.querySelector('.ui'); if (ui) ui.appendChild(chip('ui'));
    setTimeout(flush, 1500);
  }
  window.PixelBackend = { configured: !!URL_, profile: profile, saveProfile: saveProfile, checkCode: checkCode, ensureProfile: ensureProfile, openProfile: openProfile, send: send, log: log, upload: upload, flush: flush, toast: toast, chip: chip };
})();
