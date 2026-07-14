#!/usr/bin/env python3
"""
=========================================================
 TritleKitchen Build
 Version 1.0
=========================================================

Runs the complete TritleKitchen build process.

Steps:

    1. Build individual recipe JSON files
    2. Combine category JSON files

Usage:

    py build_site.py
"""

from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).parent


def run_script(script_name, description):
    print()
    print("=" * 60)
    print(description)
    print("=" * 60)

    result = subprocess.run(
        [sys.executable, str(ROOT / script_name)]
    )

    if result.returncode != 0:

        print()
        print("=" * 60)
        print("BUILD FAILED")
        print("=" * 60)
        print(f"{script_name} exited with code {result.returncode}")

        sys.exit(result.returncode)


def main():

    print()
    print("=" * 60)
    print("TRITLEKITCHEN BUILD")
    print("=" * 60)

    run_script(
        "build_recipes.py",
        "Step 1 of 2 - Building Recipe JSON Files"
    )

    run_script(
        "combine_json.py",
        "Step 2 of 2 - Combining Category JSON Files"
    )

    print()
    print("=" * 60)
    print("BUILD COMPLETE")
    print("=" * 60)

    print()
    print("The following files have been updated:")
    print()
    print("  recipe_json/")
    print("  breakfast.json")
    print("  desserts.json")
    print("  dinner.json")
    print("  drinks.json")
    print("  miscellaneous.json")
    print()


if __name__ == "__main__":
    main()