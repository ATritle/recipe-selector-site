#!/usr/bin/env python3
"""
=========================================================
 TritleKitchen JSON Combiner
 Version 1.1
=========================================================

Reads every recipe JSON from recipe_json/

Creates:

    breakfast.json
    desserts.json
    dinner.json
    drinks.json
    miscellaneous.json

Recipes are grouped by:

Category
    └── Subcategory
            └── Recipes

Recipes and subcategories are alphabetized.
"""

from pathlib import Path
from build_config import VALID_CATEGORIES
import json

# -------------------------------------------------------
# FOLDERS
# -------------------------------------------------------

ROOT = Path(__file__).parent

INPUT_DIR = ROOT / "recipe_json"

OUTPUT_FILES = {
    "Breakfast": ROOT / "breakfast.json",
    "Desserts": ROOT / "desserts.json",
    "Dinner": ROOT / "dinner.json",
    "Drinks": ROOT / "drinks.json",
    "Miscellaneous": ROOT / "miscellaneous.json",
}

# -------------------------------------------------------

categories = {
    "Breakfast": {},
    "Desserts": {},
    "Dinner": {},
    "Drinks": {},
    "Miscellaneous": {}
}

# -------------------------------------------------------

json_files = sorted(INPUT_DIR.glob("*.json"))

print(f"Found {len(json_files)} recipe JSON files.\n")

processed = 0

for file in json_files:

    if file.stem.lower() == "template":
        continue

    with open(file, "r", encoding="utf-8") as f:
        recipe = json.load(f)

    category = recipe.get("category", "").strip()
    subcategory = recipe.get("subcategory", "").strip()

    # -------------------------------------------------------
    # Validate Category
    # -------------------------------------------------------

    if category not in VALID_CATEGORIES:

        print()
        print("=" * 60)
        print("BUILD FAILED")
        print("=" * 60)

        print(f"\nRecipe JSON : {file.name}")
        print(f"Category    : {category}")

        print("\nValid Categories:")

        for c in VALID_CATEGORIES:
            print(f"  - {c}")

        raise SystemExit(1)

    # -------------------------------------------------------
    # Validate Subcategory
    # -------------------------------------------------------

    if not subcategory:

        print()
        print("=" * 60)
        print("BUILD FAILED")
        print("=" * 60)

        print(f"\nRecipe JSON : {file.name}")
        print("Subcategory : <blank>")

        raise SystemExit(1)

    # -------------------------------------------------------
    # Remove fields no longer needed
    # -------------------------------------------------------

    recipe.pop("category", None)
    recipe.pop("subcategory", None)

    if subcategory not in categories[category]:
        categories[category][subcategory] = []

    categories[category][subcategory].append(recipe)

    processed += 1

# -------------------------------------------------------
# SORT EVERYTHING
# -------------------------------------------------------

for category in categories:

    # Sort recipes alphabetically
    for subcategory in categories[category]:

        categories[category][subcategory].sort(
            key=lambda r: r["name"].lower()
        )

    # Sort subcategories alphabetically
    categories[category] = dict(
        sorted(categories[category].items())
    )

# -------------------------------------------------------
# WRITE OUTPUT FILES
# -------------------------------------------------------

print()

for category, output_file in OUTPUT_FILES.items():

    with open(output_file, "w", encoding="utf-8") as f:

        json.dump(
            categories[category],
            f,
            indent=4,
            ensure_ascii=False
        )

    recipe_count = sum(
        len(v)
        for v in categories[category].values()
    )

    print(
        f"Created {output_file.name:<20}"
        f"{recipe_count:>3} recipes"
    )

# -------------------------------------------------------

print("\n----------------------------------------")
print(f"Recipes processed : {processed}")
print(f"Category files    : {len(OUTPUT_FILES)}")
print("----------------------------------------")