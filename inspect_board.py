import json

with open('trello_board_full.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== BOARD INFO ===")
print("ID:", data.get("id"))
print("Name:", data.get("name"))
print("Desc:", data.get("desc"))
print("Prefs background:", data.get("prefs", {}).get("background"))
print("Prefs backgroundColor:", data.get("prefs", {}).get("backgroundColor"))
print("Prefs backgroundImage:", data.get("prefs", {}).get("backgroundImage"))

lists = [l for l in data.get("lists", []) if not l.get("closed")]
print(f"\n=== ACTIVE LISTS ({len(lists)}) ===")
for l in lists:
    print(f"- [{l['id']}] {l['name']} (pos: {l.get('pos')})")

cards = [c for c in data.get("cards", []) if not c.get("closed")]
print(f"\n=== ACTIVE CARDS ({len(cards)}) ===")
for c in cards[:15]:
    print(f"- [{c['idList']}] {c['name']} (labels: {[lb.get('name') or lb.get('color') for lb in c.get('labels', [])]})")

print(f"\n=== LABELS ({len(data.get('labels', []))}) ===")
for lb in data.get("labels", []):
    print(f"- {lb.get('id')}: {lb.get('name')} ({lb.get('color')})")

print(f"\n=== CHECKLISTS ({len(data.get('checklists', []))}) ===")
for ch in data.get("checklists", [])[:5]:
    print(f"- {ch.get('name')}: {len(ch.get('checkItems', []))} items")

print(f"\n=== CUSTOM FIELDS ({len(data.get('customFields', []))}) ===")
for cf in data.get("customFields", []):
    print(f"- {cf.get('name')} ({cf.get('type')})")
