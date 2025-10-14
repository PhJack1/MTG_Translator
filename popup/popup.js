document.addEventListener('DOMContentLoaded', () => {
  const flags = document.querySelectorAll('.flag');
  const textInput = document.getElementById('text-input');
  const translateButton = document.getElementById('translate-button');
  const originalButton = document.getElementById('original-button');
  const optionsButton = document.getElementById('options-button');

  let selectedLanguage = 'fr';

  console.log('Popup loaded');

  if (flags.length === 0) {
    console.error('No flags found');
  } else {
    console.log('Flags found:', flags.length);
  }

  // Sélectionnez le drapeau français par défaut
  const defaultFlag = document.getElementById('flag-fr');
  if (defaultFlag) {
    defaultFlag.classList.add('selected');
    console.log('Default flag selected:', defaultFlag);
  }

  flags.forEach(flag => {
    flag.addEventListener('click', () => {
      flags.forEach(f => f.classList.remove('selected'));
      flag.classList.add('selected');
      selectedLanguage = flag.getAttribute('data-lang');
      console.log('Selected language:', selectedLanguage);
      console.log('Flag class list:', flag.classList);
    });
  });

  translateButton.addEventListener('click', () => {
    const text = textInput.value;
    if (text) {
      console.log('Translate button clicked, text:', text, 'language:', selectedLanguage);
      browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        browser.tabs.sendMessage(tabs[0].id, { action: 'translate', text: text, lang: selectedLanguage });
      });
    } else {
      console.log('No text to translate');
    }
  });

  originalButton.addEventListener('click', () => {
    console.log('Original button clicked');
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: 'original' });
    });
  });

  optionsButton.addEventListener('click', () => {
    console.log('Options button clicked');
    browser.runtime.openOptionsPage();
  });
});