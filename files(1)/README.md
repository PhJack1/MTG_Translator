# MTG Cards Translator

🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

Firefox browser extension to automatically translate Magic: The Gathering card names on the most popular decklist websites.

## 🎯 Features

- **Real-time translation**: Instantly translates MTG card names into your chosen language
- **Multilingual support**: 10 languages available (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **Compatible sites**: MTGTop8, MTGGoldfish, Moxfield, MTGDecks.net, DeckStats, Archidekt, TappedOut, EDHREC, and more (see `assets/selectors.json` for complete list)
- **Smart local cache**: Uses IndexedDB to store translations and reduce API calls
- **Hover mode**: Display the original English name by hovering over a translated card
- **Import/Export**: Save and share your custom translation database

## 📦 Installation

### From Firefox Add-ons (coming soon)
*(Awaiting publication)*

### Manual installation (developers)

1. Clone the repository:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. In Firefox:
   - Type `about:debugging` in the address bar
   - Click "This Firefox" in the left menu
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file in the project folder

## 🚀 Usage

1. **Select your language**: Click the extension icon and choose your target language from the available flags

2. **Translate a page**: 
   - Visit a supported site (e.g., mtgtop8.com)
   - Click the "Translate cards on page" button
   - Card names are instantly translated!

3. **View original name**: Hover over a translated card with your mouse to temporarily display its English name

4. **Add a manual translation**:
   - Enter the English name in the first field
   - Enter the translation in the second field
   - Click "Save"

5. **Export/Import your database**:
   - **Export**: Download your translation database as JSON
   - **Import**: Drag and drop a JSON file to merge translations

## 🔧 Technical Architecture

### Stack
- **Manifest V2** (Firefox)
- **JavaScript modules (ES6)**
- **IndexedDB** for local caching
- **Scryfall API** for translations

### Project Structure
```
MTG_Translator/
├── manifest.json           # Extension configuration
├── popup/
│   ├── popup.html         # User interface
│   ├── popup.js           # Popup logic
│   └── popup.css          # Styles
├── content/
│   └── content.js         # Script injected into web pages
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # Translation API
│   ├── scryfall.js        # Scryfall API calls
│   ├── db.js              # IndexedDB management
│   ├── import.html        # Import interface
│   ├── import.js          # Import logic
│   └── import.css         # Import styles
└── assets/
    └── selectors.json     # CSS selectors per site
```

### How it works

1. **Detection**: Content script identifies elements containing card names via site-specific CSS selectors
2. **Local cache**: Checks if translation exists in IndexedDB
3. **Scryfall API**: If absent, queries Scryfall (rate-limited to ~10 req/s)
4. **Caching**: Stores new translation locally
5. **Display**: Replaces text in DOM with hover management

## 🛠️ Adding a New Site

The extension supports any website by adding CSS selectors to `assets/selectors.json`. This file maps website domains to the HTML elements containing card names.

### Selectors Configuration

Each site entry requires:
- **selector**: CSS selector targeting the element containing the card name
- **childIndex** (optional): If the card name is in a child element, specify which child (0 = first)
- **mode** (optional): Use `"composite"` for complex structures with parent and child selectors

### Basic Example

```json
{
  "new-site.com": [
    {
      "selector": "css-selector-for-cards",
      "childIndex": 0
    }
  ]
}
```

### Composite Example (like Moxfield)

For sites with nested structures:

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

### Steps to Add a Site

1. Open your browser's Developer Tools (F12)
2. Inspect a card name element to find its CSS selector
3. Add an entry to `assets/selectors.json` with the selector
4. Test by reloading the extension and visiting the site
5. Refine the selector if needed

See `assets/selectors.json` for current supported sites and their configurations.

## 🤝 Contributing

Contributions are welcome!

### Contribution ideas
- Add support for new sites
- Improve translation performance
- Add new languages
- Fix bugs
- Improve user interface

## 🐛 Known Bugs

- Double-faced cards may sometimes display only the first face

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## ⚖️ Legal Notice and Disclaimer

**This project is not affiliated with, sponsored by, endorsed by, or approved by Wizards of the Coast.**

Magic: The Gathering, Magic, mana symbols, card names, card illustrations, and all other associated graphic and textual elements are **trademarks** and exclusive property of **Wizards of the Coast LLC**, a subsidiary of Hasbro, Inc.

© Wizards of the Coast LLC. All rights reserved.

### Data Usage

This extension uses the **Scryfall public API** to retrieve official card translations. Scryfall is not affiliated with Wizards of the Coast.

Card data (names, translations) remains the property of Wizards of the Coast and is used solely for personal and educational purposes.

### Terms of Use

- This tool is provided **free of charge** and **without warranty** of any kind
- Use is at your **own risk**
- Respect [Wizards of the Coast Terms of Use](https://company.wizards.com/en/legal/terms)
- Respect [Scryfall Terms of Use](https://scryfall.com/docs/api)
- **No commercial use** of the data or this tool is permitted

### Content Policy

This extension does not store, redistribute, or display **any card images**. Only card names (factual data) are translated.

---

**Made with ❤️ for the MTG community**
