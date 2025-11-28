// ======================================================
// db.js — Gestion du cache IndexedDB (structure simple)
// ======================================================

// On garde une promesse unique (= singleton) pour éviter
// d'ouvrir plusieurs fois la base en parallèle.
let dbPromise = null;

// ------------------------------------------------------
// Fonction : openDB()
// Ouvre (ou crée) la base IndexedDB "mtgTranslations"
// ------------------------------------------------------
export function openDB() {

    // Si déjà ouverte → on renvoie la même promesse
    if (dbPromise) return dbPromise;

    // Sinon on crée l'ouverture
    dbPromise = new Promise((resolve, reject) => {

        // On demande à IndexedDB d'ouvrir la DB version 1
        const request = indexedDB.open("mtgTranslations", 1);

        // Appelé si la base n'existe pas encore ou change de version
        request.onupgradeneeded = (event) => {

            const db = event.target.result;

            // Si le store n'existe pas encore, on le crée
            // keyPath = "english" → clé primaire = nom anglais exact
            if (!db.objectStoreNames.contains("cards")) {
                const store = db.createObjectStore("cards", {
                    keyPath: "english"
                });

                // Un index sur le nom anglais (optionnel mais propre)
                store.createIndex("english", "english", { unique: true });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

    return dbPromise;
}

// ------------------------------------------------------
// Fonction : getLocalTranslation(english, lang)
// Renvoie la traduction locale si disponible
// ------------------------------------------------------
export async function getLocalTranslation(english, lang) {
    const db = await openDB();

    return new Promise((resolve) => {

        // Transaction en lecture seule
        const tx = db.transaction("cards", "readonly");
        const store = tx.objectStore("cards");

        // Lecture de l'entrée via sa clé primaire
        const req = store.get(english);

        req.onsuccess = () => {
            const entry = req.result;

            // Si la carte existe et contient déjà la langue voulue → OK
            if (entry && entry.translations && entry.translations[lang]) {
                resolve(entry.translations[lang]);
            } else {
                resolve(null);
            }
        };

        req.onerror = () => resolve(null);
    });
}

// ------------------------------------------------------
// Fonction : saveLocalTranslation(english, lang, value)
// Ajoute ou met à jour une traduction dans IndexedDB
// ------------------------------------------------------
export async function saveLocalTranslation(english, lang, translatedValue) {
    const db = await openDB();

    return new Promise((resolve, reject) => {

        // Transaction en écriture
        const tx = db.transaction("cards", "readwrite");
        const store = tx.objectStore("cards");

        // On récupère l'entrée existante (ou pas)
        const req = store.get(english);

        req.onsuccess = () => {

            // Si la carte existe déjà → on l'utilise
            // Sinon on crée une nouvelle structure minimale
            const entry = req.result || {
                english,
                translations: {}
            };

            // On ajoute / remplace la traduction
            entry.translations[lang] = translatedValue;

            // On enregistre dans IndexedDB
            const putReq = store.put(entry);

            putReq.onsuccess = () => resolve(true);
            putReq.onerror = () => reject(putReq.error);
        };

        req.onerror = () => reject(req.error);
    });
}
