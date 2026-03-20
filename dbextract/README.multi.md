# MTG Bulk Translator — README

---

## 🇫🇷 Français

### Description
Ce script Python extrait les traductions de noms de cartes Magic: The Gathering depuis le fichier bulk Scryfall, et génère des fichiers JSON utilisables pour une base de données multilingue.

### Prérequis
- Python 3.12+
- pyenv + virtualenv recommandés (voir ci-dessous)

### Installation
```bash
# 1. Cloner / copier le script dans un dossier dédié
cd ~/mon-projet-mtg

# 2. Créer l'environnement virtuel
pyenv virtualenv 3.12.9 mtg-env
pyenv local mtg-env

# 3. Installer les dépendances
pip install ijson tqdm requests
```

### Utilisation
```bash
python extract_mtg.py
```
Le script pose des questions interactives :
1. **Langue de l'interface** — choisir parmi les 11 langues disponibles
2. **Langue(s) d'extraction** — choisir une ou plusieurs langues, ou `0` pour tout en un seul fichier
3. **Fichier bulk** — utiliser un fichier local existant, ou télécharger automatiquement depuis Scryfall (~2.3 Go)

Il est aussi possible de passer des arguments directement :
```bash
# Extraire uniquement le français
python extract_mtg.py --lang fr

# Extraire plusieurs langues
python extract_mtg.py --lang fr de ja

# Spécifier un fichier bulk existant
python extract_mtg.py all-cards-20260320.json --lang fr
```

### Fichiers générés
| Fichier | Contenu |
|---|---|
| `cards_fr.json` | Traductions français (un fichier par langue si `--lang` précisé) |
| `cards_all.json` | Toutes les langues dans un seul fichier |
| `*.multiface_corrections.log` | Log des corrections de noms multi-faces (optionnel) |

### Structure d'un enregistrement JSON
```json
{
  "english": "Lightning Bolt",
  "translations": {
    "fr": "Carreau foudroyant",
    "de": "Blitzschlag"
  }
}
```

### Langues disponibles
`de` Allemand · `es` Espagnol · `fr` Français · `it` Italien · `ja` Japonais · `ko` Coréen · `pt` Portugais · `ru` Russe · `zh` Chinois simplifié · `zh-TW` Chinois traditionnel

---

## 🇬🇧 English

### Description
This Python script extracts Magic: The Gathering card name translations from the Scryfall bulk data file, and generates JSON files usable as a multilingual card database.

### Requirements
- Python 3.12+
- pyenv + virtualenv recommended

### Installation
```bash
# 1. Copy the script into a dedicated folder
cd ~/my-mtg-project

# 2. Create virtual environment
pyenv virtualenv 3.12.9 mtg-env
pyenv local mtg-env

# 3. Install dependencies
pip install ijson tqdm requests
```

### Usage
```bash
python extract_mtg.py
```
The script will ask interactive questions:
1. **Interface language** — choose from 11 available languages
2. **Extraction language(s)** — choose one or more languages, or `0` for all in a single file
3. **Bulk file** — use an existing local file, or download automatically from Scryfall (~2.3 GB)

You can also pass arguments directly:
```bash
# Extract French only
python extract_mtg.py --lang fr

# Extract multiple languages
python extract_mtg.py --lang fr de ja

# Specify an existing bulk file
python extract_mtg.py all-cards-20260320.json --lang fr
```

### Output files
| File | Content |
|---|---|
| `cards_fr.json` | French translations (one file per language if `--lang` specified) |
| `cards_all.json` | All languages in a single file |
| `*.multiface_corrections.log` | Log of multi-face card name corrections (optional) |

### JSON record structure
```json
{
  "english": "Lightning Bolt",
  "translations": {
    "fr": "Carreau foudroyant",
    "de": "Blitzschlag"
  }
}
```

### Available languages
`de` German · `es` Spanish · `fr` French · `it` Italian · `ja` Japanese · `ko` Korean · `pt` Portuguese · `ru` Russian · `zh` Simplified Chinese · `zh-TW` Traditional Chinese

---

## 🇩🇪 Deutsch

### Beschreibung
Dieses Python-Skript extrahiert Magic: The Gathering Kartenübersetzungen aus der Scryfall-Bulk-Datei und generiert JSON-Dateien für eine mehrsprachige Kartendatenbank.

