import json
from datetime import datetime
import ijson
import unicodedata
import argparse
import sys
import requests
from collections import defaultdict
from tqdm import tqdm
from pathlib import Path

# ============================
# LANGUES INTERFACE UTILISATEUR
# ============================
UI_LANGS = {
    "en": "English",
    "fr": "Français",
    "de": "Deutsch",
    "es": "Español",
    "it": "Italiano",
    "pt": "Português",
    "ja": "日本語",
    "ko": "한국어",
    "ru": "Русский",
    "zh": "中文(简体)",
    "zh-TW": "中文(繁體)",
}

T = {
    "choose_ui_lang": {
        "en": "Choose interface language",
        "fr": "Choisissez la langue de l'interface",
        "de": "Wählen Sie die Schnittstellensprache",
        "es": "Elija el idioma de la interfaz",
        "it": "Scegli la lingua dell'interfaccia",
        "pt": "Escolha o idioma da interface",
        "ja": "インターフェース言語を選択してください",
        "ko": "인터페이스 언어를 선택하세요",
        "ru": "Выберите язык интерфейса",
        "zh": "请选择界面语言",
        "zh-TW": "請選擇介面語言",
    },
    "invalid_choice": {
        "en": "Invalid choice, please try again.",
        "fr": "Choix invalide, veuillez réessayer.",
        "de": "Ungültige Auswahl, bitte erneut versuchen.",
        "es": "Opción inválida, intente de nuevo.",
        "it": "Scelta non valida, riprovare.",
        "pt": "Escolha inválida, tente novamente.",
        "ja": "無効な選択です。もう一度お試しください。",
        "ko": "잘못된 선택입니다. 다시 시도하세요.",
        "ru": "Неверный выбор, попробуйте снова.",
        "zh": "选择无效，请重试。",
        "zh-TW": "選擇無效，請重試。",
    },
    "file_not_found": {
        "en": "File not found",
        "fr": "Fichier introuvable",
        "de": "Datei nicht gefunden",
        "es": "Archivo no encontrado",
        "it": "File non trovato",
        "pt": "Arquivo não encontrado",
        "ja": "ファイルが見つかりません",
        "ko": "파일을 찾을 수 없습니다",
        "ru": "Файл не найден",
        "zh": "文件未找到",
        "zh-TW": "找不到檔案",
    },
    "local_file_detected": {
        "en": "Local bulk file detected",
        "fr": "Fichier bulk local détecté",
        "de": "Lokale Bulk-Datei erkannt",
        "es": "Archivo bulk local detectado",
        "it": "File bulk locale rilevato",
        "pt": "Arquivo bulk local detectado",
        "ja": "ローカルバルクファイルを検出しました",
        "ko": "로컬 벌크 파일이 감지되었습니다",
        "ru": "Обнаружен локальный файл bulk",
        "zh": "检测到本地批量文件",
        "zh-TW": "偵測到本機批量檔案",
    },
    "use_this_file": {
        "en": "Use this file? [y/n]: ",
        "fr": "Utiliser ce fichier ? [o/n] : ",
        "de": "Diese Datei verwenden? [j/n]: ",
        "es": "¿Usar este archivo? [s/n]: ",
        "it": "Usare questo file? [s/n]: ",
        "pt": "Usar este arquivo? [s/n]: ",
        "ja": "このファイルを使用しますか？ [y/n]: ",
        "ko": "이 파일을 사용하시겠습니까? [y/n]: ",
        "ru": "Использовать этот файл? [д/н]: ",
        "zh": "使用此文件？[y/n]: ",
        "zh-TW": "使用此檔案？[y/n]: ",
    },
    "yes_keys": {
        "en": ["y", "yes"],
        "fr": ["o", "oui", "y", "yes"],
        "de": ["j", "ja", "y", "yes"],
        "es": ["s", "si", "sí", "y", "yes"],
        "it": ["s", "si", "sì", "y", "yes"],
        "pt": ["s", "sim", "y", "yes"],
        "ja": ["y", "yes"],
        "ko": ["y", "yes"],
        "ru": ["д", "да", "y", "yes"],
        "zh": ["y", "yes"],
        "zh-TW": ["y", "yes"],
    },
    "no_bulk_found": {
        "en": "No Scryfall bulk file specified or found locally.",
        "fr": "Aucun fichier bulk Scryfall spécifié ou trouvé localement.",
        "de": "Keine Scryfall-Bulk-Datei angegeben oder lokal gefunden.",
        "es": "No se especificó o encontró ningún archivo bulk de Scryfall.",
        "it": "Nessun file bulk Scryfall specificato o trovato localmente.",
        "pt": "Nenhum arquivo bulk Scryfall especificado ou encontrado localmente.",
        "ja": "Scryfallのバルクファイルが指定または検出されませんでした。",
        "ko": "Scryfall 벌크 파일이 지정되거나 로컬에서 발견되지 않았습니다.",
        "ru": "Файл bulk Scryfall не указан и не найден локально.",
        "zh": "未指定或找到本地Scryfall批量文件。",
        "zh-TW": "未指定或找到本機Scryfall批量檔案。",
    },
    "download_prompt": {
        "en": "Download 'all_cards' bulk from Scryfall? [y/n]: ",
        "fr": "Télécharger le bulk 'all_cards' depuis Scryfall ? [o/n] : ",
        "de": "Bulk 'all_cards' von Scryfall herunterladen? [j/n]: ",
        "es": "¿Descargar el bulk 'all_cards' desde Scryfall? [s/n]: ",
        "it": "Scaricare il bulk 'all_cards' da Scryfall? [s/n]: ",
        "pt": "Baixar o bulk 'all_cards' do Scryfall? [s/n]: ",
        "ja": "Scryfallから'all_cards'バルクをダウンロードしますか？ [y/n]: ",
        "ko": "Scryfall에서 'all_cards' 벌크를 다운로드하시겠습니까? [y/n]: ",
        "ru": "Скачать bulk 'all_cards' с Scryfall? [д/н]: ",
        "zh": "从Scryfall下载'all_cards'批量文件？[y/n]: ",
        "zh-TW": "從Scryfall下載'all_cards'批量檔案？[y/n]: ",
    },
    "cancelled": {
        "en": "Cancelled.",
        "fr": "Annulé.",
        "de": "Abgebrochen.",
        "es": "Cancelado.",
        "it": "Annullato.",
        "pt": "Cancelado.",
        "ja": "キャンセルされました。",
        "ko": "취소되었습니다.",
        "ru": "Отменено.",
        "zh": "已取消。",
        "zh-TW": "已取消。",
    },
    "connecting": {
        "en": "🌐 Connecting to Scryfall API…",
        "fr": "🌐 Connexion à l'API Scryfall…",
        "de": "🌐 Verbindung zur Scryfall-API…",
        "es": "🌐 Conectando a la API de Scryfall…",
        "it": "🌐 Connessione all'API Scryfall…",
        "pt": "🌐 Conectando à API do Scryfall…",
        "ja": "🌐 Scryfall APIに接続中…",
        "ko": "🌐 Scryfall API에 연결 중…",
        "ru": "🌐 Подключение к API Scryfall…",
        "zh": "🌐 正在连接Scryfall API…",
        "zh-TW": "🌐 正在連接Scryfall API…",
    },
    "download_start": {
        "en": "⬇️  Downloading to {dest}…\n   (~2.3 GB uncompressed, please wait ☕)",
        "fr": "⬇️  Téléchargement vers {dest}…\n   (fichier ~2.3 Go décompressé, patience ☕)",
        "de": "⬇️  Download nach {dest}…\n   (~2,3 GB unkomprimiert, bitte warten ☕)",
        "es": "⬇️  Descargando a {dest}…\n   (~2.3 GB descomprimido, por favor espere ☕)",
        "it": "⬇️  Download in {dest}…\n   (~2.3 GB decompressi, attendere ☕)",
        "pt": "⬇️  Baixando para {dest}…\n   (~2.3 GB descomprimido, aguarde ☕)",
        "ja": "⬇️  {dest}へダウンロード中…\n   (解凍後約2.3GB、お待ちください ☕)",
        "ko": "⬇️  {dest}에 다운로드 중…\n   (압축 해제 후 약 2.3GB, 잠시 기다려 주세요 ☕)",
        "ru": "⬇️  Загрузка в {dest}…\n   (~2.3 ГБ после распаковки, подождите ☕)",
        "zh": "⬇️  正在下载到{dest}…\n   (解压后约2.3GB，请耐心等待 ☕)",
        "zh-TW": "⬇️  正在下載到{dest}…\n   (解壓後約2.3GB，請耐心等待 ☕)",
    },
    "download_progress": {
        "en": "   {mo} MB written…",
        "fr": "   {mo} Mo écrits…",
        "de": "   {mo} MB geschrieben…",
        "es": "   {mo} MB escritos…",
        "it": "   {mo} MB scritti…",
        "pt": "   {mo} MB gravados…",
        "ja": "   {mo} MB 書き込み済み…",
        "ko": "   {mo} MB 기록됨…",
        "ru": "   {mo} МБ записано…",
        "zh": "   已写入 {mo} MB…",
        "zh-TW": "   已寫入 {mo} MB…",
    },
    "download_done": {
        "en": "   ✅ {mo} MB downloaded — {name}",
        "fr": "   ✅ {mo} Mo téléchargés — {name}",
        "de": "   ✅ {mo} MB heruntergeladen — {name}",
        "es": "   ✅ {mo} MB descargados — {name}",
        "it": "   ✅ {mo} MB scaricati — {name}",
        "pt": "   ✅ {mo} MB baixados — {name}",
        "ja": "   ✅ {mo} MB ダウンロード完了 — {name}",
        "ko": "   ✅ {mo} MB 다운로드 완료 — {name}",
        "ru": "   ✅ {mo} МБ загружено — {name}",
        "zh": "   ✅ 已下载 {mo} MB — {name}",
        "zh-TW": "   ✅ 已下載 {mo} MB — {name}",
    },
    "download_error": {
        "en": "❌ Download failed",
        "fr": "❌ Échec du téléchargement",
        "de": "❌ Download fehlgeschlagen",
        "es": "❌ Error de descarga",
        "it": "❌ Download fallito",
        "pt": "❌ Falha no download",
        "ja": "❌ ダウンロード失敗",
        "ko": "❌ 다운로드 실패",
        "ru": "❌ Ошибка загрузки",
        "zh": "❌ 下载失败",
        "zh-TW": "❌ 下載失敗",
    },
    "counting": {
        "en": "📊 Counting cards…",
        "fr": "📊 Comptage des cartes…",
        "de": "📊 Karten zählen…",
        "es": "📊 Contando cartas…",
        "it": "📊 Conteggio carte…",
        "pt": "📊 Contando cartas…",
        "ja": "📊 カードを数えています…",
        "ko": "📊 카드 수 계산 중…",
        "ru": "📊 Подсчёт карт…",
        "zh": "📊 正在统计卡牌数量…",
        "zh-TW": "📊 正在統計卡牌數量…",
    },
    "cards_detected": {
        "en": "→ {n} cards detected",
        "fr": "→ {n} cartes détectées",
        "de": "→ {n} Karten erkannt",
        "es": "→ {n} cartas detectadas",
        "it": "→ {n} carte rilevate",
        "pt": "→ {n} cartas detectadas",
        "ja": "→ {n} 枚のカードを検出しました",
        "ko": "→ {n}장의 카드가 감지되었습니다",
        "ru": "→ {n} карт обнаружено",
        "zh": "→ 检测到 {n} 张卡牌",
        "zh-TW": "→ 偵測到 {n} 張卡牌",
    },
    "reading_bulk": {
        "en": "Reading bulk",
        "fr": "Lecture du bulk",
        "de": "Bulk lesen",
        "es": "Leyendo bulk",
        "it": "Lettura bulk",
        "pt": "Lendo bulk",
        "ja": "バルク読み込み中",
        "ko": "벌크 읽는 중",
        "ru": "Чтение bulk",
        "zh": "正在读取批量文件",
        "zh-TW": "正在讀取批量檔案",
    },
    "no_data_lang": {
        "en": "⚠️  cards_{lang}.json skipped (no data)",
        "fr": "⚠️  cards_{lang}.json ignoré (aucune donnée)",
        "de": "⚠️  cards_{lang}.json übersprungen (keine Daten)",
        "es": "⚠️  cards_{lang}.json omitido (sin datos)",
        "it": "⚠️  cards_{lang}.json saltato (nessun dato)",
        "pt": "⚠️  cards_{lang}.json ignorado (sem dados)",
        "ja": "⚠️  cards_{lang}.json をスキップ（データなし）",
        "ko": "⚠️  cards_{lang}.json 건너뜀 (데이터 없음)",
        "ru": "⚠️  cards_{lang}.json пропущен (нет данных)",
        "zh": "⚠️  cards_{lang}.json 已跳过（无数据）",
        "zh-TW": "⚠️  cards_{lang}.json 已跳過（無資料）",
    },
    "multiface_corrections": {
        "en": "🧹 Multi-face corrections: {n}",
        "fr": "🧹 Corrections multi-faces : {n}",
        "de": "🧹 Mehrseitige Korrekturen: {n}",
        "es": "🧹 Correcciones multi-cara: {n}",
        "it": "🧹 Correzioni multi-faccia: {n}",
        "pt": "🧹 Correções multi-face: {n}",
        "ja": "🧹 多面補正: {n}",
        "ko": "🧹 다면 수정: {n}",
        "ru": "🧹 Исправлений многоликих карт: {n}",
        "zh": "🧹 多面卡牌修正: {n}",
        "zh-TW": "🧹 多面卡牌修正: {n}",
    },
    "log_written": {
        "en": "📝 Log written to {name}",
        "fr": "📝 Log écrit dans {name}",
        "de": "📝 Log geschrieben in {name}",
        "es": "📝 Log escrito en {name}",
        "it": "📝 Log scritto in {name}",
        "pt": "📝 Log gravado em {name}",
        "ja": "📝 ログを {name} に書き込みました",
        "ko": "📝 로그가 {name}에 기록되었습니다",
        "ru": "📝 Лог записан в {name}",
        "zh": "📝 日志已写入 {name}",
        "zh-TW": "📝 日誌已寫入 {name}",
    },
    "no_corrections": {
        "en": "🧹 No multi-face corrections detected",
        "fr": "🧹 Aucune correction multi-face détectée",
        "de": "🧹 Keine mehrseitigen Korrekturen erkannt",
        "es": "🧹 No se detectaron correcciones multi-cara",
        "it": "🧹 Nessuna correzione multi-faccia rilevata",
        "pt": "🧹 Nenhuma correção multi-face detectada",
        "ja": "🧹 多面補正は検出されませんでした",
        "ko": "🧹 다면 수정이 감지되지 않았습니다",
        "ru": "🧹 Исправлений многоликих карт не обнаружено",
        "zh": "🧹 未检测到多面卡牌修正",
        "zh-TW": "🧹 未偵測到多面卡牌修正",
    },
    "ignored_same": {
        "en": "🚫 Cards ignored (translation == english): {n}",
        "fr": "🚫 Cartes ignorées (traduction == anglais) : {n}",
        "de": "🚫 Karten ignoriert (Übersetzung == Englisch): {n}",
        "es": "🚫 Cartas ignoradas (traducción == inglés): {n}",
        "it": "🚫 Carte ignorate (traduzione == inglese): {n}",
        "pt": "🚫 Cartas ignoradas (tradução == inglês): {n}",
        "ja": "🚫 無視されたカード（翻訳 == 英語）: {n}",
        "ko": "🚫 무시된 카드 (번역 == 영어): {n}",
        "ru": "🚫 Карт проигнорировано (перевод == английский): {n}",
        "zh": "🚫 已忽略卡牌（翻译 == 英文）: {n}",
        "zh-TW": "🚫 已忽略卡牌（翻譯 == 英文）: {n}",
    },
    "done": {
        "en": "✅ Done.",
        "fr": "✅ Terminé.",
        "de": "✅ Fertig.",
        "es": "✅ Listo.",
        "it": "✅ Completato.",
        "pt": "✅ Concluído.",
        "ja": "✅ 完了。",
        "ko": "✅ 완료.",
        "ru": "✅ Готово.",
        "zh": "✅ 完成。",
        "zh-TW": "✅ 完成。",
    },
    "delete_prompt": {
        "en": "🗑️  Delete source bulk ({name}, {mo} MB)? [y/n]: ",
        "fr": "🗑️  Supprimer le bulk source ({name}, {mo} Mo) ? [o/n] : ",
        "de": "🗑️  Quelldatei löschen ({name}, {mo} MB)? [j/n]: ",
        "es": "🗑️  ¿Eliminar el bulk fuente ({name}, {mo} MB)? [s/n]: ",
        "it": "🗑️  Eliminare il bulk sorgente ({name}, {mo} MB)? [s/n]: ",
        "pt": "🗑️  Excluir o bulk fonte ({name}, {mo} MB)? [s/n]: ",
        "ja": "🗑️  ソースバルクを削除しますか（{name}, {mo} MB）？ [y/n]: ",
        "ko": "🗑️  소스 벌크를 삭제하시겠습니까 ({name}, {mo} MB)? [y/n]: ",
        "ru": "🗑️  Удалить исходный bulk ({name}, {mo} МБ)? [д/н]: ",
        "zh": "🗑️  删除源批量文件（{name}, {mo} MB）？[y/n]: ",
        "zh-TW": "🗑️  刪除來源批量檔案（{name}, {mo} MB）？[y/n]: ",
    },
    "deleted": {
        "en": "   ✅ {name} deleted.",
        "fr": "   ✅ {name} supprimé.",
        "de": "   ✅ {name} gelöscht.",
        "es": "   ✅ {name} eliminado.",
        "it": "   ✅ {name} eliminato.",
        "pt": "   ✅ {name} excluído.",
        "ja": "   ✅ {name} を削除しました。",
        "ko": "   ✅ {name} 삭제됨.",
        "ru": "   ✅ {name} удалён.",
        "zh": "   ✅ {name} 已删除。",
        "zh-TW": "   ✅ {name} 已刪除。",
    },
    "kept": {
        "en": "   Kept.",
        "fr": "   Conservé.",
        "de": "   Behalten.",
        "es": "   Conservado.",
        "it": "   Conservato.",
        "pt": "   Mantido.",
        "ja": "   保持されました。",
        "ko": "   유지됨.",
        "ru": "   Сохранён.",
        "zh": "   已保留。",
        "zh-TW": "   已保留。",
    },
    "delete_log_prompt": {
        "en": "🗑️  Delete log file ({name})? [y/n]: ",
        "fr": "🗑️  Supprimer le fichier log ({name}) ? [o/n] : ",
        "de": "🗑️  Log-Datei löschen ({name})? [j/n]: ",
        "es": "🗑️  ¿Eliminar el archivo log ({name})? [s/n]: ",
        "it": "🗑️  Eliminare il file log ({name})? [s/n]: ",
        "pt": "🗑️  Excluir o arquivo log ({name})? [s/n]: ",
        "ja": "🗑️  ログファイルを削除しますか（{name}）？ [y/n]: ",
        "ko": "🗑️  로그 파일을 삭제하시겠습니까 ({name})? [y/n]: ",
        "ru": "🗑️  Удалить лог-файл ({name})? [д/н]: ",
        "zh": "🗑️  删除日志文件（{name}）？[y/n]: ",
        "zh-TW": "🗑️  刪除日誌檔案（{name}）？[y/n]: ",
    },
    "log_deleted": {
        "en": "   ✅ Log deleted.",
        "fr": "   ✅ Log supprimé.",
        "de": "   ✅ Log gelöscht.",
        "es": "   ✅ Log eliminado.",
        "it": "   ✅ Log eliminato.",
        "pt": "   ✅ Log excluído.",
        "ja": "   ✅ ログを削除しました。",
        "ko": "   ✅ 로그 삭제됨.",
        "ru": "   ✅ Лог удалён.",
        "zh": "   ✅ 日志已删除。",
        "zh-TW": "   ✅ 日誌已刪除。",
    },
    "log_kept": {
        "en": "   Log kept.",
        "fr": "   Log conservé.",
        "de": "   Log behalten.",
        "es": "   Log conservado.",
        "it": "   Log conservato.",
        "pt": "   Log mantido.",
        "ja": "   ログを保持しました。",
        "ko": "   로그 유지됨.",
        "ru": "   Лог сохранён.",
        "zh": "   日志已保留。",
        "zh-TW": "   日誌已保留。",
    },
    "choose_extract_langs": {
        "en": "Choose extraction language(s)",
        "fr": "Choisissez la/les langue(s) d'extraction",
        "de": "Extraktionssprache(n) wählen",
        "es": "Elija el/los idioma(s) de extracción",
        "it": "Scegli la/le lingua/e di estrazione",
        "pt": "Escolha o(s) idioma(s) de extração",
        "ja": "抽出する言語を選択してください",
        "ko": "추출 언어를 선택하세요",
        "ru": "Выберите язык(и) для извлечения",
        "zh": "请选择提取语言",
        "zh-TW": "請選擇提取語言",
    },
    "extract_langs_hint": {
        "en": "Enter numbers separated by spaces (e.g. 1 3 5), or 0 for all languages in one file:",
        "fr": "Entrez les numéros séparés par des espaces (ex: 1 3 5), ou 0 pour toutes les langues dans un seul fichier :",
        "de": "Nummern mit Leerzeichen eingeben (z.B. 1 3 5), oder 0 für alle Sprachen in einer Datei:",
        "es": "Ingrese números separados por espacios (ej: 1 3 5), o 0 para todos los idiomas en un archivo:",
        "it": "Inserire numeri separati da spazi (es: 1 3 5), o 0 per tutte le lingue in un file:",
        "pt": "Digite números separados por espaços (ex: 1 3 5), ou 0 para todos os idiomas em um arquivo:",
        "ja": "スペースで区切って番号を入力（例: 1 3 5）、または0で全言語を1ファイルに:",
        "ko": "공백으로 구분된 번호 입력 (예: 1 3 5), 또는 0으로 모든 언어를 한 파일에:",
        "ru": "Введите номера через пробел (напр. 1 3 5), или 0 для всех языков в одном файле:",
        "zh": "输入用空格分隔的编号（如 1 3 5），或输入 0 将所有语言合并为一个文件：",
        "zh-TW": "輸入以空格分隔的編號（如 1 3 5），或輸入 0 將所有語言合併為一個檔案：",
    },
    "extract_langs_selected": {
        "en": "✔ Selected: {langs}",
        "fr": "✔ Sélectionné : {langs}",
        "de": "✔ Ausgewählt: {langs}",
        "es": "✔ Seleccionado: {langs}",
        "it": "✔ Selezionato: {langs}",
        "pt": "✔ Selecionado: {langs}",
        "ja": "✔ 選択済み: {langs}",
        "ko": "✔ 선택됨: {langs}",
        "ru": "✔ Выбрано: {langs}",
        "zh": "✔ 已选择: {langs}",
        "zh-TW": "✔ 已選擇: {langs}",
    },
    "extract_all_label": {
        "en": "ALL — one file with all languages (cards_all.json)",
        "fr": "TOUTES — un seul fichier avec toutes les langues (cards_all.json)",
        "de": "ALLE — eine Datei mit allen Sprachen (cards_all.json)",
        "es": "TODAS — un archivo con todos los idiomas (cards_all.json)",
        "it": "TUTTE — un file con tutte le lingue (cards_all.json)",
        "pt": "TODAS — um arquivo com todos os idiomas (cards_all.json)",
        "ja": "すべて — 全言語を1ファイルに（cards_all.json）",
        "ko": "전체 — 모든 언어를 한 파일로 (cards_all.json)",
        "ru": "ВСЕ — один файл со всеми языками (cards_all.json)",
        "zh": "全部 — 所有语言合并为一个文件（cards_all.json）",
        "zh-TW": "全部 — 所有語言合併為一個檔案（cards_all.json）",
    },
}

