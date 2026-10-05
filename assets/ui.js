/* ===== Pixel Studio 共用介面：表格轉卡片、目錄抽屜 ===== */
(function (global) {
  'use strict';
  var ICON = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></svg>'
  };

  // 表格：把表頭文字寫到每個儲存格的 data-label，手機上用 CSS 排成卡片
  function labelTables(root) {
    (root || document).querySelectorAll('table').forEach(function (t) {
      var rows = t.querySelectorAll('tr'); if (!rows.length) return;
      var head = rows[0].querySelectorAll('th');
      if (!head.length) return;
      rows[0].classList.add('th-row');
      var labels = [].map.call(head, function (h) { return h.textContent.trim(); });
      for (var i = 1; i < rows.length; i++) {
        rows[i].querySelectorAll('td').forEach(function (td, k) { if (labels[k]) td.setAttribute('data-label', labels[k]); });
      }
      t.classList.add('labeled');
    });
  }

  // 底部抽屜：items = [{href, no, label, dot, ix}]
  function sheet(title, items) {
    var scrim = document.createElement('div'); scrim.className = 'sheet-scrim';
    var box = document.createElement('div'); box.className = 'sheet'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', title);
    box.innerHTML = '<div class="sheet-head"><b>' + title + '</b><button type="button">關閉</button></div><nav class="sheet-list"></nav>';
    var list = box.querySelector('.sheet-list');
    items.forEach(function (it) {
      var a = document.createElement('a'); a.href = it.href;
      a.innerHTML = (it.no != null ? '<span class="no">' + it.no + '</span>' : '') + '<span class="dot"' + (it.dot ? ' style="background:' + it.dot + '"' : '') + '></span><span>' + it.label + '</span>' + (it.ix ? '<span class="ix">互動</span>' : '');
      a.onclick = function () { close(); };
      list.appendChild(a);
    });
    document.body.appendChild(scrim); document.body.appendChild(box);
    function open() { document.documentElement.classList.add('sheet-open'); document.body.classList.add('sheet-open'); }
    function close() { document.documentElement.classList.remove('sheet-open'); document.body.classList.remove('sheet-open'); }
    scrim.onclick = close; box.querySelector('button').onclick = close;
    addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    return { open: open, close: close, list: list };
  }

  global.PixelUI = { ICON: ICON, labelTables: labelTables, sheet: sheet };
})(window);
