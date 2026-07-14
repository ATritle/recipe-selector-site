#!/usr/bin/env python3
"""
=========================================================
 TritleKitchen Recipe Builder
 Version 1.0
=========================================================

Converts every HTML recipe into its own JSON file.

recipes/
    apple-pie.html
    balls-of-meat.html

↓

recipe_json/
    apple-pie.json
    balls-of-meat.json

Requires:
    pip install beautifulsoup4
"""

from pathlib import Path
from bs4 import BeautifulSoup
from fractions import Fraction
from build_config import VALID_CATEGORIES
import json
import re

# -------------------------------------------------------
# FOLDERS
# -------------------------------------------------------

ROOT = Path(__file__).parent

RECIPES_DIR = ROOT / "recipes"
OUTPUT_DIR = ROOT / "recipe_json"

# Automatically create recipe_json if needed
OUTPUT_DIR.mkdir(exist_ok=True)

# -------------------------------------------------------
# UNIT CONVERSIONS
# -------------------------------------------------------

UNIT_MAP = {

    # Cups
    "cup": "cup",
    "cups": "cup",

    # Tablespoons
    "tbsp": "TBSP",
    "tablespoon": "TBSP",
    "tablespoons": "TBSP",
    "TBSP": "TBSP",

    # Teaspoons
    "tsp": "tsp",
    "teaspoon": "tsp",
    "teaspoons": "tsp",

    # Weight
    "oz": "oz",
    "ounce": "oz",
    "ounces": "oz",

    "lb": "LB",
    "lbs": "LB",
    "pound": "LB",
    "pounds": "LB",

    # Containers
    "package": "package",
    "packages": "package",
    "pkg": "package",
    "pkgs": "package",

    "can": "can",
    "cans": "can",

    "jar": "jar",
    "jars": "jar",

    "bottle": "bottle",
    "bottles": "bottle",

    # Misc
    "clove": "clove",
    "cloves": "clove",

    "slice": "slice",
    "slices": "slice",

    "stick": "stick",
    "sticks": "stick",

    "sprig": "sprig",
    "sprigs": "sprig",

    "bunch": "bunch",
    "bunches": "bunch",
}

# -------------------------------------------------------
# HELPERS
# -------------------------------------------------------

def get_meta(soup, name):
    """
    Returns the content of a meta tag.
    """

    tag = soup.find("meta", attrs={"name": name})

    if tag and tag.has_attr("content"):
        return tag["content"].strip()

    return ""


# -------------------------------------------------------

def parse_amount(text):
    """
    Parses:

        2
        1/2
        1 1/2
        2.5

    Returns:

        amount
        remaining_text
    """

    text = text.strip()

    match = re.match(
        r'^(\d+\s+\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)',
        text
    )

    if not match:
        return None, text

    raw = match.group(1)

    remaining = text[match.end():].strip()

    # Mixed number
    if " " in raw:

        whole, fraction = raw.split()

        amount = float(whole) + float(Fraction(fraction))

    elif "/" in raw:

        amount = float(Fraction(raw))

    else:

        amount = float(raw)

    if amount.is_integer():
        amount = int(amount)

    return amount, remaining


# -------------------------------------------------------

def parse_ingredient(line):
    """
    Converts:

        1/2 cup onion - chopped

    into

        {
            "amount": 0.5,
            "unit": "cup",
            "item": "onion",
            "note": "chopped"
        }
    """

    line = line.strip()

    # ---------------------------------
    # Extract note
    # ---------------------------------

    note = ""

    if " - " in line:
        line, note = line.split(" - ", 1)
        line = line.strip()
        note = note.strip()

    # ---------------------------------
    # Parse amount
    # ---------------------------------

    amount, remaining = parse_amount(line)

    words = remaining.split()

    unit = ""

    if words:

        lookup = words[0].lower()

        if lookup in UNIT_MAP:

            unit = UNIT_MAP[lookup]

            words = words[1:]

    item = " ".join(words).strip()

    if item == "":
        item = remaining

    # ---------------------------------
    # Build JSON object
    # ---------------------------------

    ingredient = {}

    if amount is not None:
        ingredient["amount"] = amount

    if unit:
        ingredient["unit"] = unit

    ingredient["item"] = item

    if note:
        ingredient["note"] = note

    return ingredient