def t(key: str, **kwargs) -> str:
    """Retourne la chaîne traduite pour la langue UI courante."""
    s = T[key].get(UI_LANG, T[key]["en"])
    return s.format(**kwargs) if kwargs else s

def ask_yes(prompt: str) -> bool:
    answer = input(prompt).strip().lower()
    return answer in T["yes_keys"][UI_LANG]

# ============================
# SÉLECTION LANGUE INTERFACE
# ============================
def choose_ui_lang() -> str:
    lang_list = list(UI_LANGS.keys())
    print("\n" + "─" * 40)
    for i, code in enumerate(lang_list, 1):
        print(f"  {i:>2}. {UI_LANGS[code]}")
    print("─" * 40)

    while True:
        try:
            raw = input(f"  → ").strip()
            idx = int(raw) - 1
            if 0 <= idx < len(lang_list):
                return lang_list[idx]
        except (ValueError, EOFError):
            pass
        # Affiche le message d'erreur dans toutes les langues la première fois,
        # puis dans la langue la plus proche du choix
        print(f"  ⚠  {T['invalid_choice']['en']} / {T['invalid_choice']['fr']}")

print("\n" + "─" * 40)
for code, label in UI_LANGS.items():
    print(f"  {T['choose_ui_lang'][code]} → {label}")
