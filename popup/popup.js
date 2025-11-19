document.addEventListener('DOMContentLoaded', () => {
  const flags = document.querySelectorAll('.flag');
  const translateButton = document.getElementById('translate-button');
  const saveDbButton = document.getElementById('saveDb-button');
  const importButton = document.getElementById('import-button');
  const exportButton = document.getElementById('export-button');
  
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
    console.log('Translate button clicked, language:', selectedLanguage);
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Sending message to tab:', tabs[0].id);
    browser.tabs.sendMessage(tabs[0].id, { action: 'translate', lang: selectedLanguage });
    });
  });
});
