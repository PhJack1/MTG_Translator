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

  const elements = selectors.flatMap(item => {
    const parentElements = document.querySelectorAll(item.selector);

    return Array.from(parentElements).map(parent => {
      // Mode spécial Moxfield (noms splittés en plusieurs spans)
      if (item.mode === "composite") {
        return {
          element: parent,
          composite: true,
          childSelector: item.childSelector
        };
      }

      // Mode normal
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

  for (const item of elements) {
    let element;
    let nomOriginal;

    // 🔹 Cas Moxfield (nom composite)
    if (item.composite) {
      element = item.element;
      const parts = [...element.querySelectorAll(item.childSelector)];
      nomOriginal = parts.map(s => s.textContent.trim()).join(" ");
    } 
    // 🔹 Cas normal
    else {
      element = item;
      nomOriginal = element.textContent.trim();
    }

    if (!nomOriginal) continue;

    // Stocker le nom original
    if (!element.hasAttribute("data-original-name")) {
      element.setAttribute("data-original-name", nomOriginal);
    } else {
      nomOriginal = element.getAttribute("data-original-name");
    }

    console.log(`Traitement : "${nomOriginal}"`);

    const nomTraduit = await traduireNom(nomOriginal, langueCible);

    // 🔹 Écriture du texte traduit
    if (item.composite) {
      const parts = [...element.querySelectorAll(item.childSelector)];
      parts.forEach((span, i) => {
        span.textContent = (i === 0) ? nomTraduit : "";
      });
    } else {
      element.textContent = nomTraduit;
    }

    // 🔹 Hover original / traduit
    element.onmouseenter = () => {
      if (item.composite) {
        const parts = [...element.querySelectorAll(item.childSelector)];
        const original = element.getAttribute("data-original-name");
        parts.forEach((span, i) => {
          span.textContent = i === 0 ? original : "";
        });
      } else {
        element.textContent = element.getAttribute("data-original-name");
      }
    };

    element.onmouseleave = () => {
      if (item.composite) {
        const parts = [...element.querySelectorAll(item.childSelector)];
        parts.forEach((span, i) => {
          span.textContent = i === 0 ? nomTraduit : "";
        });
      } else {
        element.textContent = nomTraduit;
      }
    };
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
