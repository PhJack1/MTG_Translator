// ======================================================
// translations.js — API publique de traduction
// ======================================================

import {
    getLocalTranslation,
    saveLocalTranslation
} from "./db.js";

import {
    fetchTranslationFromAPI
} from "./scryfall.js";

// ------------------------------------------------------
// getTranslation(english, lang)
// → 1) cherche dans IndexedDB
// → 2) sinon appelle Scryfall (2 requêtes)
// → 3) stocke le résultat dans IndexedDB
// ------------------------------------------------------
export async function getTranslation(english, lang) {

    if (!english || typeof english !== "string") {
        console.error("Invalid card name:", english);
        return null;
    }

    // 1) Essayer en local (instantané)
    const local = await getLocalTranslation(english, lang);
    if (local) return local;

    // 2) Appel Scryfall (EN → oracle → FR)
    const translated = await fetchTranslationFromAPI(english, lang);
    if (translated) {
        // Stockage pour éviter les prochains appels API
        await saveLocalTranslation(english, lang, translated);
        return translated;
    }

    // 3) Rien trouvé mais au moins rien enregistré localement
    return english;
}

