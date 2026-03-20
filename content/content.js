console.log('Content script loaded');

// ─── Configuration globale ────────────────────────────────────────────────────
let autoTranslateEnabled = false;
let selectedLanguage = 'fr';
let translationObserver = null;

// ─── Verrou anti-spam ─────────────────────────────────────────────────────────
let isTranslating = false;

// ─── Toast system ─────────────────────────────────────────────────────────────

function injectToastStyles() {
  if (document.getElementById('mtg-toast-styles')) return;
  const style = document.createElement('style');
  style.id = 'mtg-toast-styles';
  style.textContent = `
    #mtg-toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    }
    .mtg-toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #fff;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      min-width: 220px;
      max-width: 320px;
      pointer-events: auto;
      opacity: 0;
      transform: translateX(30px);
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .mtg-toast.show { opacity: 1; transform: translateX(0); }
    .mtg-toast.hide { opacity: 0; transform: translateX(30px); }
    .mtg-toast.info    { background: #3b82f6; }
    .mtg-toast.success { background: #22c55e; }
    .mtg-toast.warning { background: #f59e0b; }
    .mtg-toast.error   { background: #ef4444; }
    .mtg-toast-icon { font-size: 16px; flex-shrink: 0; }
    .mtg-toast-text { flex: 1; line-height: 1.3; }
    .mtg-toast-spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      flex-shrink: 0;
      animation: mtg-spin 0.7s linear infinite;
    }
    @keyframes mtg-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

function getToastContainer() {
  let container = document.getElementById('mtg-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'mtg-toast-container';
    document.body.appendChild(container);
  }
  return container;
}

const TOAST_ICONS = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };

function showToast(message, type = 'info', duration = 3000, spinner = false) {
  injectToastStyles();
  const container = getToastContainer();

  const toast = document.createElement('div');
  toast.className = 'mtg-toast ' + type;

  if (spinner) {
    const sp = document.createElement('div');
    sp.className = 'mtg-toast-spinner';
    toast.appendChild(sp);
  } else {
    const icon = document.createElement('span');
    icon.className = 'mtg-toast-icon';
    icon.textContent = TOAST_ICONS[type] || '';
    toast.appendChild(icon);
  }

  const text = document.createElement('span');
  text.className = 'mtg-toast-text';
  text.textContent = message;
  toast.appendChild(text);

  container.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  const dismiss = () => {
    toast.classList.add('hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  if (duration > 0) setTimeout(dismiss, duration);
  return dismiss;
}

// ─── Messages i18n pour les toasts ───────────────────────────────────────────
const TOAST_I18N = {
  translating:  {
    fr: 'Traduction en cours…', en: 'Translating…', es: 'Traduciendo…',
    de: 'Übersetzung läuft…', it: 'Traduzione in corso…', pt: 'Traduzindo…',
    ja: '翻訳中…', ko: '번역 중…', ru: 'Перевод…', zh: '翻译中…', 'zh-TW': '翻譯中…',
  },
  done: {
    fr: 'Traduction terminée', en: 'Translation done', es: 'Traducción completada',
    de: 'Übersetzung abgeschlossen', it: 'Traduzione completata', pt: 'Tradução concluída',
    ja: '翻訳完了', ko: '번역 완료', ru: 'Перевод завершён', zh: '翻译完成', 'zh-TW': '翻譯完成',
  },
  busy: {
    fr: 'Traduction déjà en cours, patientez…', en: 'Translation already running, please wait…',
    es: 'Traducción en curso, espere…', de: 'Übersetzung läuft bereits, bitte warten…',
    it: 'Traduzione in corso, attendere…', pt: 'Tradução em curso, aguarde…',
    ja: '翻訳中です、お待ちください…', ko: '번역이 진행 중입니다, 기다려주세요…',
    ru: 'Перевод уже выполняется, подождите…', zh: '翻译正在进行，请稍候…', 'zh-TW': '翻譯進行中，請稍候…',
  },
  autoOn: {
    fr: 'Traduction automatique activée', en: 'Auto-translate enabled',
    es: 'Traducción automática activada', de: 'Automatische Übersetzung aktiviert',
    it: 'Traduzione automatica attivata', pt: 'Tradução automática ativada',
    ja: '自動翻訳が有効になりました', ko: '자동 번역 활성화됨', ru: 'Автоперевод включён',
    zh: '自动翻译已启用', 'zh-TW': '自動翻譯已啟用',
  },
  autoOff: {
    fr: 'Traduction automatique désactivée', en: 'Auto-translate disabled',
    es: 'Traducción automática desactivada', de: 'Automatische Übersetzung deaktiviert',
    it: 'Traduzione automatica disattivata', pt: 'Tradução automática desativada',
    ja: '自動翻訳が無効になりました', ko: '자동 번역 비활성화됨', ru: 'Автоперевод отключён',
    zh: '自动翻译已禁用', 'zh-TW': '自動翻譯已停用',
  },
  notSupported: {
    fr: 'Site non supporté pour la traduction auto', en: 'Site not supported for auto-translation',
    es: 'Sitio no compatible con traducción automática', de: 'Seite unterstützt keine automatische Übersetzung',
    it: 'Sito non supportato per la traduzione automatica', pt: 'Site não suportado para tradução automática',
    ja: 'このサイトは自動翻訳に対応していません', ko: '이 사이트는 자동 번역을 지원하지 않습니다',
    ru: 'Сайт не поддерживает автоперевод', zh: '此网站不支持自动翻译', 'zh-TW': '此網站不支援自動翻譯',
  },
  noCards: {
    fr: 'Aucune carte détectée sur cette page', en: 'No cards detected on this page',
    es: 'No se detectaron cartas en esta página', de: 'Keine Karten auf dieser Seite gefunden',
    it: 'Nessuna carta rilevata in questa pagina', pt: 'Nenhuma carta detectada nesta página',
    ja: 'このページにカードが見つかりません', ko: '이 페이지에서 카드를 찾을 수 없습니다',
    ru: 'Карты на странице не найдены', zh: '此页面未检测到卡牌', 'zh-TW': '此頁面未偵測到卡牌',
  },
  error: {
    fr: 'Erreur lors de la traduction', en: 'Translation error',
    es: 'Error de traducción', de: 'Übersetzungsfehler',
    it: 'Errore di traduzione', pt: 'Erro de tradução',
    ja: '翻訳エラー', ko: '번역 오류', ru: 'Ошибка перевода', zh: '翻译错误', 'zh-TW': '翻譯錯誤',
  },
};

function tr(key) {
  const entry = TOAST_I18N[key];
  if (!entry) return key;
  return entry[selectedLanguage] || entry['en'] || key;
}

// ─── Chargement des préférences ───────────────────────────────────────────────
async function loadSettings() {
  const result = await browser.storage.local.get(['autoTranslate', 'selectedLanguage']);
  autoTranslateEnabled = result.autoTranslate || false;
  selectedLanguage = result.selectedLanguage || 'fr';

  console.log('Settings loaded:', { autoTranslateEnabled, selectedLanguage });

  if (autoTranslateEnabled && await isSiteSupported()) {
    console.log('Auto-translate is enabled and site is supported');
    waitForDomReady().then(() => {
      traduireEtRemplacer(selectedLanguage, false);
      setupMutationObserver();
    });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function isSiteSupported() {
  const domainSelectors = await getDomainSelectors();
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  return domainSelectors.hasOwnProperty(currentDomain);
}

function waitForDomReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else if (document.readyState === 'interactive') {
      window.addEventListener('load', resolve, { once: true });
    } else {
      resolve();
    }
  });
}

// ─── MutationObserver ─────────────────────────────────────────────────────────
function setupMutationObserver() {
  if (translationObserver) translationObserver.disconnect();

  translationObserver = new MutationObserver(() => {
    clearTimeout(translationObserver.debounceTimer);
    translationObserver.debounceTimer = setTimeout(() => {
      if (autoTranslateEnabled) {
        console.log('DOM mutation detected, re-translating…');
        traduireEtRemplacer(selectedLanguage, true);
      }
    }, 500);
  });

  translationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
  });

  console.log('Mutation observer started');
}

// ─── Gestionnaire des messages du popup ──────────────────────────────────────
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content.js:', request.action);

  if (request.action === 'translate') {
    selectedLanguage = request.lang;
    traduireEtRemplacer(request.lang, false);
  }
  else if (request.action === 'autoTranslateToggled') {
    autoTranslateEnabled = request.enabled;
    selectedLanguage = request.lang;

    if (autoTranslateEnabled) {
      console.log('Auto-translate enabled');
      showToast(tr('autoOn'), 'info', 2500);
      isSiteSupported().then(supported => {
        if (supported) {
          traduireEtRemplacer(selectedLanguage, true);
          setupMutationObserver();
        } else {
          showToast(tr('notSupported'), 'warning', 4000);
        }
      });
    } else {
      console.log('Auto-translate disabled');
      showToast(tr('autoOff'), 'info', 2500);
      if (translationObserver) translationObserver.disconnect();
    }
  }
});

// ─── Fonctions de traduction ──────────────────────────────────────────────────
function getDomainSelectors() {
  return fetch(browser.runtime.getURL('assets/selectors.json'))
    .then(r => r.json())
    .catch(err => console.error('Erreur chargement selectors.json:', err));
}

async function selectionnerElementsATraduire() {
  const domainSelectors = await getDomainSelectors();
  const currentDomain = window.location.hostname.replace(/^www\./, '');
  const selectors = domainSelectors[currentDomain] || [];

  const elements = selectors
    .flatMap(item => {
      const parents = document.querySelectorAll(item.selector);
      return Array.from(parents).map(parent => {
        if (item.mode === 'composite') {
          const parts = parent.querySelectorAll(item.childSelector);
          const isCategory = Array.from(parts).some(span => {
            const hasManaIcon = span.querySelector('.mana');
            const hasCounter = /\(\d+\)/.test(span.textContent);
            return hasManaIcon || hasCounter;
          });
          if (isCategory) return null;
          return { element: parent, composite: true, childSelector: item.childSelector };
        }
        if (item.childIndex !== undefined && parent.children.length > item.childIndex) {
          return parent.children[item.childIndex];
        }
        return parent;
      });
    })
    .filter(Boolean);

  console.log("Nombre d'éléments trouvés :", elements.length);
  return elements;
}

function normaliserNomCarte(nom) {
  return nom.replace(/\s*\/\s*/g, ' // ');
}

async function traduireEtRemplacer(langueCible, silent = false) {
  if (isTranslating) {
    console.log('Translation already in progress, skipping.');
    if (!silent) showToast(tr('busy'), 'warning', 3500);
    return;
  }
  isTranslating = true;

  let dismissLoading = null;
  if (!silent) {
    dismissLoading = showToast(tr('translating'), 'info', 0, true);
  }

  try {
    const items = await selectionnerElementsATraduire();

    if (items.length === 0) {
      if (!silent) {
        if (dismissLoading) dismissLoading();
        showToast(tr('noCards'), 'warning', 4000);
      }
      return;
    }

    const map = new Map();

    for (const item of items) {
      let element, original;

      if (item.composite) {
        element = item.element;
        if (element.hasAttribute('data-original-name')) {
          original = element.getAttribute('data-original-name');
        } else {
          const parts = [...element.querySelectorAll(item.childSelector)];
          original = parts.map(s => s.textContent.trim()).join(' ');
          original = normaliserNomCarte(original);
          element.setAttribute('data-original-name', original);
        }
      } else {
        element = item;
        if (element.hasAttribute('data-original-name')) {
          original = element.getAttribute('data-original-name');
        } else {
          original = element.textContent.trim();
          original = normaliserNomCarte(original);
          element.setAttribute('data-original-name', original);
        }
      }

      if (!original) continue;
      if (!map.has(original)) map.set(original, []);
      map.get(original).push(item);
    }

    console.log('Cartes uniques :', map.size);

    const translations = await Promise.all(
      [...map.keys()].map(name =>
        traduireNom(name, langueCible).then(t => [name, t])
      )
    );

    const dict = Object.fromEntries(translations);

    for (const [original, list] of map) {
      const translated = dict[original];

      for (const item of list) {
        const element = item.composite ? item.element : item;

        if (item.composite) {
          const spans = [...element.querySelectorAll(item.childSelector)];
          spans.forEach((s, i) => { s.textContent = i === 0 ? translated : ''; });
        } else {
          element.textContent = translated;
        }

        element.onmouseenter = () => {
          if (item.composite) {
            const spans = [...element.querySelectorAll(item.childSelector)];
            spans.forEach((s, i) => s.textContent = i === 0 ? original : '');
          } else {
            element.textContent = original;
          }
        };

        element.onmouseleave = () => {
          if (item.composite) {
            const spans = [...element.querySelectorAll(item.childSelector)];
            spans.forEach((s, i) => s.textContent = i === 0 ? translated : '');
          } else {
            element.textContent = translated;
          }
        };
      }
    }

    console.log('Traduction terminée');
    if (!silent) {
      if (dismissLoading) dismissLoading();
      showToast(tr('done'), 'success', 3000);
    }
  } catch (err) {
    console.error('Translation failed:', err);
    if (!silent) {
      if (dismissLoading) dismissLoading();
      showToast(tr('error'), 'error', 4000);
    }
  } finally {
    isTranslating = false;
  }
}

async function traduireNom(text, targetLanguage) {
  return new Promise((resolve) => {
    browser.runtime.sendMessage({ action: 'translate', text, targetLanguage })
      .then(response => resolve(response.translatedText))
      .catch(error => {
        console.error('Translation error:', error);
        resolve(text);
      });
  });
}

// ─── Init ─────────────────────────────────────────────────────────────────────
loadSettings();