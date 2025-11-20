console.log('Content script loaded');

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    console.log('Message received in content.js:', request.lang);
    traduireEtRemplacer(request.lang);
  }
});

async function traduireNomScryfall(nomOriginal, langueCible = "fr") {
  try {
    console.log(`Recherche de la traduction pour : "${nomOriginal}" (→ ${langueCible})`);

    // Étape 1 : Récupérer l'oracle_id de la carte
    const responseEn = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(nomOriginal)}`);
    const dataEn = await responseEn.json();
    const oracleId = dataEn.oracle_id;
    console.log(`Oracle ID : ${oracleId}`);

    // Étape 2 : Chercher les impressions dans la langue cible
    const responseFr = await fetch(`https://api.scryfall.com/cards/search?q=oracle_id:${oracleId}+lang:${langueCible}`);
    const dataFr = await responseFr.json();

    if (dataFr.data && dataFr.data.length > 0) {
      const carte = dataFr.data[0];

      // Cas spécial pour les cartes double-face : on prend le nom du recto (card_faces[0].printed_name)
      if (carte.card_faces && carte.card_faces.length > 0) {
        const nomTraduit = carte.card_faces[0].printed_name || carte.card_faces[0].name;
        console.log(`Traduction trouvée pour "${nomOriginal}" : "${nomTraduit}"`);
        return nomTraduit;
      } else {
        // Cas standard : on prend printed_name ou name
        const nomTraduit = carte.printed_name || carte.name;
        console.log(`Traduction trouvée pour "${nomOriginal}" : "${nomTraduit}"`);
        return nomTraduit;
      }
    } else {
      console.log(`Aucune traduction en ${langueCible} trouvée pour "${nomOriginal}".`);
      return nomOriginal;
    }
  } catch (error) {
    console.error(`Erreur pour "${nomOriginal}" :`, error);
    return nomOriginal;
  }
}

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

    const nomTraduit = await traduireNomScryfall(nomOriginal, langueCible);
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

