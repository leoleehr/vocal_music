/* Pixel Studio 品牌標誌：在深色底使用官方 Logo（白色標語版） */
(function (global) {
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/pixel\.js(\?.*)?$/, '') : 'assets/';

  // 只有 PIXEL 字樣的小標（頂欄、頁尾標記）
  function pixelWord() {
    return '<img class="pixel-word" src="' + BASE + 'logo-mark.png" alt="PIXEL STUDIO" width="560" height="111">';
  }
  // 完整 Logo：PIXEL STUDIO + We Perform the Pixel of Music
  function logo() {
    return '<div class="pixel-logo"><img src="' + BASE + 'logo-dark.png" alt="PIXEL STUDIO — We Perform the Pixel of Music" width="1234" height="470"></div>';
  }
  function mount(root) {
    (root || document).querySelectorAll('[data-pixel-logo]').forEach(function (el) { el.innerHTML = logo(); });
    (root || document).querySelectorAll('[data-pixel-word]').forEach(function (el) { el.innerHTML = pixelWord(); });
  }

  global.PixelStudio = { pixelWord: pixelWord, logo: logo, mount: mount, base: BASE };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
})(window);
