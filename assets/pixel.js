/* Pixel Studio 像素字標：以 5x7 點陣繪製 PIXEL / STUDIO，顏色依欄位漸層 */
(function (global) {
  var FONT = {
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110']
  };
  var RAINBOW = ['#ff2e2e', '#ff7a00', '#ffd400', '#7ed321', '#00c9a7', '#1e90ff', '#7b4dff', '#d63cff'];
  var STUDIO = ['#ffe600', '#b6e61e', '#3fd46b', '#00c9c9'];

  function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
  function mix(stops, t) {
    var p = t * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(p)), f = p - i;
    var a = hex(stops[i]), b = hex(stops[i + 1]);
    return 'rgb(' + a.map(function (v, k) { return Math.round(v + (b[k] - v) * f); }).join(',') + ')';
  }

  // 回傳一段 SVG 字串
  function pixelWord(text, opts) {
    opts = opts || {};
    var stops = opts.colors || RAINBOW, cell = 10, gap = 1.6, letterGap = 1;
    var cols = text.length * 5 + (text.length - 1) * letterGap, rects = [];
    text.toUpperCase().split('').forEach(function (ch, n) {
      var g = FONT[ch]; if (!g) return;
      var x0 = n * (5 + letterGap);
      g.forEach(function (row, y) {
        row.split('').forEach(function (bit, x) {
          if (bit !== '1') return;
          var cx = x0 + x;
          rects.push('<rect x="' + (cx * cell + gap / 2) + '" y="' + (y * cell + gap / 2) + '" width="' + (cell - gap) + '" height="' + (cell - gap) + '" rx="1" fill="' + mix(stops, cx / (cols - 1)) + '"/>');
        });
      });
    });
    return '<svg class="pixel-word" viewBox="0 0 ' + (cols * cell) + ' ' + (7 * cell) + '" role="img" aria-label="' + text + '">' + rects.join('') + '</svg>';
  }

  // 完整字標：PIXEL + STUDIO (+ tagline)
  function logo(withTagline) {
    return '<div class="pixel-logo">' + pixelWord('PIXEL') +
      '<div class="pixel-logo-studio">' + pixelWord('STUDIO', { colors: STUDIO }) + '</div>' +
      (withTagline ? '<div class="pixel-logo-tag">We perform the pixel of music</div>' : '') + '</div>';
  }

  function mount(root) {
    (root || document).querySelectorAll('[data-pixel-logo]').forEach(function (el) {
      el.innerHTML = logo(el.getAttribute('data-pixel-logo') === 'tagline');
    });
    (root || document).querySelectorAll('[data-pixel-word]').forEach(function (el) {
      el.innerHTML = pixelWord(el.getAttribute('data-pixel-word'), el.hasAttribute('data-studio') ? { colors: STUDIO } : null);
    });
  }

  global.PixelStudio = { pixelWord: pixelWord, logo: logo, mount: mount, RAINBOW: RAINBOW };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mount(); });
  else mount();
})(window);
