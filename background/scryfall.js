// ======================================================
// scryfall.js — Requêtes Scryfall hybrides
// ======================================================

const SCRYFALL_DELAY = 120;
let lastCall = 0;

// Rate-limiting simple pour ne pas dépasser 10 req/sec
async function rateLimitedFetch(url) {
    const now = Date.now();
    const elapsed = now - lastCall;
    if (elapsed < SCRYFALL_DELAY) {
        await new Promise(res => setTimeout(res, SCRYFALL_DELAY - elapsed));
    }
    lastCall = Date.now();
    return fetch(url);
}

/**
 * fetchTranslationFromAPI
 */
export async function fetchTranslationFromAPI(english, lang = "fr") {
    try {

        const r1 = await rateLimitedFetch(
            `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(english)}`
        );
        if (!r1.ok) return null;

        const cardEN = await r1.json();

        // On récupère oracle_id uniquement
        const {oracle_id } = cardEN;

        let translated = null;

  

        if (!translated && oracle_id) {
            const r2 = await rateLimitedFetch(
                `https://api.scryfall.com/cards/search?q=oracle_id:${oracle_id}+lang:${lang}`
            );

            if (r2.ok) {
                const data = await r2.json();
                const card = data.data?.[0];
                if (card) {
                    if (card.card_faces?.length) {
                        translated = card.card_faces[0].printed_name || card.card_faces[0].name;
                    } else {
                        translated = card.printed_name || card.name;
                    }

                    // Sécurité : si identique au nom anglais, on ignore
                    if (translated && translated.toLowerCase() === english.toLowerCase()) {
                        translated = null;
                    }
                }
            }
        }

        return translated || null;

    } catch (e) {
        console.error("Scryfall error:", e);
        return null;
    }
}
