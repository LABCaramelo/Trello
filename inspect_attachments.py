import json

with open('trello_board_full.json', 'r', encoding='utf-8') as f:
    board = json.load(f)

for c in board.get('cards', []):
    if c['name'] == '.' or len(c.get('attachments', [])) > 0:
        print(f"Card: {c['id']} | name: {c['name']} | idList: {c['idList']}")
        for a in c.get('attachments', []):
            print(f"  Attachment: {a.get('name')}")
            print(f"    URL: {a.get('url')}")
            previews = a.get('previews', [])
            if previews:
                print(f"    Preview 0: {previews[0].get('url')}")
                print(f"    Preview max: {previews[-1].get('url')}")