print("─" * 40)

UI_LANG = choose_ui_lang()
print()

# ============================
# ARGUMENTS CLI
# ============================
TARGET_LANGS = {
    "es", "fr", "de", "it", "pt",
    "ja", "ko", "ru",
    "zh", "zh-TW",
}

# Ordre d'affichage stable pour le menu interactif
TARGET_LANGS_ORDERED = ["de", "es", "fr", "it", "ja", "ko", "pt", "ru", "zh", "zh-TW"]

def choose_extraction_langs() -> tuple[list[str] | None, bool]:
    """
    Demande à l'utilisateur les langues à extraire.
    Retourne (liste de codes, mode_all).
    mode_all=True  → cards_all.json
    mode_all=False → un fichier par langue
    """
    print("\n" + "─" * 40)
    print(f"  {t('choose_extract_langs')}")
    print("─" * 40)
    print(f"   0. {t('extract_all_label')}")
    for i, code in enumerate(TARGET_LANGS_ORDERED, 1):
        print(f"  {i:>2}. {UI_LANGS.get(code, code)}")
    print("─" * 40)
    print(f"  {t('extract_langs_hint')}")

    while True:
        try:
            raw = input("  → ").strip()
            tokens = raw.split()
            if not tokens:
                raise ValueError
            nums = [int(x) for x in tokens]
            if any(n < 0 or n > len(TARGET_LANGS_ORDERED) for n in nums):
                raise ValueError
            # 0 seul ou parmi d'autres → mode all
            if 0 in nums:
                print(f"  {t('extract_langs_selected', langs=t('extract_all_label'))}")
                return None, True
            # Dédoublonnage en conservant l'ordre
            seen = []
            for n in nums:
                code = TARGET_LANGS_ORDERED[n - 1]
                if code not in seen:
                    seen.append(code)
            label = ", ".join(UI_LANGS.get(c, c) for c in seen)
            print(f"  {t('extract_langs_selected', langs=label)}")
            return seen, False
        except (ValueError, EOFError):
            print(f"  ⚠  {t('invalid_choice')}")