### Voraussetzungen
- Python 3.12+
- pyenv + virtualenv empfohlen

### Installation
```bash
# 1. Skript in einen eigenen Ordner kopieren
cd ~/mein-mtg-projekt

# 2. Virtuelle Umgebung erstellen
pyenv virtualenv 3.12.9 mtg-env
pyenv local mtg-env

# 3. Abhängigkeiten installieren
pip install ijson tqdm requests
```

### Verwendung
```bash
python extract_mtg.py
```
Das Skript stellt interaktive Fragen:
1. **Schnittstellensprache** — aus 11 Sprachen wählen
2. **Extraktionssprache(n)** — eine oder mehrere Sprachen wählen, oder `0` für alle in einer Datei
3. **Bulk-Datei** — lokale Datei verwenden oder automatisch von Scryfall herunterladen (~2,3 GB)

Argumente können auch direkt übergeben werden:
```bash
# Nur Französisch extrahieren
python extract_mtg.py --lang fr

# Mehrere Sprachen extrahieren
python extract_mtg.py --lang fr de ja

# Vorhandene Bulk-Datei angeben
python extract_mtg.py all-cards-20260320.json --lang de
```

### Ausgabedateien
| Datei | Inhalt |
|---|---|
| `cards_de.json` | Deutsche Übersetzungen (eine Datei pro Sprache) |
| `cards_all.json` | Alle Sprachen in einer Datei |
| `*.multiface_corrections.log` | Log der Mehrseiten-Korrekturen (optional) |

### Verfügbare Sprachen
`de` Deutsch · `es` Spanisch · `fr` Französisch · `it` Italienisch · `ja` Japanisch · `ko` Koreanisch · `pt` Portugiesisch · `ru` Russisch · `zh` Vereinfachtes Chinesisch · `zh-TW` Traditionelles Chinesisch

---

## 🇪🇸 Español

### Descripción
Este script Python extrae las traducciones de nombres de cartas de Magic: The Gathering desde el archivo bulk de Scryfall, y genera archivos JSON utilizables como base de datos multilingüe.

### Requisitos
- Python 3.12+
- pyenv + virtualenv recomendados

### Instalación
```bash
# 1. Copiar el script en una carpeta dedicada
cd ~/mi-proyecto-mtg

# 2. Crear el entorno virtual
pyenv virtualenv 3.12.9 mtg-env
pyenv local mtg-env

# 3. Instalar dependencias
pip install ijson tqdm requests
```

### Uso
```bash
python extract_mtg.py
```
El script hace preguntas interactivas:
1. **Idioma de la interfaz** — elegir entre 11 idiomas disponibles
2. **Idioma(s) de extracción** — elegir uno o varios idiomas, o `0` para todos en un solo archivo
3. **Archivo bulk** — usar un archivo local existente, o descargar automáticamente desde Scryfall (~2,3 GB)

También se pueden pasar argumentos directamente:
```bash
python extract_mtg.py --lang es
python extract_mtg.py --lang fr de ja
python extract_mtg.py all-cards-20260320.json --lang es
```

### Idiomas disponibles
`de` Alemán · `es` Español · `fr` Francés · `it` Italiano · `ja` Japonés · `ko` Coreano · `pt` Portugués · `ru` Ruso · `zh` Chino simplificado · `zh-TW` Chino tradicional

---

## 🇮🇹 Italiano

### Descrizione
Questo script Python estrae le traduzioni dei nomi delle carte Magic: The Gathering dal file bulk di Scryfall e genera file JSON utilizzabili come database multilingue.

### Requisiti
- Python 3.12+
- pyenv + virtualenv consigliati

### Installazione
```bash
pip install ijson tqdm requests
```

### Utilizzo
```bash
python extract_mtg.py
```
Lo script pone domande interattive:
1. **Lingua dell'interfaccia** — scegliere tra 11 lingue disponibili
2. **Lingua/e di estrazione** — scegliere una o più lingue, o `0` per tutte in un unico file
3. **File bulk** — usare un file locale o scaricarlo automaticamente da Scryfall (~2,3 GB)

