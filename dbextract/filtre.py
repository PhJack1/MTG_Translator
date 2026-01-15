import ijson
import json
import sys
from pathlib import Path
from tqdm import tqdm


def has_two_double_slash_in_one_line(card):
    # Vérifie le nom anglais
    if card.get("english", "").count("//") >= 2:
        return True

    # Vérifie chaque traduction indépendamment
    for value in card.get("translations", {}).values():
        if value.count("//") >= 2:
            return True

    return False


def main():
    if len(sys.argv) != 2:
        print("Usage: python filter_cards.py <input.json>")
        sys.exit(1)

    input_path = Path(sys.argv[1])

    if not input_path.exists():
        print(f"Fichier introuvable : {input_path}")
        sys.exit(1)

    output_path = input_path.with_name(
        input_path.stem + "_filtered" + input_path.suffix
    )

    with open(input_path, "rb") as f_in, open(output_path, "w", encoding="utf-8") as f_out:
        f_out.write("[\n")
        first = True

        cards = ijson.items(f_in, "item")

        for card in tqdm(cards, desc=f"Traitement {input_path.name}"):
            if has_two_double_slash_in_one_line(card):
                if not first:
                    f_out.write(",\n")
                json.dump(card, f_out, ensure_ascii=False, indent=2)
                first = False

        f_out.write("\n]\n")

    print(f"\n✅ Fichier généré : {output_path}")


if __name__ == "__main__":
    main()