LANG_MAP = {
    "zhs": "zh",
    "zht": "zh-TW",
}

parser = argparse.ArgumentParser(
    description="MTG card translation extractor from Scryfall bulk"
)
parser.add_argument(
    "input_file",
    nargs="?",
    help="Scryfall bulk file (e.g. all-cards-XXXX.json). If absent, download is offered."
)
parser.add_argument(
    "--lang",
    nargs="+",
    choices=sorted(TARGET_LANGS),
    metavar="LANG",
    help=(
        f"One or more language codes to extract (e.g. --lang fr de ja). "
        f"Available: {', '.join(sorted(TARGET_LANGS))}. "
        "If absent, generates cards_all.json only."
    )
)
args = parser.parse_args()

if args.lang:
    args.lang = list(dict.fromkeys(args.lang))

# Si --lang non fourni en CLI, on demande interactivement
if not args.lang:
    _selected_langs, _all_mode = choose_extraction_langs()
    if _all_mode:
        args.lang = None          # → génère cards_all.json
    else:
        args.lang = _selected_langs

print()
OUTPUT_PREFIX = "cards_"

def safe_output_path(base: str) -> Path:
    """
    Retourne le chemin de sortie.
    Si le fichier existe déjà, ajoute un timestamp pour éviter l'écrasement.
    Ex: cards_fr.json → cards_fr_20260320_143012.json
    """
    p = Path(base)
    if not p.exists():
        return p
    stem = p.stem  # cards_fr
    suffix = p.suffix  # .json
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    new_p = Path(f"{stem}_{ts}{suffix}")
    print(f"  ⚠  {base} → {new_p}")
    return new_p

