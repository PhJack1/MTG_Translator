# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

Estensione per browser Firefox che traduce automaticamente i nomi delle carte Magic: The Gathering sui siti web di decklist più popolari.

## 🎯 Funzionalità

- **Traduzione in tempo reale**: Traduce istantaneamente i nomi delle carte MTG nella lingua scelta
- **Supporto multilingue**: 10 lingue disponibili (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **Siti compatibili**: MTGTop8, MTGGoldfish, Moxfield, MTGDecks.net, DeckStats, Archidekt, TappedOut, EDHREC e altri (vedi `assets/selectors.json` per l'elenco completo)
- **Cache locale intelligente**: Utilizza IndexedDB per memorizzare le traduzioni e ridurre le chiamate API
- **Modalità hover**: Visualizza il nome originale in inglese passando il mouse su una carta tradotta
- **Importa/Esporta**: Salva e condividi il tuo database di traduzioni personalizzato

## 📦 Installazione

### Da Firefox Add-ons (prossimamente)
*(In attesa di pubblicazione)*

### Installazione manuale (sviluppatori)

1. Clona il repository:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. In Firefox:
   - Digita `about:debugging` nella barra degli indirizzi
   - Fai clic su "Questo Firefox" nel menu di sinistra
   - Fai clic su "Carica componente aggiuntivo temporaneo"
   - Seleziona il file `manifest.json` nella cartella del progetto

## 🚀 Utilizzo

1. **Seleziona la tua lingua**: Fai clic sull'icona dell'estensione e scegli la tua lingua di destinazione tra le bandiere disponibili

2. **Traduci una pagina**: 
   - Visita un sito supportato (es: mtgtop8.com)
   - Fai clic sul pulsante "Traduci le carte nella pagina"
   - I nomi delle carte vengono tradotti istantaneamente!

3. **Visualizza il nome originale**: Passa il mouse su una carta tradotta per visualizzare temporaneamente il suo nome in inglese

4. **Aggiungi una traduzione manuale**:
   - Inserisci il nome in inglese nel primo campo
   - Inserisci la traduzione nel secondo campo
   - Fai clic su "Salva"

5. **Esporta/Importa il tuo database**:
   - **Esporta**: Scarica il tuo database di traduzioni in formato JSON
   - **Importa**: Trascina e rilascia un file JSON per unire le traduzioni

## 🔧 Architettura Tecnica

### Stack
- **Manifest V2** (Firefox)
- **Moduli JavaScript (ES6)**
- **IndexedDB** per cache locale
- **API Scryfall** per le traduzioni

### Struttura del Progetto
```
MTG_Translator/
├── manifest.json           # Configurazione dell'estensione
├── popup/
│   ├── popup.html         # Interfaccia utente
│   ├── popup.js           # Logica del popup
│   └── popup.css          # Stili
├── content/
│   └── content.js         # Script iniettato nelle pagine web
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # API di traduzione
│   ├── scryfall.js        # Chiamate API Scryfall
│   ├── db.js              # Gestione IndexedDB
│   ├── import.html        # Interfaccia di importazione
│   ├── import.js          # Logica di importazione
│   └── import.css         # Stili di importazione
└── assets/
    └── selectors.json     # Selettori CSS per sito
```

### Funzionamento

1. **Rilevamento**: Lo script di contenuto identifica gli elementi contenenti nomi di carte tramite selettori CSS specifici per sito
2. **Cache locale**: Verifica se la traduzione esiste in IndexedDB
3. **API Scryfall**: Se assente, interroga Scryfall (limitato a ~10 richieste/s)
4. **Caching**: Memorizza la nuova traduzione localmente
5. **Visualizzazione**: Sostituisce il testo nel DOM con gestione hover

## 🛠️ Aggiungere un Nuovo Sito

L'estensione supporta qualsiasi sito web aggiungendo selettori CSS a `assets/selectors.json`. Questo file associa i domini web agli elementi HTML che contengono i nomi delle carte.

### Configurazione dei selettori

Ogni voce di sito richiede:
- **selector**: Selettore CSS che colpisce l'elemento contenente il nome della carta
- **childIndex** (opzionale): Se il nome è in un elemento figlio, specificare quale (0 = primo)
- **mode** (opzionale): Usare `"composite"` per strutture complesse con selettori genitore e figlio

### Esempio basico

```json
{
  "nuovo-sito.com": [
    {
      "selector": "selettore-css-per-carte",
      "childIndex": 0
    }
  ]
}
```

### Esempio composite (come Moxfield)

Per siti con strutture annidate:

```json
{
  "moxfield.com": [
    {
      "selector": "a.table-deck-row-link.text-body",
      "mode": "composite",
      "childSelector": "span.underline"
    }
  ]
}
```

### Passi per aggiungere un sito

1. Apri gli Strumenti di sviluppo del browser (F12)
2. Ispeziona un elemento nome carta per trovare il suo selettore CSS
3. Aggiungi una voce a `assets/selectors.json` con il selettore
4. Testa ricaricando l'estensione e visitando il sito
5. Affina il selettore se necessario

Vedi `assets/selectors.json` per i siti attualmente supportati e le loro configurazioni.

## 🤝 Contribuire

I contributi sono benvenuti!

### Idee di contributo
- Aggiungere supporto per nuovi siti
- Migliorare le prestazioni di traduzione
- Aggiungere nuove lingue
- Correggere bug
- Migliorare l'interfaccia utente

## 🐛 Bug Noti

- Le carte a doppia faccia a volte possono visualizzare solo la prima faccia

## 📄 Licenza

Questo progetto è concesso in licenza sotto la Licenza MIT - vedere il file `LICENSE` per i dettagli.

## ⚖️ Avviso Legale e Disclaimer

**Questo progetto non è affiliato, sponsorizzato, approvato o autorizzato da Wizards of the Coast.**

Magic: The Gathering, Magic, i simboli di mana, i nomi delle carte, le illustrazioni delle carte e tutti gli altri elementi grafici e testuali associati sono **marchi registrati** e proprietà esclusiva di **Wizards of the Coast LLC**, una sussidiaria di Hasbro, Inc.

© Wizards of the Coast LLC. Tutti i diritti riservati.

### Uso dei Dati

Questa estensione utilizza l'**API pubblica Scryfall** per recuperare le traduzioni ufficiali delle carte. Scryfall non è affiliato con Wizards of the Coast.

I dati delle carte (nomi, traduzioni) rimangono proprietà di Wizards of the Coast e vengono utilizzati esclusivamente per scopi personali ed educativi.

### Condizioni d'Uso

- Questo strumento è fornito **gratuitamente** e **senza garanzia** di alcun tipo
- L'uso è a **proprio rischio**
- Rispettare i [Termini di Utilizzo di Wizards of the Coast](https://company.wizards.com/en/legal/terms)
- Rispettare i [Termini di Utilizzo di Scryfall](https://scryfall.com/docs/api)
- **Nessun uso commerciale** dei dati o di questo strumento è consentito

### Politica sui Contenuti

Questa estensione non memorizza, ridistribuisce o visualizza **alcuna immagine di carta**. Vengono tradotti solo i nomi delle carte (dati fattuali).

---

**Fatto con ❤️ per la comunità MTG**