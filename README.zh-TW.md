# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md)

---

Firefox瀏覽器擴充功能，可在最受歡迎的牌表網站上自動翻譯萬智牌（Magic: The Gathering）卡牌名稱。

## 🎯 功能特色

- **即時翻譯**：即時將MTG卡牌名稱翻譯成您選擇的語言
- **多語言支援**：支援10種語言（FR、ES、DE、IT、PT、JA、KO、RU、ZH、ZH-TW）
- **相容網站**：MTGTop8、MTGGoldfish、Moxfield、MTGDecks.net、DeckStats、Archidekt、TappedOut、EDHREC等（完整列表見 `assets/selectors.json`）
- **智慧本地快取**：使用IndexedDB儲存翻譯並減少API呼叫
- **懸停模式**：將滑鼠懸停在已翻譯的卡牌上可顯示英文原名
- **匯入/匯出**：儲存和分享您的自訂翻譯資料庫

## 📦 安裝

### 從Firefox附加元件（即將推出）
*（等待發布）*

### 手動安裝（開發者）

1. 複製儲存庫：
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. 在Firefox中：
   - 在網址列中輸入 `about:debugging`
   - 點擊左側選單中的「此Firefox」
   - 點擊「載入暫時附加元件」
   - 選擇專案資料夾中的 `manifest.json` 檔案

## 🚀 使用方法

1. **選擇您的語言**：點擊擴充功能圖示，從可用旗幟中選擇目標語言

2. **翻譯頁面**： 
   - 造訪支援的網站（例如：mtgtop8.com）
   - 點擊「翻譯頁面上的卡牌」按鈕
   - 卡牌名稱立即被翻譯！

3. **查看原始名稱**：將滑鼠懸停在已翻譯的卡牌上可暫時顯示其英文名稱

4. **新增手動翻譯**：
   - 在第一個欄位中輸入英文名稱
   - 在第二個欄位中輸入翻譯
   - 點擊「儲存」

5. **匯出/匯入資料庫**：
   - **匯出**：以JSON格式下載翻譯資料庫
   - **匯入**：拖放JSON檔案以合併翻譯

## 🔧 技術架構

### 技術堆疊
- **Manifest V2**（Firefox）
- **JavaScript模組（ES6）**
- **IndexedDB**用於本地快取
- **Scryfall API**用於翻譯

### 專案結構
```
MTG_Translator/
├── manifest.json           # 擴充功能配置
├── popup/
│   ├── popup.html         # 使用者介面
│   ├── popup.js           # 彈出視窗邏輯
│   └── popup.css          # 樣式
├── content/
│   └── content.js         # 注入網頁的腳本
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # 翻譯API
│   ├── scryfall.js        # Scryfall API呼叫
│   ├── db.js              # IndexedDB管理
│   ├── import.html        # 匯入介面
│   ├── import.js          # 匯入邏輯
│   └── import.css         # 匯入樣式
└── assets/
    └── selectors.json     # 每個網站的CSS選擇器
```

### 工作原理

1. **偵測**：內容腳本透過網站特定的CSS選擇器識別包含卡牌名稱的元素
2. **本地快取**：檢查IndexedDB中是否存在翻譯
3. **Scryfall API**：如果不存在，則查詢Scryfall（限制為約每秒10次請求）
4. **快取**：在本地儲存新翻譯
5. **顯示**：使用懸停管理替換DOM中的文字

## 🛠️ 新增新網站

該擴充功能透過在 `assets/selectors.json` 中新增CSS選擇器來支援任何網站。此檔案將網站網域對應至包含卡牌名稱的HTML元素。

### 選擇器設定

每個網站項目需要：
- **selector**：針對包含卡牌名稱的元素的CSS選擇器
- **childIndex**（可選）：如果名稱在子元素中，指定哪個子元素（0 = 第一個）
- **mode**（可選）：對於具有父選擇器和子選擇器的複雜結構，使用 `"composite"`

### 基本範例

```json
{
  "new-site.com": [
    {
      "selector": "卡牌的css選擇器",
      "childIndex": 0
    }
  ]
}
```

### 複合範例（如Moxfield）

對於具有嵌套結構的網站：

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

### 新增網站的步驟

1. 開啟瀏覽器開發者工具 (F12)
2. 檢查卡牌名稱元素以找到其CSS選擇器
3. 將項目新增至 `assets/selectors.json`
4. 重新載入擴充功能並造訪該網站進行測試
5. 如需要調整選擇器

請參閱 `assets/selectors.json` 了解目前支援的網站及其設定。

## 🤝 貢獻

歡迎貢獻！

### 貢獻想法
- 新增對新網站的支援
- 提高翻譯效能
- 新增新語言
- 修復錯誤
- 改進使用者介面

## 🐛 已知錯誤

- 雙面卡有時可能只顯示第一面

## 📄 授權

本專案根據MIT授權條款授權 - 詳見 `LICENSE` 檔案。

## ⚖️ 法律聲明和免責聲明

**本專案與Wizards of the Coast無關聯、贊助、認可或授權。**

Magic: The Gathering、Magic、法術力符號、卡牌名稱、卡牌插圖以及所有其他相關圖形和文字元素均為**Wizards of the Coast LLC**（Hasbro, Inc.的子公司）的**註冊商標**和專有財產。

© Wizards of the Coast LLC. 保留所有權利。

### 資料使用

本擴充功能使用**Scryfall公共API**檢索官方卡牌翻譯。Scryfall與Wizards of the Coast無關聯。

卡牌資料（名稱、翻譯）仍為Wizards of the Coast的財產，僅用於個人和教育目的。

### 使用條款

- 本工具**免費**提供，**不提供任何形式的保證**
- 使用風險**自負**
- 遵守[Wizards of the Coast使用條款](https://company.wizards.com/en/legal/terms)
- 遵守[Scryfall使用條款](https://scryfall.com/docs/api)
- **不允許**對資料或本工具進行**商業使用**

### 內容政策

本擴充功能**不儲存、不重新分發、不顯示任何卡牌圖像**。僅翻譯卡牌名稱（事實資料）。

---

**為MTG社群用❤️製作**