# -------------------------------------------------------
# BUILD OUTPUT
# -------------------------------------------------------

last_category = None
last_subcategory = None

# -------------------------------------------------------
# PROCESS ONE RECIPE
# -------------------------------------------------------

def process_recipe(recipe_info):

    global last_category
    global last_subcategory

    html_file = recipe_info["file"]

    with open(html_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    # -----------------------------
    # Recipe Info
    # -----------------------------

    recipe_name = recipe_info["title"]
    category = recipe_info["category"]
    subcategory = recipe_info["subcategory"]

    # -----------------------------
    # Validate Category
    # -----------------------------

    if category not in VALID_CATEGORIES:

        print("\n")
        print("=" * 60)
        print("BUILD FAILED")
        print("=" * 60)

        print(f"\nRecipe : {html_file.name}")
        print(f"Category : {category}")

        print("\nValid Categories:")

        for c in VALID_CATEGORIES:
            print(f"  - {c}")

        raise SystemExit(1)

    # -----------------------------
    # Pretty Output
    # -----------------------------

    if category != last_category:

        print()
        print("=" * 60)
        print(category.upper())
        print("=" * 60)

        last_category = category
        last_subcategory = None

    if subcategory != last_subcategory:

        print(f"\n  ▶ {subcategory}")

        last_subcategory = subcategory

    print(f"      ✓ {recipe_name}")

    # -----------------------------
    # Find Ingredients
    # -----------------------------

    ingredients = []

    ingredient_header = soup.find(
        lambda tag:
            tag.name in ("h2", "h3")
            and "ingredient" in tag.get_text(strip=True).lower()
    )

    if ingredient_header:

        ingredient_list = ingredient_header.find_next("ul")

        if ingredient_list:

            for li in ingredient_list.find_all("li", recursive=False):

                ingredients.append(
                    parse_ingredient(
                        li.get_text(" ", strip=True)
                    )
                )

    # -----------------------------
    # Build JSON
    # -----------------------------

    recipe = {

        "name": recipe_name,

        "category": category,

        "subcategory": subcategory,

        "url": f"recipes/{html_file.name}",

        "ingredients": ingredients

    }

    # -----------------------------
    # Write JSON
    # -----------------------------

    output_file = OUTPUT_DIR / f"{html_file.stem}.json"

    with open(output_file, "w", encoding="utf-8") as outfile:

        json.dump(
            recipe,
            outfile,
            indent=4,
            ensure_ascii=False
        )

# -------------------------------------------------------
# MAIN
# -------------------------------------------------------

def main():

    # -------------------------------------------------------
    # LOAD & SORT RECIPES
    # -------------------------------------------------------

    recipes = []

    for html in sorted(RECIPES_DIR.glob("*.html")):

        if html.stem.lower() == "template":
            continue

        with open(html, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")

        if soup.title:
            title = soup.title.get_text(strip=True)
        else:
            title = html.stem.replace("-", " ").title()

        category = get_meta(soup, "recipe-category")

        subcategory = get_meta(soup, "recipe-subcategory")

        recipes.append({
            "file": html,
            "title": title,
            "category": category,
            "subcategory": subcategory
        })

    recipes.sort(
        key=lambda r: (
            r["category"].lower(),
            r["subcategory"].lower(),
            r["title"].lower()
        )
    )

    if not recipes:
        print("No HTML recipes found.")
        return

    print(f"Found {len(recipes)} recipes.\n")

    processed = 0
    errors = 0

    for recipe in recipes:

        html = recipe["file"]

        try:

            process_recipe(recipe)
            processed += 1

        except Exception as ex:

            errors += 1

            print(f"\nERROR: {html.name}")
            print(ex)
            print()

    print("\n----------------------------------------")
    print(f"Recipes processed : {processed}")
    print(f"JSON files created: {processed}")
    print(f"Errors            : {errors}")
    print("----------------------------------------")


if __name__ == "__main__":
    main()