# ============================
# TÉLÉCHARGEMENT SCRYFALL
# ============================
SCRYFALL_API = "https://api.scryfall.com/bulk-data"

HEADERS = {
    "User-Agent": "MTGBulkExtractor/1.0 (personal script)",
    "Accept": "application/json",
}

def fetch_bulk_download_url() -> tuple:
    print(t("connecting"))
    response = requests.get(SCRYFALL_API, headers=HEADERS)
    response.raise_for_status()
    for entry in response.json().get("data", []):
        if entry.get("type") == "all_cards":
            return entry["download_uri"], entry.get("name", "all_cards")
    raise RuntimeError("Cannot find 'all_cards' bulk in Scryfall response.")

def download_bulk(url: str, dest: Path):
    print(t("download_start", dest=dest))

    block_size = 1024 * 256  # 256 Ko

    with requests.get(url, headers=HEADERS, stream=True) as r:
        r.raise_for_status()
        written = 0
        with dest.open("wb") as f:
            for chunk in r.iter_content(chunk_size=block_size):
                f.write(chunk)
                written += len(chunk)
                mo = written / 1_048_576
                print(f"\r{t('download_progress', mo=f'{mo:.0f}')}", end="", flush=True)
    mo_final = dest.stat().st_size / 1_048_576
    print(f"\r{t('download_done', mo=f'{mo_final:.0f}', name=dest.name)}")

