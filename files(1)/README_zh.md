# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

Firefox浏览器扩展程序，可在最受欢迎的牌表网站上自动翻译万智牌（Magic: The Gathering）卡牌名称。

## 🎯 功能特性

- **实时翻译**：即时将MTG卡牌名称翻译成您选择的语言
- **多语言支持**：支持10种语言（FR、ES、DE、IT、PT、JA、KO、RU、ZH、ZH-TW）
- **兼容网站**：MTGTop8、MTGGoldfish、Moxfield、MTGDecks.net、DeckStats、Archidekt、TappedOut、EDHREC等（完整列表见 `assets/selectors.json`）
- **智能本地缓存**：使用IndexedDB存储翻译并减少API调用
- **悬停模式**：将鼠标悬停在已翻译的卡牌上可显示英文原名
- **导入/导出**：保存和共享您的自定义翻译数据库

## 📦 安装

### 从Firefox附加组件（即将推出）
*（等待发布）*

### 手动安装（开发者）

1. 克隆仓库：
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. 在Firefox中：
   - 在地址栏中输入 `about:debugging`
   - 点击左侧菜单中的"此Firefox"
   - 点击"加载临时附加组件"
   - 选择项目文件夹中的 `manifest.json` 文件

## 🚀 使用方法

1. **选择您的语言**：点击扩展图标，从可用标志中选择目标语言

2. **翻译页面**： 
   - 访问支持的网站（例如：mtgtop8.com）
   - 点击"翻译页面上的卡牌"按钮
   - 卡牌名称立即被翻译！

3. **查看原始名称**：将鼠标悬停在已翻译的卡牌上可临时显示其英文名称

4. **添加手动翻译**：
   - 在第一个字段中输入英文名称
   - 在第二个字段中输入翻译
   - 点击"保存"

5. **导出/导入数据库**：
   - **导出**：以JSON格式下载翻译数据库
   - **导入**：拖放JSON文件以合并翻译

## 🔧 技术架构

### 技术栈
- **Manifest V2**（Firefox）
- **JavaScript模块（ES6）**
- **IndexedDB**用于本地缓存
- **Scryfall API**用于翻译

### 项目结构
```
MTG_Translator/
├── manifest.json           # 扩展配置
├── popup/
│   ├── popup.html         # 用户界面
│   ├── popup.js           # 弹出窗口逻辑
│   └── popup.css          # 样式
├── content/
│   └── content.js         # 注入网页的脚本
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # 翻译API
│   ├── scryfall.js        # Scryfall API调用
│   ├── db.js              # IndexedDB管理
│   ├── import.html        # 导入界面
│   ├── import.js          # 导入逻辑
│   └── import.css         # 导入样式
└── assets/
    └── selectors.json     # 每个网站的CSS选择器
```

### 工作原理

1. **检测**：内容脚本通过网站特定的CSS选择器识别包含卡牌名称的元素
2. **本地缓存**：检查IndexedDB中是否存在翻译
3. **Scryfall API**：如果不存在，则查询Scryfall（限制为约10次请求/秒）
4. **缓存**：在本地存储新翻译
5. **显示**：使用悬停管理替换DOM中的文本

## 🛠️ 添加新网站

该扩展通过在 `assets/selectors.json` 中添加 CSS 选择器来支持任何网站。此文件将网站域映射到包含卡牌名称的 HTML 元素。

### 选择器配置

每个网站条目需要：
- **selector**：针对包含卡牌名称的元素的 CSS 选择器
- **childIndex**（可选）：如果名称在子元素中，指定哪个子元素（0 = 第一个）
- **mode**（可选）：对于具有父选择器和子选择器的复杂结构，使用 `"composite"`

### 基本示例

```json
{
  "new-site.com": [
    {
      "selector": "卡牌的css选择器",
      "childIndex": 0
    }
  ]
}
```

### 复合示例（如 Moxfield）

对于具有嵌套结构的网站：

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

### 添加网站的步骤

1. 打开浏览器开发者工具 (F12)
2. 检查卡牌名称元素以找到其 CSS 选择器
3. 将条目添加到 `assets/selectors.json`
4. 重新加载扩展并访问该网站进行测试
5. 如需要调整选择器

请参阅 `assets/selectors.json` 了解当前支持的网站及其配置。

## 🤝 贡献

欢迎贡献！

### 贡献想法
- 添加对新网站的支持
- 提高翻译性能
- 添加新语言
- 修复错误
- 改进用户界面

## 🐛 已知错误

- 双面卡有时可能只显示第一面

## 📄 许可证

本项目根据MIT许可证授权 - 详见 `LICENSE` 文件。

## ⚖️ 法律声明和免责声明

**本项目与Wizards of the Coast无关联、赞助、认可或授权。**

Magic: The Gathering、Magic、法术力符号、卡牌名称、卡牌插图以及所有其他相关图形和文本元素均为**Wizards of the Coast LLC**（Hasbro, Inc.的子公司）的**注册商标**和专有财产。

© Wizards of the Coast LLC. 保留所有权利。

### 数据使用

本扩展使用**Scryfall公共API**检索官方卡牌翻译。Scryfall与Wizards of the Coast无关联。

卡牌数据（名称、翻译）仍为Wizards of the Coast的财产，仅用于个人和教育目的。

### 使用条款

- 本工具**免费**提供，**不提供任何形式的保证**
- 使用风险**自负**
- 遵守[Wizards of the Coast使用条款](https://company.wizards.com/en/legal/terms)
- 遵守[Scryfall使用条款](https://scryfall.com/docs/api)
- **不允许**对数据或本工具进行**商业使用**

### 内容政策

本扩展**不存储、不重新分发、不显示任何卡牌图像**。仅翻译卡牌名称（事实数据）。

---

**为MTG社区用❤️制作**