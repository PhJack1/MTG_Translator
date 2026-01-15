# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

Firefox-Browser-Erweiterung zur automatischen Übersetzung von Magic: The Gathering Kartennamen auf den beliebtesten Decklist-Websites.

## 🎯 Funktionen

- **Echtzeit-Übersetzung**: Übersetzt MTG-Kartennamen sofort in Ihre gewählte Sprache
- **Mehrsprachige Unterstützung**: 10 Sprachen verfügbar (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **Kompatible Websites**:
  - MTGTop8
  - MTGGoldfish
  - Moxfield
  - MTGDecks.net
- **Intelligenter lokaler Cache**: Verwendet IndexedDB zum Speichern von Übersetzungen und Reduzieren von API-Aufrufen
- **Hover-Modus**: Zeigen Sie den englischen Originalnamen an, indem Sie über eine übersetzte Karte fahren
- **Import/Export**: Speichern und teilen Sie Ihre benutzerdefinierte Übersetzungsdatenbank

## 📦 Installation

### Aus Firefox Add-ons (demnächst)
*(Veröffentlichung ausstehend)*

### Manuelle Installation (Entwickler)

1. Repository klonen:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. In Firefox:
   - Geben Sie `about:debugging` in die Adressleiste ein
   - Klicken Sie auf "Dieser Firefox" im linken Menü
   - Klicken Sie auf "Temporäres Add-on laden"
   - Wählen Sie die Datei `manifest.json` im Projektordner

## 🚀 Verwendung

1. **Wählen Sie Ihre Sprache**: Klicken Sie auf das Erweiterungssymbol und wählen Sie Ihre Zielsprache aus den verfügbaren Flaggen

2. **Übersetzen Sie eine Seite**: 
   - Besuchen Sie eine unterstützte Website (z.B. mtgtop8.com)
   - Klicken Sie auf die Schaltfläche "Karten auf der Seite übersetzen"
   - Kartennamen werden sofort übersetzt!

3. **Originalnamen anzeigen**: Fahren Sie mit der Maus über eine übersetzte Karte, um vorübergehend ihren englischen Namen anzuzeigen

4. **Manuelle Übersetzung hinzufügen**:
   - Geben Sie den englischen Namen im ersten Feld ein
   - Geben Sie die Übersetzung im zweiten Feld ein
   - Klicken Sie auf "Speichern"

5. **Datenbank exportieren/importieren**:
   - **Export**: Laden Sie Ihre Übersetzungsdatenbank als JSON herunter
   - **Import**: Ziehen Sie eine JSON-Datei per Drag & Drop, um Übersetzungen zusammenzuführen

## 🔧 Technische Architektur

### Stack
- **Manifest V2** (Firefox)
- **JavaScript-Module (ES6)**
- **IndexedDB** für lokales Caching
- **Scryfall API** für Übersetzungen

### Projektstruktur
```
MTG_Translator/
├── manifest.json           # Erweiterungskonfiguration
├── popup/
│   ├── popup.html         # Benutzeroberfläche
│   ├── popup.js           # Popup-Logik
│   └── popup.css          # Stile
├── content/
│   └── content.js         # In Webseiten eingefügtes Skript
├── background/
│   ├── background.js      # Service Worker
│   ├── translations.js    # Übersetzungs-API
│   ├── scryfall.js        # Scryfall API-Aufrufe
│   ├── db.js              # IndexedDB-Verwaltung
│   ├── import.html        # Import-Oberfläche
│   ├── import.js          # Import-Logik
│   └── import.css         # Import-Stile
└── assets/
    └── selectors.json     # CSS-Selektoren pro Website
```

### Funktionsweise

1. **Erkennung**: Content-Script identifiziert Elemente mit Kartennamen über websitespezifische CSS-Selektoren
2. **Lokaler Cache**: Prüft, ob Übersetzung in IndexedDB existiert
3. **Scryfall API**: Falls nicht vorhanden, fragt Scryfall ab (begrenzt auf ~10 Anfragen/s)
4. **Caching**: Speichert neue Übersetzung lokal
5. **Anzeige**: Ersetzt Text im DOM mit Hover-Verwaltung

## 🛠️ Neue Website hinzufügen

Bearbeiten Sie `assets/selectors.json` und fügen Sie geeignete CSS-Selektoren hinzu:

```json
{
  "neue-website.com": [
    {
      "selector": "css-selektor-für-karten",
      "childIndex": 0
    }
  ]
}
```

Für Websites mit zusammengesetzter Struktur (wie Moxfield) verwenden Sie den zusammengesetzten Modus:

```json
{
  "selector": "eltern-selektor",
  "mode": "composite",
  "childSelector": "kind-selektor"
}
```

## 🤝 Mitwirken

Beiträge sind willkommen!

### Beitragsideen
- Unterstützung für neue Websites hinzufügen
- Übersetzungsleistung verbessern
- Neue Sprachen hinzufügen
- Fehler beheben
- Benutzeroberfläche verbessern

## 🐛 Bekannte Fehler

- Doppelseitige Karten zeigen manchmal nur die erste Seite an

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert - siehe die Datei `LICENSE` für Details.

## ⚖️ Rechtlicher Hinweis und Haftungsausschluss

**Dieses Projekt ist weder mit Wizards of the Coast verbunden, noch wird es von ihnen gesponsert, unterstützt oder genehmigt.**

Magic: The Gathering, Magic, Mana-Symbole, Kartennamen, Kartenillustrationen und alle anderen zugehörigen grafischen und textlichen Elemente sind **Markenzeichen** und ausschließliches Eigentum von **Wizards of the Coast LLC**, einer Tochtergesellschaft von Hasbro, Inc.

© Wizards of the Coast LLC. Alle Rechte vorbehalten.

### Datennutzung

Diese Erweiterung verwendet die **öffentliche Scryfall-API**, um offizielle Kartenübersetzungen abzurufen. Scryfall ist nicht mit Wizards of the Coast verbunden.

Kartendaten (Namen, Übersetzungen) bleiben Eigentum von Wizards of the Coast und werden ausschließlich für persönliche und Bildungszwecke verwendet.

### Nutzungsbedingungen

- Dieses Tool wird **kostenlos** und **ohne Garantie** jeglicher Art bereitgestellt
- Die Nutzung erfolgt auf **eigene Gefahr**
- Beachten Sie die [Nutzungsbedingungen von Wizards of the Coast](https://company.wizards.com/en/legal/terms)
- Beachten Sie die [Nutzungsbedingungen von Scryfall](https://scryfall.com/docs/api)
- **Keine kommerzielle Nutzung** der Daten oder dieses Tools ist gestattet

### Inhaltsrichtlinie

Diese Erweiterung speichert, verteilt oder zeigt **keine Kartenbilder** an. Nur Kartennamen (Faktendaten) werden übersetzt.

---

**Mit ❤️ für die MTG-Community gemacht**