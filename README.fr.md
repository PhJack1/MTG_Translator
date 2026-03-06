# MTG Cards Translator

🇬🇧 [English](README.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

Extension de navigateur Firefox permettant de traduire automatiquement les noms de cartes Magic: The Gathering sur les sites de decklists les plus populaires.

## 🎯 Fonctionnalités

- **Traduction en temps réel** : Traduit instantanément les noms de cartes MTG dans la langue de votre choix
- **Support multilingue** : 10 langues disponibles (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **Sites compatibles** : MTGTop8, MTGGoldfish, Moxfield, MTGDecks.net, DeckStats, Archidekt, TappedOut, EDHREC, et plus (voir `assets/selectors.json` pour la liste complète)
- **Cache local intelligent** : Utilise IndexedDB pour stocker les traductions et réduire les appels API
- **Mode survol** : Affichez le nom original en anglais en survolant une carte traduite
- **Import/Export** : Sauvegardez et partagez votre base de traductions personnalisée

## 📦 Installation

### Depuis Firefox Add-ons (à venir)
*(En attente de publication)*

### Installation manuelle (développeurs)

1. Clonez le dépôt :
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. Dans Firefox :
   - Tapez `about:debugging` dans la barre d'adresse
   - Cliquez sur "Ce Firefox" dans le menu de gauche
   - Cliquez sur "Charger un module complémentaire temporaire"
   - Sélectionnez le fichier `manifest.json` dans le dossier du projet

## 🚀 Utilisation

1. **Sélectionnez votre langue** : Cliquez sur l'icône de l'extension et choisissez votre langue cible parmi les drapeaux disponibles

2. **Traduisez une page** : 
   - Rendez-vous sur un site supporté (ex: mtgtop8.com)
   - Cliquez sur le bouton "Traduire les cartes sur la page"
   - Les noms de cartes sont instantanément traduits !

3. **Voir le nom original** : Survolez une carte traduite avec votre souris pour afficher temporairement son nom anglais

4. **Ajouter une traduction manuelle** :
   - Saisissez le nom anglais dans le premier champ
   - Saisissez la traduction dans le second champ
   - Cliquez sur "Enregistrer"

5. **Exporter/Importer votre base** :
   - **Export** : Téléchargez votre base de traductions au format JSON
   - **Import** : Glissez-déposez un fichier JSON pour fusionner les traductions

### 🤖 Traduction Automatique
L'extension peut désormais traduire automatiquement les cartes MTG sans intervention manuelle. Cochez simplement la case "Traduction automatique" dans le popup et sélectionnez votre langue cible. La traduction s'effectuera automatiquement lors du chargement de chaque page supportée et détectera également les changements dynamiques du DOM (sites comme Moxfield avec édition en direct).

## 🔧 Architecture technique

### Stack
- **Manifest V2** (Firefox)
- **JavaScript modules (ES6)**
- **IndexedDB** pour le cache local
- **API Scryfall** pour les traductions

### Structure du projet
```
MTG_Translator/
├── manifest.json           # Configuration de l'extension
├── popup/
│   ├── popup.html         # Interface utilisateur
│   ├── popup.js           # Logique de la popup
│   └── popup.css          # Styles
├── content/
│   └── content.js         # Script injecté dans les pages web
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # API de traduction
│   ├── scryfall.js        # Appels API Scryfall
│   ├── db.js              # Gestion IndexedDB
│   ├── import.html        # Interface d'import
│   ├── import.js          # Logique d'import
│   └── import.css         # Styles d'import
└── assets/
    └── selectors.json     # Sélecteurs CSS par site
```

### Fonctionnement

1. **Détection** : Le content script identifie les éléments contenant des noms de cartes via des sélecteurs CSS spécifiques à chaque site
2. **Cache local** : Vérifie si la traduction existe dans IndexedDB
3. **API Scryfall** : Si absente, interroge Scryfall (rate-limited à ~10 req/s)
4. **Mise en cache** : Stocke la nouvelle traduction localement
5. **Affichage** : Remplace le texte dans le DOM avec gestion du survol

## 🛠️ Ajouter un nouveau site

L'extension supporte n'importe quel site en ajoutant des sélecteurs CSS à `assets/selectors.json`. Ce fichier mappe les domaines web aux éléments HTML contenant les noms de cartes.

### Configuration des sélecteurs

Chaque entrée de site nécessite :
- **selector** : Sélecteur CSS ciblant l'élément contenant le nom de la carte
- **childIndex** (optionnel) : Si le nom est dans un enfant, spécifier lequel (0 = premier)
- **mode** (optionnel) : Utiliser `"composite"` pour les structures complexes avec sélecteurs parent et enfant

### Exemple basique

```json
{
  "nouveau-site.com": [
    {
      "selector": "css-selector-des-cartes",
      "childIndex": 0
    }
  ]
}
```

### Exemple composite (comme Moxfield)

Pour les sites avec structures imbriquées :

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

### Étapes pour ajouter un site

1. Ouvrez les Outils de développement du navigateur (F12)
2. Inspectez un élément nom de carte pour trouver son sélecteur CSS
3. Ajoutez une entrée à `assets/selectors.json` avec le sélecteur
4. Testez en rechargeant l'extension et en visitant le site
5. Affinez le sélecteur si nécessaire

Consultez `assets/selectors.json` pour les sites actuellement supportés et leurs configurations.

## 🤝 Contribution

Les contributions sont les bienvenues !

### Idées de contribution
- Ajouter le support de nouveaux sites
- Améliorer les performances de traduction
- Ajouter de nouvelles langues
- Corriger des bugs
- Améliorer l'interface utilisateur
- 
## 🐛 Bugs connus

- Les cartes à double face peuvent parfois afficher uniquement la première face

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier `LICENSE` pour plus de détails.

## ⚖️ Mentions légales et avertissement

**Ce projet n'est pas affilié, sponsorisé, approuvé ou endorsé par Wizards of the Coast.**

Magic: The Gathering, Magic, les symboles de mana, les noms de cartes, les illustrations de cartes et tous les autres éléments graphiques et textuels associés sont des **marques déposées** et la propriété exclusive de **Wizards of the Coast LLC**, une filiale de Hasbro, Inc.

© Wizards of the Coast LLC. Tous droits réservés.

### Utilisation des données

Cette extension utilise l'**API publique Scryfall** pour récupérer les traductions officielles des cartes. Scryfall n'est pas affilié à Wizards of the Coast. 

Les données de cartes (noms, traductions) restent la propriété de Wizards of the Coast et sont utilisées uniquement dans le cadre d'un usage personnel et éducatif.

### Conditions d'utilisation

- Cet outil est fourni **gratuitement** et **sans garantie** d'aucune sorte
- L'utilisation se fait sous votre **propre responsabilité**
- Respectez les [conditions d'utilisation de Wizards of the Coast](https://company.wizards.com/en/legal/terms)
- Respectez les [conditions d'utilisation de Scryfall](https://scryfall.com/docs/api)
- **Aucune utilisation commerciale** des données ou de cet outil n'est autorisée

### Politique de contenu

Cette extension ne stocke, ne redistribue et n'affiche **aucune image** de carte. Seuls les noms de cartes (données factuelles) sont traduits.

---

**Fait avec ❤️ pour la communauté MTG**