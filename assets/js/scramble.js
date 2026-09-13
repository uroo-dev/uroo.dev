// Footer Kontak — scramble-reveal hover effect (vanilla, mirror of ScrambleTextHover)
// Usage: <a class="sk-link"><span class="sk-scramble" data-text="target text">target text</span></a>
(function () {
  if (window.__skInit) return;
  window.__skInit = true;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};:<>,.?/~`';
  var DUR = 650; // ms
  function randChar() {
    return CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  function scramble(target, progress) {
    var reveal = Math.floor(target.length * progress);
    var out = '';
    for (var i = 0; i < target.length; i++) {
      var ch = target[i];
      if (ch === ' ') out += ' ';
      else out += i < reveal ? ch : randChar();
    }
    return out;
  }

  var spans = document.querySelectorAll('[data-text]');
  var timers = {};
  Array.prototype.forEach.call(spans, function (el, idx) {
    var target = el.getAttribute('data-text') || el.textContent;
    el.setAttribute('data-text', target);
    var host = el.closest ? el.closest('a') : null;
    if (!host) host = el;

    host.addEventListener('mouseenter', function () {
      var start = performance.now();
      clearInterval(timers[idx]);
      timers[idx] = setInterval(function () {
        var p = Math.min(1, (performance.now() - start) / DUR);
        el.textContent = scramble(target, p);
        if (p >= 1) clearInterval(timers[idx]);
      }, 24);
    });
    host.addEventListener('mouseleave', function () {
      clearInterval(timers[idx]);
      el.textContent = target;
    });
  });
})();