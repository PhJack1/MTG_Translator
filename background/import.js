import { importFromJSON } from './db.js';

const dropzone = document.getElementById('dropzone');
const input = document.getElementById('fileInput');
const pick = document.getElementById('pick');
const status = document.getElementById('status');

// Fonction principale pour traiter le fichier
function handleFile(file) {
    if (!file) return;

    status.textContent = 'Lecture du fichier…';

    const reader = new FileReader();

    reader.onload = async () => {
        try {
            const json = JSON.parse(reader.result);

            if (!Array.isArray(json)) {
                throw new Error('Le fichier JSON doit être un tableau');
            }

            await importFromJSON(json);

            status.textContent = 'Import réussi ✅';
            setTimeout(() => window.close(), 900);

        } catch (err) {
            console.error(err);
            status.textContent = 'Erreur : ' + err.message;
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
