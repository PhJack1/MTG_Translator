document.addEventListener('DOMContentLoaded', () => {
  const flags = document.querySelectorAll('.flag');
  const translateButton = document.getElementById('translate-button');
  const saveDbButton = document.getElementById('saveDb-button');
  const importButton = document.getElementById('import-button');
  const exportButton = document.getElementById('export-button');

  let selectedLanguage = 'fr'; // Valeur par défaut

  console.log('Popup loaded');

  // Restaurer la langue sauvegardée
  browser.storage.local.get('selectedLanguage').then(result => {
    if (result.selectedLanguage) {
      selectedLanguage = result.selectedLanguage;
      console.log('Restored language:', selectedLanguage);
    } else {
      console.log('No stored language, using default FR');
    }

    // Appliquer la sélection graphique
    flags.forEach(flag => {
      if (flag.getAttribute('data-lang') === selectedLanguage) {
        flag.classList.add('selected');
      } else {
        flag.classList.remove('selected');
      }
    });
  });

  // Gestion du clic sur les drapeaux
  flags.forEach(flag => {
    flag.addEventListener('click', () => {
      flags.forEach(f => f.classList.remove('selected'));
      flag.classList.add('selected');

      selectedLanguage = flag.getAttribute('data-lang');
      console.log('Selected language:', selectedLanguage);

      // Sauvegarde dans le stockage
      browser.storage.local.set({ selectedLanguage });
    });
  });

  // Bouton translate
  translateButton.addEventListener('click', () => {
    console.log('Translate button clicked, language:', selectedLanguage);
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Sending message to tab:', tabs[0].id);
      browser.tabs.sendMessage(tabs[0].id, { action: 'translate', lang: selectedLanguage });
    });
  });
});