def resolve_input_file() -> Path:
    # 1. Argument CLI fourni
    if args.input_file:
        path = Path(args.input_file)
        if not path.exists():
            print(f"❌ {t('file_not_found')}: {path}", file=sys.stderr)
            sys.exit(1)
        return path

    # 2. Cherche un fichier local existant
    local_files = sorted(Path(".").glob("all-cards-*.json"))
    if local_files:
        chosen = local_files[-1]
        print(f"📂 {t('local_file_detected')}: {chosen}")
        if ask_yes(f"   {t('use_this_file')}"):
            return chosen

    # 3. Proposer le téléchargement
    print(f"\n⚠️  {t('no_bulk_found')}")
    if not ask_yes(f"   {t('download_prompt')}"):
        print(f"❌ {t('cancelled')}", file=sys.stderr)
        sys.exit(0)

    try:
        url, name = fetch_bulk_download_url()
        filename = url.split("/")[-1] if "/" in url else f"{name}.json"
        dest = Path(filename)
        download_bulk(url, dest)
        return dest
    except Exception as e:
        print(f"{t('download_error')}: {e}", file=sys.stderr)
        sys.exit(1)


INPUT_FILE = resolve_input_file()
LOG_FILE = INPUT_FILE.with_suffix(".multiface_corrections.log")

