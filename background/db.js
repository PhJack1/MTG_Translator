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

// ------------------------------------------------------
// Fonction : exportToJSON()
// Exporte les données de IndexedDB vers un objet JSON
// ------------------------------------------------------
export async function exportToJSON() {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("cards", "readonly");
        const store = tx.objectStore("cards");
        const req = store.getAll();

        req.onsuccess = () => {
            const data = req.result;
            resolve(data);
        };

        req.onerror = () => reject(req.error);
    });
}

// ------------------------------------------------------
// Fonction : importFromJSON(jsonData)
// Importe et fusionne les données depuis un objet JSON
// ------------------------------------------------------
export async function importFromJSON(jsonData) {
    // Ouvre la base de données IndexedDB de manière asynchrone
    // await est utilisé car openDB() retourne une promesse
    const db = await openDB();

    // Retourne une nouvelle promesse pour gérer l'importation de manière asynchrone
    // La fonction async/await est utilisée à l'intérieur pour gérer les opérations asynchrones
    return new Promise(async (resolve, reject) => {
        // Commence une transaction en lecture/écriture sur le store "cards"
        // Une transaction est une unité de travail qui garantit l'intégrité des données
        const tx = db.transaction("cards", "readwrite");

        // Obtient une référence au store "cards" dans la transaction
        // Un store est comme une table dans une base de données relationnelle
        const store = tx.objectStore("cards");

        try {
            // Utilisation d'une boucle for...of pour itérer sur chaque carte dans jsonData
            // jsonData est supposé être un tableau d'objets représentant des cartes
            for (const card of jsonData) {
                // Récupère la carte existante dans IndexedDB par son nom anglais (clé primaire)
                // store.get() est une opération asynchrone qui retourne une requête (request)
                const req = store.get(card.english);

                // Gestion de l'événement onsuccess de la requête
                // Cet événement est déclenché lorsque la requête se termine avec succès
                req.onsuccess = () => {
                    // req.result contient la carte existante ou undefined si elle n'existe pas
                    // L'opérateur || est utilisé pour fournir une valeur par défaut si req.result est falsy
                    const existingCard = req.result || {
                        english: card.english,  // Utilise le nom anglais de la carte JSON
                        translations: {}        // Initialise un objet vide pour les traductions
                    };

                    // Utilisation d'une boucle for...in pour itérer sur les propriétés (langues) de l'objet translations
                    // card.translations est supposé être un objet avec des clés représentant les langues
                    for (const lang in card.translations) {
                        // Ajoute ou met à jour la traduction pour chaque langue
                        // existingCard.translations[lang] = card.translations[lang] est une affectation
                        // qui ajoute ou met à jour la traduction pour la langue spécifiée
                        existingCard.translations[lang] = card.translations[lang];
                    }

                    // Met à jour la carte dans IndexedDB avec les traductions fusionnées
                    // store.put() est une opération asynchrone qui met à jour ou ajoute une entrée dans le store
                    // Si la carte existe déjà, elle est mise à jour ; sinon, elle est ajoutée
                    store.put(existingCard);
                };

                // Gestion de l'événement onerror de la requête
                // Cet événement est déclenché si la requête échoue
                req.onerror = () => reject(req.error);
            }

            // Résout la promesse avec true si toutes les opérations se sont bien passées
            // resolve est une fonction fournie par la promesse pour indiquer que l'opération est terminée avec succès
            resolve(true);
        } catch (error) {
            // Gestion des erreurs qui pourraient survenir dans le bloc try
            // reject est une fonction fournie par la promesse pour indiquer que l'opération a échoué
            reject(error);
        }
    });
}