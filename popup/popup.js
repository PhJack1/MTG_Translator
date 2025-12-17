document.addEventListener('DOMContentLoaded', () => {
  const flags = document.querySelectorAll('.flag');
  const translateButton = document.getElementById('translate-button');
  const textEn = document.getElementById('text-inputEn');
  const textTrad = document.getElementById('text-inputTrad');
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

saveDbButton.addEventListener('click', () => {
    console.log('SaveDB button clicked, language:', selectedLanguage);

    // Check if any of the fields are empty or contain only spaces
    if (!textEn.value.trim() || !textTrad.value.trim()) {
        console.log('Error: One or more fields are empty or contain only spaces.');
        return;
    }

    browser.runtime.sendMessage({
        action: 'saveToDb',
        english: textEn.value,
        trad: textTrad.value,
        lang: selectedLanguage
    }).then(response => {
        console.log('Message sent to background script:', response);
    }).catch(error => {
        console.error('Error sending message:', error);
    });
});


exportButton.addEventListener('click', () => {
    browser.runtime.sendMessage({
        action: 'exportDb'
    }).then(response => {
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
    }).catch(error => {
        console.error('Error sending message:', error);
    });
});

importButton.addEventListener('click', () => {   /// A BOSSER CREER LA PAGE BIEN LA RANGER POUR LAPPELER ET LA FERMER APRES AVOIR GERER LIMPORT DE FICHIER
    browser.tabs.create({
        url: browser.runtime.getURL('import.html')
    });
});



// FIN DE LA POPUP (on domload etc)
})
