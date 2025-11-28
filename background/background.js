import { getTranslation } from "./translations.js";

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "translate") {
    // Call the generic translation function
    getTranslation(request.text, request.targetLanguage)
      .then((translatedText) => {
        sendResponse({ translatedText: translatedText });
      })
      .catch((error) => {
        console.error("Translation error:", error);
        sendResponse({ translatedText: request.text }); // Fallback to original text
      });
    return true; // Required to use sendResponse asynchronously
  }
});