# ============================
# UTILS
# ============================
def normalize(s: str) -> str:
    return unicodedata.normalize("NFC", s.strip())

def get_card_name(card, lang="en"):
    faces = card.get("card_faces")
    if faces:
        names = []
        for face in faces:
            face_name = (
                face.get("printed_name") if lang != "en" else None
            ) or face.get("name")
            if not face_name:
                return None
            names.append(face_name.strip())
        return " // ".join(names)
    if lang != "en":
        return (card.get("printed_name") or card.get("name") or "").strip()
    return (card.get("name") or "").strip()

def dedupe_multiface_name(name: str):
    if "//" not in name:
        return name, False
    parts = [p.strip() for p in name.split("//")]
    seen = []
    for p in parts:
        if p not in seen:
            seen.append(p)
    cleaned = " // ".join(seen)
    return cleaned, cleaned != name

# ============================
# PASSAGE 1 : comptage
# ============================
print(t("counting"))
total_cards = 0
with INPUT_FILE.open("rb") as f:
    for _ in ijson.items(f, "item"):
        total_cards += 1

print(t("cards_detected", n=total_cards) + "\n")

# ============================
# FILTRAGE PAR LANGUE
# ============================
active_langs = set(args.lang) if args.lang else TARGET_LANGS

# ============================
# PASSAGE 2 : lecture streaming
# ============================
by_oracle = defaultdict(dict)
seen_names = defaultdict(lambda: defaultdict(set))

