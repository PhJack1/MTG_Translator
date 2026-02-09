# MTG Cards Translator

🇬🇧 [English](README.md) | 🇫🇷 [Français](README.fr.md) | 🇩🇪 [Deutsch](README.de.md) | 🇮🇹 [Italiano](README.it.md) | 🇵🇹 [Português](README.pt.md) | 🇯🇵 [日本語](README.ja.md) | 🇰🇷 [한국어](README.ko.md) | 🇷🇺 [Русский](README.ru.md) | 🇨🇳 [简体中文](README.zh.md) | 🇹🇼 [繁體中文](README.zh-TW.md)

---

Extensión de navegador Firefox para traducir automáticamente los nombres de cartas de Magic: The Gathering en los sitios web de decklists más populares.

## 🎯 Características

- **Traducción en tiempo real**: Traduce instantáneamente los nombres de cartas MTG al idioma elegido
- **Soporte multilingüe**: 10 idiomas disponibles (FR, ES, DE, IT, PT, JA, KO, RU, ZH, ZH-TW)
- **Sitios compatibles**: MTGTop8, MTGGoldfish, Moxfield, MTGDecks.net, DeckStats, Archidekt, TappedOut, EDHREC, y más (ver `assets/selectors.json` para la lista completa)
- **Caché local inteligente**: Utiliza IndexedDB para almacenar traducciones y reducir llamadas API
- **Modo hover**: Muestra el nombre original en inglés al pasar el ratón sobre una carta traducida
- **Importar/Exportar**: Guarda y comparte tu base de datos de traducciones personalizada

## 📦 Instalación

### Desde Firefox Add-ons (próximamente)
*(Pendiente de publicación)*

### Instalación manual (desarrolladores)

1. Clona el repositorio:
```bash
git clone https://github.com/PhJack1/MTG_Translator.git
cd MTG_Translator
```

2. En Firefox:
   - Escribe `about:debugging` en la barra de direcciones
   - Haz clic en "Este Firefox" en el menú izquierdo
   - Haz clic en "Cargar complemento temporal"
   - Selecciona el archivo `manifest.json` en la carpeta del proyecto

## 🚀 Uso

1. **Selecciona tu idioma**: Haz clic en el icono de la extensión y elige tu idioma de destino entre las banderas disponibles

2. **Traduce una página**: 
   - Visita un sitio compatible (ej: mtgtop8.com)
   - Haz clic en el botón "Traducir cartas en la página"
   - ¡Los nombres de las cartas se traducen instantáneamente!

3. **Ver el nombre original**: Pasa el ratón sobre una carta traducida para mostrar temporalmente su nombre en inglés

4. **Añadir una traducción manual**:
   - Introduce el nombre en inglés en el primer campo
   - Introduce la traducción en el segundo campo
   - Haz clic en "Guardar"

5. **Exportar/Importar tu base de datos**:
   - **Exportar**: Descarga tu base de datos de traducciones en formato JSON
   - **Importar**: Arrastra y suelta un archivo JSON para fusionar traducciones

## 🔧 Arquitectura Técnica

### Stack
- **Manifest V2** (Firefox)
- **Módulos JavaScript (ES6)**
- **IndexedDB** para caché local
- **API Scryfall** para traducciones

### Estructura del Proyecto
```
MTG_Translator/
├── manifest.json           # Configuración de la extensión
├── popup/
│   ├── popup.html         # Interfaz de usuario
│   ├── popup.js           # Lógica del popup
│   └── popup.css          # Estilos
├── content/
│   └── content.js         # Script inyectado en páginas web
├── background/
│   ├── background.js      # Service worker
│   ├── translations.js    # API de traducción
│   ├── scryfall.js        # Llamadas API Scryfall
│   ├── db.js              # Gestión IndexedDB
│   ├── import.html        # Interfaz de importación
│   ├── import.js          # Lógica de importación
│   └── import.css         # Estilos de importación
└── assets/
    └── selectors.json     # Selectores CSS por sitio
```

### Funcionamiento

1. **Detección**: El content script identifica elementos que contienen nombres de cartas mediante selectores CSS específicos del sitio
2. **Caché local**: Verifica si la traducción existe en IndexedDB
3. **API Scryfall**: Si no existe, consulta Scryfall (limitado a ~10 req/s)
4. **Almacenamiento en caché**: Guarda la nueva traducción localmente
5. **Visualización**: Reemplaza el texto en el DOM con gestión de hover

## 🛠️ Añadir un Nuevo Sitio

La extensión soporta cualquier sitio web añadiendo selectores CSS a `assets/selectors.json`. Este archivo mapea dominios web a los elementos HTML que contienen nombres de cartas.

### Configuración de selectores

Cada entrada de sitio requiere:
- **selector**: Selector CSS dirigido al elemento que contiene el nombre de la carta
- **childIndex** (opcional): Si el nombre está en un elemento hijo, especificar cuál (0 = primero)
- **mode** (opcional): Usar `"composite"` para estructuras complejas con selectores padre e hijo

### Ejemplo básico

```json
{
  "nuevo-sitio.com": [
    {
      "selector": "selector-css-para-cartas",
      "childIndex": 0
    }
  ]
}
```

### Ejemplo composite (como Moxfield)

Para sitios con estructuras anidadas:

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

### Pasos para añadir un sitio

1. Abre las Herramientas de Desarrollador del navegador (F12)
2. Inspecciona un elemento de nombre de carta para encontrar su selector CSS
3. Añade una entrada a `assets/selectors.json` con el selector
4. Prueba recargando la extensión y visitando el sitio
5. Refina el selector si es necesario

Consulta `assets/selectors.json` para los sitios actualmente soportados y sus configuraciones.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

### Ideas de contribución
- Añadir soporte para nuevos sitios
- Mejorar el rendimiento de traducción
- Añadir nuevos idiomas
- Corregir errores
- Mejorar la interfaz de usuario

## 🐛 Errores Conocidos

- Las cartas de doble cara a veces pueden mostrar solo la primera cara

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo `LICENSE` para más detalles.

## ⚖️ Aviso Legal y Descargo de Responsabilidad

**Este proyecto no está afiliado, patrocinado, respaldado ni aprobado por Wizards of the Coast.**

Magic: The Gathering, Magic, los símbolos de maná, los nombres de cartas, las ilustraciones de cartas y todos los demás elementos gráficos y textuales asociados son **marcas registradas** y propiedad exclusiva de **Wizards of the Coast LLC**, una subsidiaria de Hasbro, Inc.

© Wizards of the Coast LLC. Todos los derechos reservados.

### Uso de Datos

Esta extensión utiliza la **API pública de Scryfall** para recuperar traducciones oficiales de cartas. Scryfall no está afiliado con Wizards of the Coast.

Los datos de cartas (nombres, traducciones) siguen siendo propiedad de Wizards of the Coast y se utilizan únicamente con fines personales y educativos.

### Condiciones de Uso

- Esta herramienta se proporciona **de forma gratuita** y **sin garantía** de ningún tipo
- El uso es bajo su **propia responsabilidad**
- Respete los [Términos de Uso de Wizards of the Coast](https://company.wizards.com/en/legal/terms)
- Respete los [Términos de Uso de Scryfall](https://scryfall.com/docs/api)
- **No se permite el uso comercial** de los datos o esta herramienta

### Política de Contenido

Esta extensión no almacena, redistribuye ni muestra **ninguna imagen de carta**. Solo se traducen los nombres de las cartas (datos factuales).

---

**Hecho con ❤️ para la comunidad MTG**