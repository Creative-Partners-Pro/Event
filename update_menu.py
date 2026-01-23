import json
import re

def parse_kitchen_menu(filepath):
    """Parses the trilingual kitchen menu file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    menu_items = []
    current_category = {}

    for line in lines:
        line = line.strip()
        if not line or line == '---':
            continue

        # Check if it's a category line (no price)
        if '—' not in line and '/' in line:
            parts = [p.strip() for p in line.split('/')]
            if len(parts) == 3:
                current_category = {"ka": parts[0], "en": parts[1], "ru": parts[2]}
        # It's an item line
        elif '—' in line:
            name_part, price_part = line.split('—')
            name_part = name_part.strip()
            # Clean up price, removing currency symbol and extra spaces
            price = re.sub(r'[^0-9.]', '', price_part).strip()

            name_parts = [p.strip() for p in name_part.split('/')]
            if len(name_parts) == 3:
                item = {
                    "category": current_category,
                    "name": {"ka": name_parts[0], "en": name_parts[1], "ru": name_parts[2]},
                    "price": price,
                    "desc": None # No descriptions in the source file
                }
                menu_items.append(item)
    return menu_items

def update_all_files(kitchen_items):
    """Updates the menu in all three language JSON files."""

    # --- 1. Update en.json (The source of truth) ---
    with open('data/en.json', 'r+', encoding='utf-8') as f:
        en_data = json.load(f)

        # Get existing categories and kitchen categories
        existing_categories = set(en_data['menu']['categories'])
        kitchen_categories_en = {item['category']['en'] for item in kitchen_items}

        # Add kitchen menu items to the list of items
        for item in kitchen_items:
            en_data['menu']['items'].append({
                "category": item['category']['en'],
                "name": item['name']['en'],
                "price": item['price'],
                "desc": item['desc']
            })

        # Combine all categories and sort them
        en_data['menu']['categories'] = sorted(list(existing_categories.union(kitchen_categories_en)))

        # Write back to en.json
        f.seek(0)
        json.dump(en_data, f, ensure_ascii=False, indent=4)
        f.truncate()

    # The fully updated english menu is now in en_data
    full_en_menu_items = en_data['menu']['items']
    full_en_categories = en_data['menu']['categories']

    # --- 2. Update ru.json ---
    # Create translation maps from EN to RU
    en_to_ru_name_map = {item['name']['en']: item['name']['ru'] for item in kitchen_items}
    en_to_ru_cat_map = {item['category']['en']: item['category']['ru'] for item in kitchen_items}
    en_to_ru_cat_map.update({
        "Beer": "Пиво", "Soft drinks": "Безалкогольные напитки", "Snacks": "Закуски",
        "Shots": "Шоты", "Hight Alcohol Drinks": "Крепкие алкогольные напитки",
        "Cocktails": "Коктейли", "Food": "Еда", "Wine": "Вино", "Hot Drinks": "Горячие напитки"
    })

    with open('data/ru.json', 'r+', encoding='utf-8') as f:
        ru_data = json.load(f)

        # Translate categories
        ru_data['menu']['categories'] = [en_to_ru_cat_map.get(cat, cat) for cat in full_en_categories]

        # Translate items
        new_ru_items = []
        for item in full_en_menu_items:
            new_ru_items.append({
                "category": en_to_ru_cat_map.get(item['category'], item['category']),
                "name": en_to_ru_name_map.get(item['name'], item['name']),
                "price": item['price'],
                "desc": item['desc'] # Descriptions are mostly null or simple
            })
        ru_data['menu']['items'] = new_ru_items

        f.seek(0)
        json.dump(ru_data, f, ensure_ascii=False, indent=4)
        f.truncate()

    # --- 3. Update ka.json ---
    # Create translation maps from EN to KA
    en_to_ka_name_map = {item['name']['en']: item['name']['ka'] for item in kitchen_items}
    en_to_ka_cat_map = {item['category']['en']: item['category']['ka'] for item in kitchen_items}
    en_to_ka_cat_map.update({
        "Beer": "ლუდი", "Soft drinks": "გამაგრილებელი სასმელები", "Snacks": "ხემსი",
        "Shots": "შოთები", "Hight Alcohol Drinks": "მაგარი ალკოჰოლი",
        "Cocktails": "კოქტეილები", "Food": "კერძები", "Wine": "ღვინო", "Hot Drinks": "ცხელი სასმელები"
    })

    with open('data/ka.json', 'r+', encoding='utf-8') as f:
        ka_data = json.load(f)

        # Translate categories
        ka_data['menu']['categories'] = [en_to_ka_cat_map.get(cat, cat) for cat in full_en_categories]

        # Translate items
        new_ka_items = []
        for item in full_en_menu_items:
            new_ka_items.append({
                "category": en_to_ka_cat_map.get(item['category'], item['category']),
                "name": en_to_ka_name_map.get(item['name'], item['name']),
                "price": item['price'],
                "desc": item['desc']
            })
        ka_data['menu']['items'] = new_ka_items

        f.seek(0)
        json.dump(ka_data, f, ensure_ascii=False, indent=4)
        f.truncate()


if __name__ == "__main__":
    kitchen_data = parse_kitchen_menu('kitchen menu.txt')
    update_all_files(kitchen_data)
    print("All JSON menu files have been updated successfully.")
