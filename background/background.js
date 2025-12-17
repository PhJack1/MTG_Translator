import { getTranslation } from "./translations.js";
import { saveLocalTranslation, importFromJSON, exportToJSON   } from "./db.js";


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
  if (request.action === "saveToDb") {
    saveLocalTranslation(request.english, request.lang, request.trad)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error("Save error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required to use sendResponse asynchronously
  }
if (request.action === 'exportDb') {
        exportToJSON().then(jsonData => {
            sendResponse({ status: 'success', data: JSON.stringify(jsonData, null, 2) });
        }).catch(error => {
            console.error('Error exporting data:', error);
            sendResponse({ status: 'error', message: 'Error exporting data' });
        });
        return true; // Keep the message channel open for the response
    }

});