```bash
python extract_mtg.py --lang it
python extract_mtg.py --lang fr de it
python extract_mtg.py all-cards-20260320.json --lang it
```

### Lingue disponibili
`de` Tedesco · `es` Spagnolo · `fr` Francese · `it` Italiano · `ja` Giapponese · `ko` Coreano · `pt` Portoghese · `ru` Russo · `zh` Cinese semplificato · `zh-TW` Cinese tradizionale

---

## 🇵🇹 Português

### Descrição
Este script Python extrai as traduções de nomes de cartas de Magic: The Gathering do arquivo bulk do Scryfall e gera arquivos JSON utilizáveis como banco de dados multilíngue.

### Requisitos
- Python 3.12+
- pyenv + virtualenv recomendados

### Instalação
```bash
pip install ijson tqdm requests
```

### Uso
```bash
python extract_mtg.py
```
O script faz perguntas interativas:
1. **Idioma da interface** — escolher entre 11 idiomas disponíveis
2. **Idioma(s) de extração** — escolher um ou mais idiomas, ou `0` para todos em um único arquivo
3. **Arquivo bulk** — usar um arquivo local ou baixar automaticamente do Scryfall (~2,3 GB)

```bash
python extract_mtg.py --lang pt
python extract_mtg.py --lang fr de pt
python extract_mtg.py all-cards-20260320.json --lang pt
```

### Idiomas disponíveis
`de` Alemão · `es` Espanhol · `fr` Francês · `it` Italiano · `ja` Japonês · `ko` Coreano · `pt` Português · `ru` Russo · `zh` Chinês simplificado · `zh-TW` Chinês tradicional

---

## 🇷🇺 Русский

### Описание
Этот Python-скрипт извлекает переводы названий карт Magic: The Gathering из bulk-файла Scryfall и генерирует JSON-файлы для многоязычной базы данных карт.

### Требования
- Python 3.12+
- pyenv + virtualenv (рекомендуется)

### Установка
```bash
pip install ijson tqdm requests
```

### Использование
```bash
python extract_mtg.py
```
Скрипт задаёт интерактивные вопросы:
1. **Язык интерфейса** — выбрать из 11 доступных языков
2. **Язык(и) извлечения** — выбрать один или несколько языков, или `0` для всех в одном файле
3. **Bulk-файл** — использовать локальный файл или загрузить автоматически с Scryfall (~2,3 ГБ)

```bash
python extract_mtg.py --lang ru
python extract_mtg.py --lang fr de ru
python extract_mtg.py all-cards-20260320.json --lang ru
```

### Доступные языки
`de` Немецкий · `es` Испанский · `fr` Французский · `it` Итальянский · `ja` Японский · `ko` Корейский · `pt` Португальский · `ru` Русский · `zh` Китайский упрощённый · `zh-TW` Китайский традиционный

---

## 🇯🇵 日本語

### 概要
このPythonスクリプトは、ScryfallのバルクデータファイルからMagic: The Gatheringカード名の翻訳を抽出し、多言語カードデータベースとして使えるJSONファイルを生成します。

### 必要環境
- Python 3.12以上
- pyenv + virtualenv 推奨

### インストール
```bash
pip install ijson tqdm requests
```

### 使い方
```bash
python extract_mtg.py
```
スクリプトは対話形式で以下を質問します：
1. **インターフェース言語** — 11言語から選択
2. **抽出言語** — 1つ以上の言語を選択、または`0`で全言語を1ファイルにまとめる
3. **バルクファイル** — ローカルファイルを使用するか、Scryfallから自動ダウンロード（約2.3GB）

```bash
python extract_mtg.py --lang ja
python extract_mtg.py --lang fr de ja
python extract_mtg.py all-cards-20260320.json --lang ja
```

### 利用可能な言語
`de` ドイツ語 · `es` スペイン語 · `fr` フランス語 · `it` イタリア語 · `ja` 日本語 · `ko` 韓国語 · `pt` ポルトガル語 · `ru` ロシア語 · `zh` 中国語（簡体） · `zh-TW` 中国語（繁体）

---

## 🇰🇷 한국어

### 설명
이 Python 스크립트는 Scryfall 벌크 데이터 파일에서 Magic: The Gathering 카드 이름 번역을 추출하여 다국어 카드 데이터베이스로 사용할 수 있는 JSON 파일을 생성합니다.

