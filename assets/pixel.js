/* Pixel Studio 品牌標誌：依底色使用新版黑底／白底字標 */
(function (global) {
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/pixel\.js(\?.*)?$/, '') : 'assets/';

  // 只有 PIXEL 字樣的小標（頂欄、頁尾標記）
  function pixelWord(white) {
    var file = white ? 'pixel-studio-67-white-bg.png' : 'pixel-studio-67-black-bg.png';
    return '<img class="pixel-word" src="' + BASE + file + '" alt="PIXEL STUDIO" width="2048" height="680">';
  }
  // 完整 Logo：PIXEL STUDIO + We Perform the Pixel of Music
  // 小尺寸使用不含標語的圖檔，標語改以文字呈現，維持清晰
  function logo(withTagline) {
    var src = BASE + 'pixel-studio-67-black-bg.png';
    return '<div class="pixel-logo"><span class="pl-art"><img src="' + src + '" alt="PIXEL STUDIO" width="2048" height="680"></span>' +
      (withTagline ? '<span class="pixel-tagline">We Perform the Pixel of Music</span>' : '') + '</div>';
  }
  function mount(root) {
    (root || document).querySelectorAll('[data-pixel-logo]').forEach(function (el) { el.innerHTML = logo(el.getAttribute('data-pixel-logo') === 'tagline'); });
    (root || document).querySelectorAll('[data-pixel-word]').forEach(function (el) { el.innerHTML = pixelWord(el.getAttribute('data-pixel-word') === 'white'); });
  }

  global.PixelStudio = { pixelWord: pixelWord, logo: logo, mount: mount, base: BASE };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
})(window);
