console.log('Content script loaded');

// Configuration globale
let autoTranslateEnabled = false;
let selectedLanguage = 'fr';
let translationObserver = null;

// Charger les préférences au démarrage
async function loadSettings() {
  const result = await browser.storage.local.get(['autoTranslate', 'selectedLanguage']);
  autoTranslateEnabled = result.autoTranslate || false;
  selectedLanguage = result.selectedLanguage || 'fr';
  
  console.log('Settings loaded:', { autoTranslateEnabled, selectedLanguage });
  
  // Si auto-translate est activée, lancer la traduction
  if (autoTranslateEnabled && await isSiteSupported()) {
    console.log('Auto-translate is enabled and site is supported');
    waitForDomReady().then(() => {
      traduireEtRemplacer(selectedLanguage);
      setupMutationObserver(); // Observer les changements DOM dynamiques
    });
  }
}

// Vérifier si le site est supporté
async function isSiteSupported() {
  const domainSelectors = await getDomainSelectors();
  const currentDomain = window.location.hostname.replace(/^www\./, "");
  return domainSelectors.hasOwnProperty(currentDomain);
}

// Attendre que le DOM soit complètement chargé
function waitForDomReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else {
      // DOM déjà chargé (incluant les images)
      if (document.readyState === 'interactive') {
        window.addEventListener('load', resolve, { once: true });
      } else {
        resolve();
      }
    }
  });
}

// Observer les mutations DOM (pour sites dynamiques)
function setupMutationObserver() {
  if (translationObserver) {
    translationObserver.disconnect();
  }
  
  translationObserver = new MutationObserver((mutations) => {
    // Debounce : attendre 500ms après la dernière mutation
    clearTimeout(translationObserver.debounceTimer);
    translationObserver.debounceTimer = setTimeout(() => {
      if (autoTranslateEnabled) {
        console.log('DOM mutation detected, re-translating...');
        traduireEtRemplacer(selectedLanguage);
      }
    }, 500);
  });
  
  // Observer les changements du body
  translationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false
  });
  
  console.log('Mutation observer started');
}

// Gestionnaire des messages du popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content.js:', request.action);
  
  if (request.action === 'translate') {
    // Traduction manuelle (bouton Translate)
    selectedLanguage = request.lang;
    traduireEtRemplacer(request.lang);
  } 
  else if (request.action === 'autoTranslateToggled') {
    // Changement de la préférence auto-translate
    autoTranslateEnabled = request.enabled;
    selectedLanguage = request.lang;
    
    if (autoTranslateEnabled) {
      console.log('Auto-translate enabled');
      isSiteSupported().then(supported => {
        if (supported) {
          traduireEtRemplacer(selectedLanguage);
          setupMutationObserver();
        } else {
          console.log('Site not supported for auto-translation');
        }
      });
    } else {
      console.log('Auto-translate disabled');
      if (translationObserver) {
        translationObserver.disconnect();
      }
    }
  }
});

// Fonctions de traduction
function getDomainSelectors() {
  return fetch(browser.runtime.getURL('assets/selectors.json'))
    .then(response => response.json())
    .catch(error => console.error('Erreur lors du chargement du fichier JSON:', error));
}

async function selectionnerElementsATraduire() {
  const domainSelectors = await getDomainSelectors();
  const currentDomain = window.location.hostname.replace(/^www\./, "");
  const selectors = domainSelectors[currentDomain] || [];
  
  const elements = selectors
    .flatMap(item => {
      const parents = document.querySelectorAll(item.selector);
      return Array.from(parents).map(parent => {
        
        // 🔹 Mode composite (Moxfield)
        if (item.mode === "composite") {
          const parts = parent.querySelectorAll(item.childSelector);
          
          const isCategory = Array.from(parts).some(span => {
            const hasManaIcon = span.querySelector('.mana');
            const hasCounter = /\(\d+\)/.test(span.textContent);
            return hasManaIcon || hasCounter;
          });
          
          if (isCategory) {
            return null;
          }
          
          return {
            element: parent,
            composite: true,
            childSelector: item.childSelector
          };
        }
        
        // 🔹 Mode classique
        if (item.childIndex !== undefined && parent.children.length > item.childIndex) {
          return parent.children[item.childIndex];
        }
        return parent;
      });
    })
    .filter(Boolean);
  
  console.log(`Nombre d'éléments trouvés : ${elements.length}`);
  return elements;
}

function normaliserNomCarte(nom) {
  return nom.replace(/\s*\/\s*/g, ' // ');
}

async function traduireEtRemplacer(langueCible) {
  const items = await selectionnerElementsATraduire();

  const map = new Map();

  for (const item of items) {
    let element, original;

    if (item.composite) {
      element = item.element;

      if (element.hasAttribute("data-original-name")) {
        original = element.getAttribute("data-original-name");
      } else {
        const parts = [...element.querySelectorAll(item.childSelector)];
        original = parts.map(s => s.textContent.trim()).join(" ");
        original = normaliserNomCarte(original); 
        element.setAttribute("data-original-name", original);
      }
    } else {
      element = item;

      if (element.hasAttribute("data-original-name")) {
        original = element.getAttribute("data-original-name");
      } else {
        original = element.textContent.trim();
        original = normaliserNomCarte(original); 
        element.setAttribute("data-original-name", original);
      }
    }

    if (!original) continue;

    if (!map.has(original)) map.set(original, []);
    map.get(original).push(item);
  }

  console.log("Cartes uniques :", map.size);

  // Traduction en parallèle
  const translations = await Promise.all(
    [...map.keys()].map(name =>
      traduireNom(name, langueCible).then(t => [name, t])
    )
  );

  const dict = Object.fromEntries(translations);

  // Application DOM
  for (const [original, list] of map) {
    const translated = dict[original];

    for (const item of list) {
      const element = item.composite ? item.element : item;

      if (item.composite) {
        const spans = [...element.querySelectorAll(item.childSelector)];
        spans.forEach((s, i) => {
          s.textContent = i === 0 ? translated : "";
        });
      } else {
        element.textContent = translated;
      }

      element.onmouseenter = () => {
        if (item.composite) {
          const spans = [...element.querySelectorAll(item.childSelector)];
          spans.forEach((s, i) => s.textContent = i === 0 ? original : "");
        } else {
          element.textContent = original;
        }
      };

      element.onmouseleave = () => {
        if (item.composite) {
          const spans = [...element.querySelectorAll(item.childSelector)];
          spans.forEach((s, i) => s.textContent = i === 0 ? translated : "");
        } else {
          element.textContent = translated;
        }
      };
    }
  }

  console.log("Traduction terminée");
}

async function traduireNom(text, targetLanguage) {
  return new Promise((resolve) => {
    browser.runtime.sendMessage(
      { action: "translate", text: text, targetLanguage: targetLanguage }
    ).then((response) => {
      resolve(response.translatedText);
    }).catch((error) => {
      console.error("Translation error:", error);
      resolve(text);
    });
  });
}

// Charger les settings au démarrage
loadSettings();
