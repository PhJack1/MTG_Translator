console.log('Content script loaded');
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    console.log('Message received in content.js:', request.lang);
    traduireEtRemplacer(request.lang)
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



// 2. Remplacer chaque nom par sa traduction
async function traduireEtRemplacer(langueCible) {


// Sélectionner tous les éléments <a href="#7">
const elements = document.querySelectorAll('a[href="#7"]');
console.log(`Nombre d'éléments trouvés : ${elements.length}`);

  for (const element of elements) {
    const nomOriginal = element.textContent.trim();
    console.log(`Traitement de l'élément : "${nomOriginal}"`);

    const nomTraduit = await traduireNomScryfall(nomOriginal, langueCible);
    console.log(`Remplacement de "${nomOriginal}" par "${nomTraduit}"`);

    element.textContent = nomTraduit;
   // Ajouter un événement mouseover pour afficher le nom original
    element.addEventListener('mouseover', () => {
      element.textContent = nomOriginal;
    });

    // Ajouter un événement mouseout pour revenir au nom traduit
    element.addEventListener('mouseout', () => {
      element.textContent = nomTraduit;
    });
  }
  console.log("Traduction terminée !");
}