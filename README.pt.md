# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇪🇸 [Español](README.es.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

Extensão de navegador Firefox para traduzir automaticamente nomes de cartas de Magic: The Gathering nos sites de decklists mais populares.

## 🎯 Funcionalidades

- **Tradução em tempo real**: Traduz instantaneamente nomes de cartas MTG para o idioma escolhido
- **Suporte multilíngue**: 10 idiomas disponíveis (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **Sites compatíveis**:
  - MTGTop8
  - MTGGoldfish
  - Moxfield
  - MTGDecks.net
- **Cache local inteligente**: Usa IndexedDB para armazenar traduções e reduzir chamadas de API
- **Modo hover**: Exiba o nome original em inglês ao passar o mouse sobre uma carta traduzida
- **Importar/Exportar**: Salve e compartilhe seu banco de dados de traduções personalizado

## 📦 Instalação

### Do Firefox Add-ons (em breve)
*(Aguardando publicação)*

### Instalação manual (desenvolvedores)

1. Clone o repositório:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. No Firefox:
   - Digite `about:debugging` na barra de endereços
   - Clique em "Este Firefox" no menu à esquerda
   - Clique em "Carregar extensão temporária"
   - Selecione o arquivo `manifest.json` na pasta do projeto

## 🚀 Uso

1. **Selecione seu idioma**: Clique no ícone da extensão e escolha seu idioma de destino entre as bandeiras disponíveis

2. **Traduza uma página**: 
   - Visite um site suportado (ex: mtgtop8.com)
   - Clique no botão "Traduzir cartas na página"
   - Os nomes das cartas são traduzidos instantaneamente!

3. **Ver nome original**: Passe o mouse sobre uma carta traduzida para exibir temporariamente seu nome em inglês

4. **Adicionar uma tradução manual**:
   - Digite o nome em inglês no primeiro campo
   - Digite a tradução no segundo campo
   - Clique em "Salvar"

5. **Exportar/Importar seu banco de dados**:
   - **Exportar**: Baixe seu banco de dados de traduções em formato JSON
   - **Importar**: Arraste e solte um arquivo JSON para mesclar traduções

## 🔧 Arquitetura Técnica

### Stack
- **Manifest V2** (Firefox)
- **Módulos JavaScript (ES6)**
- **IndexedDB** para cache local
- **API Scryfall** para traduções

### Estrutura do Projeto
```
MTG_Translator/
├── manifest.json           # Configuração da extensão
├── popup/
│   ├── popup.html         # Interface do usuário
│   ├── popup.js           # Lógica do popup
│   └── popup.css          # Estilos
├── content/
│   └── content.js         # Script injetado em páginas web
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # API de tradução
│   ├── scryfall.js        # Chamadas API Scryfall
│   ├── db.js              # Gerenciamento IndexedDB
│   ├── import.html        # Interface de importação
│   ├── import.js          # Lógica de importação
│   └── import.css         # Estilos de importação
└── assets/
    └── selectors.json     # Seletores CSS por site
```

### Funcionamento

1. **Detecção**: O script de conteúdo identifica elementos contendo nomes de cartas via seletores CSS específicos do site
2. **Cache local**: Verifica se a tradução existe no IndexedDB
3. **API Scryfall**: Se ausente, consulta Scryfall (limitado a ~10 req/s)
4. **Armazenamento em cache**: Armazena a nova tradução localmente
5. **Exibição**: Substitui o texto no DOM com gerenciamento de hover

## 🛠️ Adicionar um Novo Site

Edite `assets/selectors.json` e adicione os seletores CSS apropriados:

```json
{
  "novo-site.com": [
    {
      "selector": "seletor-css-para-cartas",
      "childIndex": 0
    }
  ]
}
```

Para sites com estrutura composta (como Moxfield), use o modo composto:

```json
{
  "selector": "seletor-pai",
  "mode": "composite",
  "childSelector": "seletor-filho"
}
```

## 🤝 Contribuir

Contribuições são bem-vindas!

### Ideias de contribuição
- Adicionar suporte para novos sites
- Melhorar o desempenho de tradução
- Adicionar novos idiomas
- Corrigir bugs
- Melhorar a interface do usuário

## 🐛 Bugs Conhecidos

- Cartas de dupla face às vezes podem exibir apenas a primeira face

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - consulte o arquivo `LICENSE` para detalhes.

## ⚖️ Aviso Legal e Isenção de Responsabilidade

**Este projeto não é afiliado, patrocinado, endossado ou aprovado pela Wizards of the Coast.**

Magic: The Gathering, Magic, símbolos de mana, nomes de cartas, ilustrações de cartas e todos os outros elementos gráficos e textuais associados são **marcas registradas** e propriedade exclusiva da **Wizards of the Coast LLC**, uma subsidiária da Hasbro, Inc.

© Wizards of the Coast LLC. Todos os direitos reservados.

### Uso de Dados

Esta extensão usa a **API pública Scryfall** para recuperar traduções oficiais de cartas. Scryfall não é afiliado à Wizards of the Coast.

Os dados das cartas (nomes, traduções) permanecem propriedade da Wizards of the Coast e são usados exclusivamente para fins pessoais e educacionais.

### Condições de Uso

- Esta ferramenta é fornecida **gratuitamente** e **sem garantia** de qualquer tipo
- O uso é por sua **própria conta e risco**
- Respeite os [Termos de Uso da Wizards of the Coast](https://company.wizards.com/en/legal/terms)
- Respeite os [Termos de Uso do Scryfall](https://scryfall.com/docs/api)
- **Nenhum uso comercial** dos dados ou desta ferramenta é permitido

### Política de Conteúdo

Esta extensão não armazena, redistribui ou exibe **nenhuma imagem de carta**. Apenas nomes de cartas (dados factuais) são traduzidos.

---

**Feito com ❤️ para a comunidade MTG**