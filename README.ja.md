# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

人気のデッキリストサイトでMagic: The Gatheringのカード名を自動翻訳するFirefoxブラウザ拡張機能。

## 🎯 機能

- **リアルタイム翻訳**: MTGカード名を選択した言語に即座に翻訳
- **多言語サポート**: 10言語対応（FR、ES、DE、IT、PT、JA、KO、RU、ZH、ZH-TW）
- **対応サイト**:
  - MTGTop8
  - MTGGoldfish
  - Moxfield
  - MTGDecks.net
- **スマートローカルキャッシュ**: IndexedDBを使用して翻訳を保存し、API呼び出しを削減
- **ホバーモード**: 翻訳されたカードにマウスを合わせると英語の元の名前を表示
- **インポート/エクスポート**: カスタム翻訳データベースを保存・共有

## 📦 インストール

### Firefox Add-onsから（近日公開）
*（公開待ち）*

### 手動インストール（開発者向け）

1. リポジトリをクローン:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. Firefoxで:
   - アドレスバーに `about:debugging` と入力
   - 左メニューの「このFirefox」をクリック
   - 「一時的なアドオンを読み込む」をクリック
   - プロジェクトフォルダ内の `manifest.json` ファイルを選択

## 🚀 使用方法

1. **言語を選択**: 拡張機能アイコンをクリックし、利用可能な国旗からターゲット言語を選択

2. **ページを翻訳**: 
   - 対応サイトにアクセス（例：mtgtop8.com）
   - 「ページ上のカードを翻訳」ボタンをクリック
   - カード名が即座に翻訳されます！

3. **元の名前を表示**: 翻訳されたカードにマウスを合わせると、一時的に英語名が表示されます

4. **手動翻訳を追加**:
   - 最初のフィールドに英語名を入力
   - 2番目のフィールドに翻訳を入力
   - 「保存」をクリック

5. **データベースのエクスポート/インポート**:
   - **エクスポート**: 翻訳データベースをJSON形式でダウンロード
   - **インポート**: JSONファイルをドラッグ&ドロップして翻訳をマージ

## 🔧 技術アーキテクチャ

### スタック
- **Manifest V2**（Firefox）
- **JavaScriptモジュール（ES6）**
- **IndexedDB**（ローカルキャッシュ用）
- **Scryfall API**（翻訳用）

### プロジェクト構造
```
MTG_Translator/
├── manifest.json           # 拡張機能設定
├── popup/
│   ├── popup.html         # ユーザーインターフェース
│   ├── popup.js           # ポップアップロジック
│   └── popup.css          # スタイル
├── content/
│   └── content.js         # Webページに挿入されるスクリプト
├── background/
│   ├── background.js      # サービスワーカー
│   ├── translations.js    # 翻訳API
│   ├── scryfall.js        # Scryfall API呼び出し
│   ├── db.js              # IndexedDB管理
│   ├── import.html        # インポートインターフェース
│   ├── import.js          # インポートロジック
│   └── import.css         # インポートスタイル
└── assets/
    └── selectors.json     # サイト別CSSセレクター
```

### 動作原理

1. **検出**: コンテンツスクリプトがサイト固有のCSSセレクターを使用してカード名を含む要素を識別
2. **ローカルキャッシュ**: IndexedDBに翻訳が存在するか確認
3. **Scryfall API**: 存在しない場合、Scryfallに問い合わせ（約10リクエスト/秒に制限）
4. **キャッシング**: 新しい翻訳をローカルに保存
5. **表示**: ホバー管理でDOM内のテキストを置換

## 🛠️ 新しいサイトを追加

`assets/selectors.json` を編集し、適切なCSSセレクターを追加:

```json
{
  "new-site.com": [
    {
      "selector": "カード用CSSセレクター",
      "childIndex": 0
    }
  ]
}
```

複合構造のサイト（Moxfieldなど）の場合、複合モードを使用:

```json
{
  "selector": "親セレクター",
  "mode": "composite",
  "childSelector": "子セレクター"
}
```

## 🤝 貢献

貢献を歓迎します！

### 貢献のアイデア
- 新しいサイトのサポートを追加
- 翻訳パフォーマンスを改善
- 新しい言語を追加
- バグを修正
- ユーザーインターフェースを改善

## 🐛 既知のバグ

- 両面カードが最初の面のみを表示することがあります

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は `LICENSE` ファイルを参照してください。

## ⚖️ 法的通知と免責事項

**このプロジェクトはWizards of the Coastと提携、スポンサー、承認、または認可されていません。**

Magic: The Gathering、Magic、マナシンボル、カード名、カードイラスト、およびその他すべての関連するグラフィック要素とテキスト要素は、Hasbro, Inc.の子会社である**Wizards of the Coast LLC**の**登録商標**および独占的財産です。

© Wizards of the Coast LLC. 無断複写・転載を禁じます。

### データ使用

この拡張機能は、公式カード翻訳を取得するために**Scryfall公開API**を使用しています。ScryfallはWizards of the Coastと提携していません。

カードデータ（名前、翻訳）はWizards of the Coastの財産であり、個人的および教育的目的でのみ使用されます。

### 利用規約

- このツールは**無料**で提供され、いかなる種類の**保証もありません**
- 使用は**自己責任**で行ってください
- [Wizards of the Coastの利用規約](https://company.wizards.com/en/legal/terms)を尊重してください
- [Scryfallの利用規約](https://scryfall.com/docs/api)を尊重してください
- データまたはこのツールの**商用利用は許可されていません**

### コンテンツポリシー

この拡張機能は**カード画像を一切**保存、再配布、または表示しません。カード名（事実データ）のみが翻訳されます。

---

**MTGコミュニティのために❤️を込めて作成**