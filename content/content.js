console.log('Content script loaded');

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    console.log('Message received in content.js:', request.lang);
    traduireEtRemplacer(request.lang);
  }
});


function getDomainSelectors() {
  // Charger le fichier JSON contenant les sélecteurs
  return fetch(browser.runtime.getURL('assets/selectors.json'))
    .then(response => response.json())
    .catch(error => console.error('Erreur lors du chargement du fichier JSON:', error));
}

async function selectionnerElementsATraduire() {
  const domainSelectors = await getDomainSelectors();
  const currentDomain = window.location.hostname;

  // Trouver les sélecteurs pour le domaine actuel
  const selectors = domainSelectors[currentDomain] || [];

  // Sélectionner les éléments en utilisant les sélecteurs trouvés
  const elements = selectors.flatMap(item => {
    const parentElements = document.querySelectorAll(item.selector);
    return Array.from(parentElements).map(parent => {
      if (item.childIndex !== undefined && parent.children.length > item.childIndex) {
        return parent.children[item.childIndex];
      }
      return parent;
    });
  });

  console.log(`Nombre d'éléments trouvés : ${elements.length}`);
  return elements;
}

async function traduireEtRemplacer(langueCible) {
  const elements = await selectionnerElementsATraduire();

  for (const element of elements) {
    let nomOriginal;

    // Vérifier si un attribut contenant le nom original existe déjà
    if (element.hasAttribute('data-original-name')) {
      nomOriginal = element.getAttribute('data-original-name');
    } else {
      nomOriginal = element.textContent.trim();
      // Ajouter un attribut contenant le nom original
      element.setAttribute('data-original-name', nomOriginal);
    }

    console.log(`Traitement de l'élément : "${nomOriginal}"`);

    const nomTraduit = await traduireNom(nomOriginal, langueCible);
    console.log(`Remplacement de "${nomOriginal}" par "${nomTraduit}"`);

    // Supprimer les événements mouseover et mouseout existants
    element.removeEventListener('mouseover', () => {
      element.textContent = nomOriginal;
    });
    element.removeEventListener('mouseout', () => {
      element.textContent = nomTraduit;
    });

    // Mettre à jour le texte de l'élément
    element.textContent = nomTraduit;

    // Ajouter de nouveaux événements mouseover et mouseout
    element.addEventListener('mouseover', () => {
      element.textContent = nomOriginal;
    });
    element.addEventListener('mouseout', () => {
      element.textContent = nomTraduit;
    });
  }
  console.log("Traduction terminée !");
}

async function traduireNom(text, targetLanguage) {
  return new Promise((resolve) => {
    browser.runtime.sendMessage(
      { action: "translate", text: text, targetLanguage: targetLanguage }
    ).then((response) => {
      resolve(response.translatedText);
    }).catch((error) => {
      console.error("Translation error:", error);
      resolve(text); // Fallback to original text
    });
  });
}
