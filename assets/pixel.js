/* Pixel Studio 品牌標誌：在深色底使用官方 Logo（白色標語版） */
(function (global) {
  var me = document.currentScript && document.currentScript.src;
  var BASE = me ? me.replace(/pixel\.js(\?.*)?$/, '') : 'assets/';

  // 只有 PIXEL 字樣的小標（頂欄、頁尾標記）
  function pixelWord(white) {
    return '<img class="pixel-word" src="' + BASE + (white ? 'logo-mono-white.png' : 'logo-color-dark.png') + '" alt="PIXEL STUDIO" width="1200" height="444">';
  }
  // 完整 Logo：PIXEL STUDIO + We Perform the Pixel of Music
  // 小尺寸使用不含標語的圖檔，標語改以文字呈現，維持清晰
  function logo(withTagline) {
    var src = BASE + 'logo-color-dark-notag.png';
    // 彩色 Logo 以刷淡、流光呈現：.pl-art 內含光暈層與沿著 Logo 形狀流動的光
    return '<div class="pixel-logo"><span class="pl-art" style="--logo:url(' + src + ')"><img src="' + src + '" alt="PIXEL STUDIO" width="1200" height="372"></span>' +
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
