import json

with open('board_summary.json', 'r', encoding='utf-8') as f:
    board_summary = json.load(f)

with open('assets/banners.json', 'r', encoding='utf-8') as f:
    banners = json.load(f)

# Attach local banner images to the lists
for l in board_summary['lists']:
    l_id = l['id']
    if l_id in banners:
        l['banner'] = banners[l_id]
    else:
        l['banner'] = None

# Also ensure card covers have the local file path if they are '.' cards
for l in board_summary['lists']:
    for c in l['cards']:
        if c['name'] == '.' and l.get('banner'):
            c['coverImage'] = l['banner']

js_content = f"// Canonical Trello Board Data - Template de Rotina Superprodutiva\nconst INITIAL_BOARD_DATA = {json.dumps(board_summary, indent=2, ensure_ascii=False)};\n"

with open('boardData.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("Created boardData.js successfully!")
