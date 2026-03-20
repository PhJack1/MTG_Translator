document.addEventListener('DOMContentLoaded', () => {
  const flags = document.querySelectorAll('.flag');
  const translateButton = document.getElementById('translate-button');
  const autoTranslateToggle = document.getElementById('autoTranslateToggle');
  const textEn = document.getElementById('text-inputEn');
  const textTrad = document.getElementById('text-inputTrad');
  const saveDbButton = document.getElementById('saveDb-button');
  const importButton = document.getElementById('import-button');
  const exportButton = document.getElementById('export-button');

  let selectedLanguage = 'fr';

  console.log('Popup loaded');

  function applyTranslations(lang) {
    document.querySelectorAll('[data-translations]').forEach(el => {
      try {
        const translations = JSON.parse(el.dataset.translations);
        if (translations[lang]) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translations[lang];
          } else {
            el.textContent = translations[lang];
          }
        }
      } catch (e) {
        console.error('Error parsing translations for', el, e);
      }
    });
  }

  browser.storage.local.get('selectedLanguage').then(result => {
    if (result.selectedLanguage) {
      selectedLanguage = result.selectedLanguage;
      console.log('Restored language:', selectedLanguage);
    } else {
      console.log('No stored language, using default FR');
    }
    flags.forEach(flag => {
      flag.classList.toggle('selected', flag.getAttribute('data-lang') === selectedLanguage);
    });
    applyTranslations(selectedLanguage);
  });

  browser.storage.local.get('autoTranslate').then(result => {
    autoTranslateToggle.checked = result.autoTranslate || false;
    console.log('Auto-translate restored:', autoTranslateToggle.checked);
  });

  autoTranslateToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    browser.storage.local.set({ autoTranslate: isEnabled });
    console.log('Auto-translate toggled:', isEnabled);
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'autoTranslateToggled',
          enabled: isEnabled,
          lang: selectedLanguage,
        }).catch(err => console.log('Content script not ready:', err));
      }
    });
  });

 flags.forEach(flag => {
  flag.addEventListener('click', () => {
    flags.forEach(f => f.classList.remove('selected'));
    flag.classList.add('selected');
    selectedLanguage = flag.getAttribute('data-lang');
    console.log('Selected language:', selectedLanguage);
    browser.storage.local.set({ selectedLanguage });
    applyTranslations(selectedLanguage);

    // Si auto-translate actif, relancer la traduction dans la nouvelle langue
    if (autoTranslateToggle.checked) {
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          browser.tabs.sendMessage(tabs[0].id, {
            action: 'translate',
            lang: selectedLanguage,
          }).catch(err => console.log('Error:', err));
        }
      });
    }
  });
});

  translateButton.addEventListener('click', () => {
    if (translateButton.disabled) return;

    console.log('Translate button clicked, language:', selectedLanguage);

    translateButton.disabled = true;
    const originalText = translateButton.textContent;
    translateButton.textContent = '⏳ …';

    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        translateButton.disabled = false;
        translateButton.textContent = originalText;
        return;
      }
      browser.tabs.sendMessage(tabs[0].id, { action: 'translate', lang: selectedLanguage })
        .catch(err => console.log('Error sending translate message:', err))
        .finally(() => {
          setTimeout(() => {
            translateButton.disabled = false;
            translateButton.textContent = originalText;
          }, 1200);
        });
    });
  });

  saveDbButton.addEventListener('click', () => {
    console.log('SaveDB button clicked, language:', selectedLanguage);
    if (!textEn.value.trim() || !textTrad.value.trim()) {
      console.log('Error: One or more fields are empty or contain only spaces.');
      return;
    }
    browser.runtime.sendMessage({
      action: 'saveToDb',
      english: textEn.value,
      trad: textTrad.value,
      lang: selectedLanguage,
    }).then(response => {
      console.log('Message sent to background script:', response);
    }).catch(error => {
      console.error('Error sending message:', error);
    });
  });

  exportButton.addEventListener('click', () => {
    browser.runtime.sendMessage({ action: 'exportDb' }).then(response => {
      if (response.status === 'success') {
        const blob = new Blob([response.data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'localDB_MTG_Cards_Names.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error('Error exporting data:', response.message);
      }
    }).catch(error => console.error('Error sending message:', error));
  });

  importButton.addEventListener('click', () => {
    browser.windows.create({
      url: browser.runtime.getURL('background/import.html'),
      type: 'popup',
      width: 480,
      height: 300,
      focused: true,
    }, (window) => {
      if (window && window.tabs && window.tabs[0]) {
        setTimeout(() => {
          browser.tabs.sendMessage(window.tabs[0].id, {
            action: 'setLanguage',
            lang: selectedLanguage,
          }).catch(err => {
            console.log('Message delayed or failed, retrying:', err);
            setTimeout(() => {
              browser.tabs.sendMessage(window.tabs[0].id, {
                action: 'setLanguage',
                lang: selectedLanguage,
              }).catch(console.error);
            }, 500);
          });
        }, 100);
      }
    });
  });

  let currentPage = 0;
  const pages = document.querySelectorAll('.page');
  const prevBtn = document.getElementById('nav-prev');
  const nextBtn = document.getElementById('nav-next');

  function updatePages() {
    pages.forEach((page, index) => page.classList.toggle('active', index === currentPage));
  }

  prevBtn.addEventListener('click', () => {
    currentPage = (currentPage - 1 + pages.length) % pages.length;
    updatePages();
  });

  nextBtn.addEventListener('click', () => {
    currentPage = (currentPage + 1) % pages.length;
    updatePages();
  });

  updatePages();
});