### 요구사항
- Python 3.12 이상
- pyenv + virtualenv 권장

### 설치
```bash
pip install ijson tqdm requests
```

### 사용법
```bash
python extract_mtg.py
```
스크립트는 대화형으로 질문합니다:
1. **인터페이스 언어** — 11개 언어 중 선택
2. **추출 언어** — 하나 이상의 언어 선택, 또는 `0`으로 모든 언어를 하나의 파일로
3. **벌크 파일** — 로컬 파일 사용 또는 Scryfall에서 자동 다운로드 (~2.3GB)

```bash
python extract_mtg.py --lang ko
python extract_mtg.py --lang fr de ko
python extract_mtg.py all-cards-20260320.json --lang ko
```

### 사용 가능한 언어
`de` 독일어 · `es` 스페인어 · `fr` 프랑스어 · `it` 이탈리아어 · `ja` 일본어 · `ko` 한국어 · `pt` 포르투갈어 · `ru` 러시아어 · `zh` 중국어 간체 · `zh-TW` 중국어 번체

---

## 🇨🇳 中文（简体）

### 描述
此Python脚本从Scryfall批量数据文件中提取Magic: The Gathering卡牌名称翻译，并生成可用于多语言卡牌数据库的JSON文件。

### 环境要求
- Python 3.12+
- 推荐使用 pyenv + virtualenv

### 安装
```bash
pip install ijson tqdm requests
```

### 使用方法
```bash
python extract_mtg.py
```
脚本将以交互方式提问：
1. **界面语言** — 从11种可用语言中选择
2. **提取语言** — 选择一种或多种语言，或输入`0`将所有语言合并为一个文件
3. **批量文件** — 使用本地文件或从Scryfall自动下载（约2.3GB）

```bash
python extract_mtg.py --lang zh
python extract_mtg.py --lang fr de zh
python extract_mtg.py all-cards-20260320.json --lang zh
```

### 可用语言
`de` 德语 · `es` 西班牙语 · `fr` 法语 · `it` 意大利语 · `ja` 日语 · `ko` 韩语 · `pt` 葡萄牙语 · `ru` 俄语 · `zh` 中文简体 · `zh-TW` 中文繁体

---

## 🇹🇼 中文（繁體）

### 描述
此Python腳本從Scryfall批量數據檔案中提取Magic: The Gathering卡牌名稱翻譯，並生成可用於多語言卡牌資料庫的JSON檔案。

### 環境要求
- Python 3.12+
- 建議使用 pyenv + virtualenv

### 安裝
```bash
pip install ijson tqdm requests
```

### 使用方法
```bash
python extract_mtg.py
```
腳本將以互動方式提問：
1. **介面語言** — 從11種可用語言中選擇
2. **提取語言** — 選擇一種或多種語言，或輸入`0`將所有語言合併為一個檔案
3. **批量檔案** — 使用本機檔案或從Scryfall自動下載（約2.3GB）

```bash
python extract_mtg.py --lang zh-TW
python extract_mtg.py --lang fr de zh-TW
python extract_mtg.py all-cards-20260320.json --lang zh-TW
```

### 可用語言
`de` 德語 · `es` 西班牙語 · `fr` 法語 · `it` 義大利語 · `ja` 日語 · `ko` 韓語 · `pt` 葡萄牙語 · `ru` 俄語 · `zh` 中文簡體 · `zh-TW` 中文繁體

---

## 📁 Project structure / Structure du projet

```
my-mtg-project/
├── extract_mtg.py          ← main script / script principal
├── README.md               ← this file / ce fichier
├── .python-version         ← pyenv config (auto-generated)
├── requirements.txt        ← pip dependencies
├── all-cards-XXXX.json     ← Scryfall bulk (downloaded, optional)
├── cards_fr.json           ← output example / exemple de sortie
├── cards_all.json          ← output (all languages / toutes langues)
└── *.log                   ← correction logs (optional)
```

## 📦 requirements.txt

```
ijson
tqdm
requests
```

---

*Data source: [Scryfall](https://scryfall.com/docs/api/bulk-data) — Magic: The Gathering card data*