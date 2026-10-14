import json

with open('trello_board_full.json', 'r', encoding='utf-8') as f:
    board = json.load(f)

print(f"Board Name: {board.get('name')}")
print(f"Board Desc: {board.get('desc')}")
print(f"Background: {board.get('prefs', {}).get('backgroundImage')}")

lists = {l['id']: l for l in board.get('lists', [])}
cards = board.get('cards', [])
labels = {lb['id']: lb for lb in board.get('labels', [])}

print(f"\nTotal Lists: {len(lists)}")
print(f"Total Cards: {len(cards)}")

# Group cards by list
cards_by_list = {}
for l_id in lists:
    cards_by_list[l_id] = []

for c in cards:
    if c['idList'] in cards_by_list:
        cards_by_list[c['idList']].append(c)

# Sort lists by pos
sorted_lists = sorted([l for l in lists.values() if not l.get('closed')], key=lambda x: x.get('pos', 0))

summary = []
for l in sorted_lists:
    l_cards = sorted(cards_by_list.get(l['id'], []), key=lambda x: x.get('pos', 0))
    print(f"\n==========================================")
    print(f"LIST: {l['name']} (ID: {l['id']}, Cards: {len(l_cards)})")
    print(f"==========================================")
    l_summary = {
        "id": l['id'],
        "name": l['name'],
        "pos": l.get('pos'),
        "cards": []
    }
    for c in l_cards:
        card_labels = [lb.get('name') or lb.get('color') for lb in c.get('labels', [])]
        print(f"  • {c['name']} | Labels: {card_labels} | Desc len: {len(c.get('desc', ''))} | Cover: {c.get('cover', {}).get('color') or c.get('cover', {}).get('idAttachment')}")
        if c.get('desc'):
            print(f"      [Desc preview]: {c['desc'][:100]}...")
        l_summary["cards"].append({
            "id": c['id'],
            "name": c['name'],
            "desc": c.get('desc', ''),
            "pos": c.get('pos'),
            "labels": c.get('labels', []),
            "cover": c.get('cover', {}),
            "due": c.get('due'),
            "dueComplete": c.get('dueComplete', False)
        })
    summary.append(l_summary)

with open('board_summary.json', 'w', encoding='utf-8') as f:
    json.dump({
        "name": board.get('name'),
        "desc": board.get('desc'),
        "prefs": board.get('prefs'),
        "labels": board.get('labels'),
        "lists": summary
    }, f, indent=2, ensure_ascii=False)

print("\nSaved board_summary.json successfully!")
