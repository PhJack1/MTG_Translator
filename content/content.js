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
  const currentDomain = window.location.hostname.replace(/^www\./, "");
  const selectors = domainSelectors[currentDomain] || [];
  
  const elements = selectors
    .flatMap(item => {
      const parents = document.querySelectorAll(item.selector);
      return Array.from(parents).map(parent => {
        
        // 🔹 Mode composite (Moxfield)
        if (item.mode === "composite") {
          const parts = parent.querySelectorAll(item.childSelector);
          
          // Exclure les catégories en vérifiant :
          // 1. Présence d'une icône mana
          // 2. OU présence d'un compteur (X) dans le texte
          const isCategory = Array.from(parts).some(span => {
            const hasManaIcon = span.querySelector('.mana');
            const hasCounter = /\(\d+\)/.test(span.textContent);
            return hasManaIcon || hasCounter;
          });
          
          if (isCategory) {
            return null; // C'est une catégorie, on l'ignore
          }
          
          return {
            element: parent,
            composite: true,
            childSelector: item.childSelector
          };
        }
        
        // 🔹 Mode classique
        if (item.childIndex !== undefined && parent.children.length > item.childIndex) {
          return parent.children[item.childIndex];
        }
        return parent;
      });
    })
    .filter(Boolean);
  
  console.log(`Nombre d'éléments trouvés : ${elements.length}`);
  return elements;
}

function normaliserNomCarte(nom) {
  // Normalise les séparateurs des cartes doubles/split
  // "Fire / Ice" ou "Fire/Ice" → "Fire // Ice"
  return nom.replace(/\s*\/\s*/g, ' // ');
}

async function traduireEtRemplacer(langueCible) {
  const items = await selectionnerElementsATraduire();

  const map = new Map(); // originalEN → [items]

  for (const item of items) {
    let element, original;

    if (item.composite) {
      element = item.element;

      if (element.hasAttribute("data-original-name")) {
        original = element.getAttribute("data-original-name");
      } else {
        const parts = [...element.querySelectorAll(item.childSelector)];
        original = parts.map(s => s.textContent.trim()).join(" ");
        original = normaliserNomCarte(original); 
        element.setAttribute("data-original-name", original);
      }
    } else {
      element = item;

      if (element.hasAttribute("data-original-name")) {
        original = element.getAttribute("data-original-name");
      } else {
        original = element.textContent.trim();
        original = normaliserNomCarte(original); 
        element.setAttribute("data-original-name", original);
      }
    }

    if (!original) continue;

    if (!map.has(original)) map.set(original, []);
    map.get(original).push(item);
  }

  console.log("Cartes uniques :", map.size);

  // Traduction en parallèle
  const translations = await Promise.all(
    [...map.keys()].map(name =>
      traduireNom(name, langueCible).then(t => [name, t])
    )
  );

  const dict = Object.fromEntries(translations);

  // Application DOM
  for (const [original, list] of map) {
    const translated = dict[original];

    for (const item of list) {
      const element = item.composite ? item.element : item;

      if (item.composite) {
        const spans = [...element.querySelectorAll(item.childSelector)];
        spans.forEach((s, i) => {
          s.textContent = i === 0 ? translated : "";
        });
      } else {
        element.textContent = translated;
      }

      element.onmouseenter = () => {
        if (item.composite) {
          const spans = [...element.querySelectorAll(item.childSelector)];
          spans.forEach((s, i) => s.textContent = i === 0 ? original : "");
        } else {
          element.textContent = original;
        }
      };

      element.onmouseleave = () => {
        if (item.composite) {
          const spans = [...element.querySelectorAll(item.childSelector)];
          spans.forEach((s, i) => s.textContent = i === 0 ? translated : "");
        } else {
          element.textContent = translated;
        }
      };
    }
  }

  console.log("Traduction terminée (rapide + stable)");
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
