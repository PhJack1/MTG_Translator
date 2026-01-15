import json
import ijson
import unicodedata
from collections import defaultdict
from tqdm import tqdm

# ============================
# CONFIG
# ============================
INPUT_FILE = "all-cards-20260110102453.json"
OUTPUT_PREFIX = "cards_"

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

# ============================
# PASSAGE 1 : comptage
# ============================
print("📊 Comptage des cartes...")
total_cards = 0
with open(INPUT_FILE, "rb") as f:
    for _ in ijson.items(f, "item"):
        total_cards += 1

print(f"→ {total_cards} cartes détectées\n")

# ============================
# PASSAGE 2 : lecture streaming
# ============================
by_oracle = defaultdict(dict)
seen_names = defaultdict(lambda: defaultdict(set))  # anti-doublons

with open(INPUT_FILE, "rb") as f:
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

        # 🔹 Anti-doublons : si déjà ajouté → skip
        if name in seen_names[oracle_id][lang]:
            continue

        by_oracle[oracle_id][lang] = name
        seen_names[oracle_id][lang].add(name)

# ============================
# GÉNÉRATION DES JSON
# ============================
results_by_lang = {lang: [] for lang in TARGET_LANGS}
results_all = []

ignored_same_name = 0

for names in by_oracle.values():
    english = names.get("en")
    if not english:
        continue

    english_n = normalize(english)
    translations = {}

    for lang in TARGET_LANGS:
        translated = names.get(lang)
        if not translated:
            continue

        translated_n = normalize(translated)

        # ❌ FILTRE : traduction identique à l'anglais
        if translated_n == english_n:
            ignored_same_name += 1
            continue

        translations[lang] = translated

        # Version mono-langue
        results_by_lang[lang].append({
            "english": english,
            "translations": {lang: translated}
        })

    # Version multi-langues (global)
    if translations:
        results_all.append({
            "english": english,
            "translations": translations
        })

# ============================
# ÉCRITURE DES FICHIERS
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

# Fichier global multi-langues
with open("cards_all.json", "w", encoding="utf-8") as f:
    json.dump(results_all, f, ensure_ascii=False, indent=2)

print(f"✔ cards_all.json — {len(results_all)} cartes")

print(f"\n🚫 Cartes ignorées (traduction == anglais) : {ignored_same_name}")
print("✅ Terminé.")
