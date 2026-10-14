import json

with open('trello_board_full.json', 'r', encoding='utf-8') as f:
    board = json.load(f)

for c in board.get('cards', []):
    atts = c.get('attachments', [])
    if atts:
        print(f"Card '{c['name']}' (ID: {c['id']}, List: {c['idList']}): {len(atts)} attachments")
        for a in atts:
            print(f"   Name: {a.get('name')}, url: {a.get('url')}")
            print(f"   Previews count: {len(a.get('previews', []))}")
            for p in a.get('previews', []):
                print(f"      {p.get('width')}x{p.get('height')}: {p.get('url')}")
