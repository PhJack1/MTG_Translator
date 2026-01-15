import json
import ijson
import unicodedata
import argparse
from collections import defaultdict
from tqdm import tqdm
from pathlib import Path

# ============================
# ARGUMENTS CLI
# ============================
parser = argparse.ArgumentParser(
    description="Extraction des traductions de cartes MTG depuis un bulk Scryfall"
)
parser.add_argument(
    "input_file",
    help="Fichier bulk Scryfall (ex: all-cards-XXXX.json)"
)
args = parser.parse_args()

INPUT_FILE = Path(args.input_file)
OUTPUT_PREFIX = "cards_"
LOG_FILE = INPUT_FILE.with_suffix(".multiface_corrections.log")

# ============================
# CONFIG
# ============================
TARGET_LANGS = {
    "es", "fr", "de", "it", "pt",
    "ja", "ko", "ru",
    "zh", "zh-TW",
}

# Mapping Scryfall → UI
LANG_MAP = {
    "zhs": "zh",
    "zht": "zh-TW",
}

# ============================
# UTILS
# ============================
def normalize(s: str) -> str:
    return unicodedata.normalize("NFC", s.strip())

def get_card_name(card, lang="en"):
    """
    Construit un nom canonique fiable pour cartes simples
    et cartes multi-faces.
    """
    faces = card.get("card_faces")

    if faces:
        names = []
        for face in faces:
            if lang != "en":
                face_name = face.get("printed_name") or face.get("name")
            else:
                face_name = face.get("name")

            if not face_name:
                return None

            names.append(face_name.strip())

        return " // ".join(names)

    if lang != "en":
        return (card.get("printed_name") or card.get("name") or "").strip()

    return (card.get("name") or "").strip()


def dedupe_multiface_name(name: str):
    """
    Supprime les répétitions dans les noms multi-faces :
    'A // B // A // B' -> 'A // B'
    """
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
print("📊 Comptage des cartes...")
total_cards = 0
with INPUT_FILE.open("rb") as f:
    for _ in ijson.items(f, "item"):
        total_cards += 1

print(f"→ {total_cards} cartes détectées\n")

# ============================
# PASSAGE 2 : lecture streaming
# ============================
by_oracle = defaultdict(dict)
seen_names = defaultdict(lambda: defaultdict(set))

with INPUT_FILE.open("rb") as f:
    cards = ijson.items(f, "item")
    for card in tqdm(cards, total=total_cards, desc="Lecture du bulk"):
        oracle_id = card.get("oracle_id")
        raw_lang = card.get("lang")
        lang = LANG_MAP.get(raw_lang, raw_lang)

        if not oracle_id or not lang:
            continue

        if lang != "en" and lang not in TARGET_LANGS:
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
results_by_lang = {lang: [] for lang in TARGET_LANGS}
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

    for lang in TARGET_LANGS:
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
for lang in sorted(TARGET_LANGS):
    data = results_by_lang[lang]
    if not data:
        print(f"⚠️  cards_{lang}.json ignoré (aucune donnée)")
        continue

    filename = f"{OUTPUT_PREFIX}{lang}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"✔ {filename} — {len(data)} cartes")

with open("cards_all.json", "w", encoding="utf-8") as f:
    json.dump(results_all, f, ensure_ascii=False, indent=2)

print(f"✔ cards_all.json — {len(results_all)} cartes")

# ============================
# LOG
# ============================
if log_lines:
    with LOG_FILE.open("w", encoding="utf-8") as f:
        f.write("\n".join(log_lines))

    print(f"🧹 Corrections multi-faces : {correction_count}")
    print(f"📝 Log écrit dans {LOG_FILE.name}")
else:
    print("🧹 Aucune correction multi-face détectée")

print(f"\n🚫 Cartes ignorées (traduction == anglais) : {ignored_same_name}")
print("✅ Terminé.")
