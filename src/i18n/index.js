import en from './en.json';
import id from './id.json';

const translations = { en, id };
let currentLang = 'en';

let textMap = null;

function buildTextMap() {
  if (textMap) return textMap;
  textMap = {};
  for (const key of Object.keys(en)) {
    const enText = en[key];
    const idText = id[key];
    if (enText && idText && enText !== idText) {
      textMap[enText] = idText;
    }
  }
  return textMap;
}

export function getCurrentLang() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('lang') || 'en';
  }
  return 'en';
}

export function setLanguage(lang) {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lang', lang);
  }
  applyTranslations(lang);
}

export function t(key, lang) {
  const l = lang || getCurrentLang();
  return translations[l]?.[key] || key;
}

export function applyTranslations(lang) {
  const l = lang || getCurrentLang();
  currentLang = l;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key, l);
    if (translated && translated !== key) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', translated);
      } else {
        el.textContent = translated;
      }
    }
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    const translated = t(key, l);
    if (translated && translated !== key) {
      el.innerHTML = translated;
    }
  });

  document.documentElement.lang = l;

  if (l === 'id') {
    const map = l === 'id' ? buildTextMap() : {};
    const reverseMap = l === 'id' ? map : null;
    if (reverseMap) {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            if (parent.closest('[data-i18n], [data-i18n-html], script, style, svg, code, pre, textarea, input')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        },
        false
      );
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const text = node.textContent.trim();
        if (text && reverseMap[text]) {
          node.textContent = reverseMap[text];
        }
      }
    }
  } else {
    const map = buildTextMap();
    const reverseIdMap = {};
    for (const [enText, idText] of Object.entries(map)) {
      reverseIdMap[idText] = enText;
    }
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          if (parent.closest('[data-i18n], [data-i18n-html], script, style, svg, code, pre, textarea, input')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false
    );
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent.trim();
      if (text && reverseIdMap[text]) {
        node.textContent = reverseIdMap[text];
      }
    }
  }
}

export function init() {
  const lang = getCurrentLang();
  currentLang = lang;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => applyTranslations(lang));
  } else {
    applyTranslations(lang);
  }
}

if (typeof window !== 'undefined') {
  window.__applyTranslations = applyTranslations;
  init();
}
