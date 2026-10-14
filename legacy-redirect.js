(function () {
  'use strict';
  var origin = 'https://pixel-studio.musicallanding.workers.dev/vocal';
  var root = '/vocal_music';
  var path = location.pathname.indexOf(root) === 0 ? location.pathname.slice(root.length) : location.pathname;
  if (path === '' || path === '/index.html') path = '/';
  else if (path === '/survey.html') path = '/survey';
  else if (path === '/handbook.html') path = '/handbook';
  else if (path === '/handbook-print.html') path = '/handbook-print';
  else if (path === '/docs/course-handbook.md') path = '/course-handbook.md';
  else if (path === '/docs/vocal-class-handbook.pdf') path = '/vocal-class-handbook.pdf';
  var destination = origin + (path === '/' ? '/' : path) + location.search + location.hash;
  var exportURL = root + '/data-transfer.html';
  var banner = document.createElement('aside');
  banner.setAttribute('role', 'status');
  banner.style.cssText = 'position:fixed;z-index:99999;top:0;left:0;right:0;padding:12px 18px;background:#11130f;color:#f3f0e9;border-bottom:2px solid #c7af4a;box-shadow:0 4px 18px #0005;font:14px/1.6 system-ui,sans-serif;text-align:center';
  banner.innerHTML = '<strong>Vocal Lab 已搬到 Pixel Studio。</strong> 舊站的本機練習紀錄仍在這台裝置，轉移前請先下載備份。 <a class="go" style="display:inline-block;margin:4px 8px;color:#11130f;background:#c7af4a;padding:5px 12px;border-radius:6px;text-decoration:none;font-weight:700">前往新站</a><a class="export" style="display:inline-block;margin:4px 8px;color:#f3f0e9" target="_blank" rel="noopener">匯出舊站紀錄</a><span class="timer"></span>';
  banner.querySelector('.go').href = destination;
  banner.querySelector('.export').href = exportURL;
  function show() { if (document.body) document.body.appendChild(banner); else document.addEventListener('DOMContentLoaded', show, { once: true }); }
  show();
  var seconds = 12, timer = banner.querySelector('.timer'), nextTimer = 0;
  function tick() {
    if (!timer) { nextTimer = setTimeout(tick, 50); return; }
    timer.textContent = ' ' + seconds + ' 秒後前往新站';
    if (seconds <= 0) location.replace(destination);
    else { seconds--; nextTimer = setTimeout(tick, 1000); }
  }
  tick();
  banner.querySelector('.export').addEventListener('click', function () { clearTimeout(nextTimer); timer.textContent = ' 已開啟匯出頁，完成後可手動前往新站。'; });
  banner.querySelector('.go').addEventListener('click', function (event) { event.preventDefault(); location.assign(destination); });
})();