with INPUT_FILE.open("rb") as f:
    cards = ijson.items(f, "item")
    for card in tqdm(cards, total=total_cards, desc=t("reading_bulk")):
        oracle_id = card.get("oracle_id")
        raw_lang = card.get("lang")
        lang = LANG_MAP.get(raw_lang, raw_lang)

        if not oracle_id or not lang:
            continue
        if lang != "en" and lang not in active_langs:
            continue

        name = get_card_name(card, lang)
        if not name:
            continue
        if name in seen_names[oracle_id][lang]:
            continue

        by_oracle[oracle_id][lang] = name
        seen_names[oracle_id][lang].add(name)

# ============================
# GÉNÉRATION + LOG
# ============================
results_by_lang = {lang: [] for lang in active_langs}
results_all = []

ignored_same_name = 0
correction_count = 0
log_lines = []

for names in by_oracle.values():
    english = names.get("en")
    if not english:
        continue

    english, fixed_en = dedupe_multiface_name(english)
    english_n = normalize(english)

    if fixed_en:
        correction_count += 1
        log_lines.append(f"[EN] {names.get('en')} → {english}")

    translations = {}

    for lang in active_langs:
        translated = names.get(lang)
        if not translated:
            continue

        translated_clean, fixed = dedupe_multiface_name(translated)
        translated_n = normalize(translated_clean)

        if translated_n == english_n:
            ignored_same_name += 1
            continue

        if fixed:
            correction_count += 1
            log_lines.append(
                f"[{lang.upper()}] {english} | {translated} → {translated_clean}"
            )

        translations[lang] = translated_clean
        results_by_lang[lang].append({
            "english": english,
            "translations": {lang: translated_clean}
        })

    if translations:
        results_all.append({
            "english": english,
            "translations": translations
        })

# ============================
# ÉCRITURE DES JSON
# ============================
print()

if args.lang:
    for lang in args.lang:
        data = results_by_lang[lang]
        if not data:
            print(t("no_data_lang", lang=lang))
            continue
        out = safe_output_path(f"{OUTPUT_PREFIX}{lang}.json")
        with out.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✔ {out.name} — {len(data)} cartes")
else:
    out = safe_output_path("cards_all.json")
    with out.open("w", encoding="utf-8") as f:
        json.dump(results_all, f, ensure_ascii=False, indent=2)
    print(f"✔ {out.name} — {len(results_all)} cartes")

# ============================
# LOG
# ============================
if log_lines:
    with LOG_FILE.open("w", encoding="utf-8") as f:
        f.write("\n".join(log_lines))
    print(t("multiface_corrections", n=correction_count))
    print(t("log_written", name=LOG_FILE.name))
    if ask_yes(f"\n{t('delete_log_prompt', name=LOG_FILE.name)}"):
        LOG_FILE.unlink()
        print(t("log_deleted"))
    else:
        print(t("log_kept"))
else:
    print(t("no_corrections"))

print(t("ignored_same", n=ignored_same_name))
print(t("done"))

# ============================
# NETTOYAGE DU BULK
# ============================
size_mo = INPUT_FILE.stat().st_size / 1_048_576
if ask_yes(f"\n{t('delete_prompt', name=INPUT_FILE.name, mo=f'{size_mo:.0f}')}"):
    INPUT_FILE.unlink()
    print(t("deleted", name=INPUT_FILE.name))
else:
    print(t("kept"))