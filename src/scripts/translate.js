import en from '../i18n/en.json';
import id from '../i18n/id.json';

(function () {
  var currentLang = localStorage.getItem('lang') || 'en';
  var enToId = {};
  var idToEn = {};

  var keys = Object.keys(en);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (typeof en[k] === 'string' && typeof id[k] === 'string') {
      var e = en[k].trim();
      var iText = id[k].trim();
      if (e && iText && e !== iText) {
        enToId[e] = iText;
        idToEn[iText] = e;
      }
    }
  }

  function shouldSkip(node) {
    if (node.nodeType !== 3) return true;
    var text = node.textContent;
    if (!text || !text.trim()) return true;
    var el = node.parentElement;
    if (!el) return true;
    var tag = el.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'SVG' ||
        tag === 'CODE' || tag === 'PRE' || tag === 'TEXTAREA' ||
        tag === 'INPUT' || tag === 'SELECT' || tag === 'OPTION') return true;
    if (el.closest('[aria-hidden="true"]')) return true;
    return false;
  }

  function translate(map) {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    var nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }
    for (var j = 0; j < nodes.length; j++) {
      var n = nodes[j];
      var orig = n.textContent;
      var trimmed = orig.trim();
      if (map[trimmed]) {
        n.textContent = orig.replace(trimmed, map[trimmed]);
      }
    }
    if (document.title) {
      var titleParts = document.title.split('|');
      if (titleParts.length > 1) {
        var first = titleParts[0].trim();
        if (map[first]) {
          document.title = map[first] + ' |' + titleParts.slice(1).join('|');
        }
      } else {
        var t = document.title.trim();
        if (map[t]) {
          document.title = map[t];
        }
      }
    }
    document.documentElement.lang = currentLang === 'id' ? 'en' : 'id';
  }

  function applyLang(lang) {
    if (lang === 'id') {
      translate(enToId);
    } else {
      translate(idToEn);
    }
    currentLang = lang;
  }

  window.toggleLanguage = function () {
    var next = currentLang === 'en' ? 'id' : 'en';
    var html = document.documentElement;
    html.style.transition = 'opacity 0.12s ease';
    html.style.opacity = '0.7';
    setTimeout(function () {
      applyLang(next);
      localStorage.setItem('lang', next);
      var label = document.querySelector('#lang-toggle-btn .lang-label');
      if (label) label.textContent = next === 'id' ? 'EN' : 'ID';
      requestAnimationFrame(function () {
        html.style.opacity = '';
      });
    }, 80);
  };

  if (currentLang === 'id') {
    document.addEventListener('DOMContentLoaded', function () {
      applyLang('id');
    });
  }
})();
