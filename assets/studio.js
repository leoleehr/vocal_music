(function () {
  'use strict';
  var group = document.getElementById('voice-lines');
  if (!group) return;
  var slider = document.getElementById('voice-frequency');
  var value = document.getElementById('voice-value');
  var button = document.getElementById('voice-play');
  var context, oscillator, gain, timer, playing = false;
  var gradient = document.getElementById('voice-gradient');
  // 彩虹流動：改用 requestAnimationFrame 移動漸層起訖點（iOS Safari 對 SVG animateTransform 漸層不會重繪）
  // 系統開啟「減少動態效果」時不動；離開畫面或切到背景時暫停，省電
  if (gradient && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
    var art = gradient.ownerSVGElement, visible = true, last = 0, flowRaf = 0;
    function flowTick(now) {
      flowRaf = requestAnimationFrame(flowTick);
      if (!visible || document.hidden || now - last < 33) return; last = now;
      var t = (now / 12000 * 500) % 500;
      gradient.setAttribute('x1', (t).toFixed(1)); gradient.setAttribute('x2', (t + 500).toFixed(1));
    }
    if ('IntersectionObserver' in window && art) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(art);
    flowRaf = requestAnimationFrame(flowTick);
  }
  function draw() {
    var frequency = Number(slider.value), markup = '';
    for (var line = 0; line < 54; line++) {
      var path = '', angle = line / 53 * Math.PI;
      for (var step = 0; step <= 120; step++) {
        var u = step / 120, envelope = Math.pow(Math.sin(u * Math.PI), .8);
        var x = 55 + u * 390;
        var y = 250 + Math.sin(u * Math.PI * (3 + frequency / 110) + angle * 2) * envelope * 102 + Math.cos(angle) * envelope * 100;
        path += (step ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2);
      }
      markup += '<path d="' + path + '" opacity="' + (.25 + .65 * Math.sin(angle)).toFixed(2) + '"/>';
    }
    group.innerHTML = markup;
    value.textContent = frequency + ' Hz';
    if (oscillator && context) oscillator.frequency.setTargetAtTime(frequency, context.currentTime, .08);
  }
  function stop() {
    clearTimeout(timer);
    if (oscillator) {
      var previous = oscillator;
      gain.gain.setTargetAtTime(0, context.currentTime, .025);
      previous.stop(context.currentTime + .15);
      oscillator = null;
    }
    playing = false; group.closest('.voice-art').classList.remove('listening'); button.textContent = '▶ 聆聽聲音'; button.setAttribute('aria-pressed', 'false');
  }
  slider.addEventListener('input', draw);
  button.addEventListener('click', async function () {
    if (playing) { stop(); return; }
    button.disabled = true;
    try {
      var Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('Audio unavailable');
      context = context || new Audio();
      await context.resume();
      if (document.hidden) return;
      oscillator = context.createOscillator(); gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = Number(slider.value);
      gain.gain.value = 0; oscillator.connect(gain); gain.connect(context.destination);
      var currentGain = gain, currentOscillator = oscillator;
      oscillator.onended = function () { currentOscillator.disconnect(); currentGain.disconnect(); };
      oscillator.start(); gain.gain.setTargetAtTime(.08, context.currentTime, .04);
      playing = true; group.closest('.voice-art').classList.add('listening'); button.textContent = '■ 停止聆聽'; button.setAttribute('aria-pressed', 'true');
      timer = setTimeout(stop, 12000);
    } catch (error) { button.textContent = '此瀏覽器無法播放'; }
    finally { button.disabled = false; }
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  draw();
})();
