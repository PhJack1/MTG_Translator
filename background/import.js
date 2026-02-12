import { importFromJSON } from './db.js';

const dropzone = document.getElementById('dropzone');
const input = document.getElementById('fileInput');
const pick = document.getElementById('pick');
const status = document.getElementById('status');

let currentLanguage = 'fr'; // Langue par défaut

// Traductions des messages
const messageTranslations = {
  'success': {
    'es': 'Importación exitosa ✓',
    'fr': 'Import réussi ✓',
    'de': 'Import erfolgreich ✓',
    'it': 'Importazione riuscita ✓',
    'pt': 'Importação bem-sucedida ✓',
    'ja': 'インポート成功 ✓',
    'ko': '가져오기 성공 ✓',
    'ru': 'Импорт успешен ✓',
    'zh': '导入成功 ✓',
    'zh-TW': '導入成功 ✓'
  },
  'loading': {
    'es': 'Leyendo archivo…',
    'fr': 'Lecture du fichier…',
    'de': 'Datei wird gelesen…',
    'it': 'Lettura del file…',
    'pt': 'Lendo arquivo…',
    'ja': 'ファイルを読み込み中…',
    'ko': '파일을 읽는 중…',
    'ru': 'Чтение файла…',
    'zh': '正在读取文件…',
    'zh-TW': '正在讀取檔案…'
  },
  'error': {
    'es': 'Error: ',
    'fr': 'Erreur : ',
    'de': 'Fehler: ',
    'it': 'Errore: ',
    'pt': 'Erro: ',
    'ja': 'エラー: ',
    'ko': '오류: ',
    'ru': 'Ошибка: ',
    'zh': '错误：',
    'zh-TW': '錯誤：'
  },
  'arrayError': {
    'es': 'El archivo JSON debe ser un array',
    'fr': 'Le fichier JSON doit être un tableau',
    'de': 'Die JSON-Datei muss ein Array sein',
    'it': 'Il file JSON deve essere un array',
    'pt': 'O arquivo JSON deve ser um array',
    'ja': 'JSONファイルは配列である必要があります',
    'ko': 'JSON 파일은 배열이어야 합니다',
    'ru': 'JSON файл должен быть массивом',
    'zh': 'JSON文件必须是数组',
    'zh-TW': 'JSON檔案必須是陣列'
  }
};

// Fonction pour appliquer les traductions
function applyTranslations(lang) {
  document.querySelectorAll('[data-translations]').forEach(el => {
    try {
      const translations = JSON.parse(el.dataset.translations);
      if (translations[lang]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[lang];
        } else {
          // Pour les boutons avec du texte
          if (el.tagName === 'BUTTON') {
            el.textContent = translations[lang];
          } else if (el.tagName === 'P') {
            el.textContent = translations[lang];
          } else {
            el.textContent = translations[lang];
          }
        }
      }
    } catch (e) {
      console.error('Error parsing translations for', el, e);
    }
  });
}

// Recevoir la langue du popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setLanguage') {
    currentLanguage = request.lang;
    console.log('Import: Language set to:', currentLanguage);
    applyTranslations(currentLanguage);
    
    // Mettre à jour le title aussi
    const titleElement = document.querySelector('title[data-translations]');
    if (titleElement) {
      try {
        const translations = JSON.parse(titleElement.dataset.translations);
        if (translations[currentLanguage]) {
          document.title = translations[currentLanguage];
        }
      } catch (e) {
        console.error('Error updating title:', e);
      }
    }
    
    sendResponse({ status: 'success' });
  }
});

// Fonction principale pour traiter le fichier
function handleFile(file) {
    if (!file) return;

    status.textContent = messageTranslations.loading[currentLanguage] || messageTranslations.loading['fr'];

    const reader = new FileReader();

    reader.onload = async () => {
        try {
            const json = JSON.parse(reader.result);

            if (!Array.isArray(json)) {
                throw new Error(messageTranslations.arrayError[currentLanguage] || messageTranslations.arrayError['fr']);
            }

            await importFromJSON(json);

            status.textContent = messageTranslations.success[currentLanguage] || messageTranslations.success['fr'];
            setTimeout(() => window.close(), 900);

        } catch (err) {
            console.error(err);
            const errorMsg = messageTranslations.error[currentLanguage] || messageTranslations.error['fr'];
            status.textContent = errorMsg + err.message;
        }
    };

    reader.readAsText(file);
}

// Clic sur bouton → ouvre file picker
pick.addEventListener('click', () => {
    input.click();
});

// Input classique
input.addEventListener('change', () => {
    handleFile(input.files[0]);
});

// Drag & drop
dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    handleFile(file);
});