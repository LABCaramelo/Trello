import os
import json
import urllib.request

os.makedirs('assets', exist_ok=True)

with open('trello_board_full.json', 'r', encoding='utf-8') as f:
    board = json.load(f)

# Download background
bg_url = board.get('prefs', {}).get('backgroundImage')
if bg_url:
    print(f"Downloading background: {bg_url}")
    try:
        urllib.request.urlretrieve(bg_url, 'assets/board_background.png')
        print("  Background saved to assets/board_background.png")
    except Exception as e:
        print(f"  Error downloading background: {e}")

# Download column header banners
banner_map = {}
for c in board.get('cards', []):
    if c['name'] == '.' and c.get('attachments'):
        att = c['attachments'][0]
        url = att.get('url')
        previews = att.get('previews', [])
        best_url = previews[-1].get('url') if previews else url
        id_list = c['idList']
        filename = f"banner_{id_list}.png"
        filepath = os.path.join('assets', filename)
        print(f"Downloading banner for list {id_list} ({att.get('name')}) from {best_url}")
        try:
            req = urllib.request.Request(best_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as resp, open(filepath, 'wb') as out_f:
                out_f.write(resp.read())
            print(f"  Saved {filepath}")
            banner_map[id_list] = f"assets/{filename}"
        except Exception as e:
            print(f"  Error: {e}")

with open('assets/banners.json', 'w', encoding='utf-8') as f:
    json.dump(banner_map, f, indent=2)

print("\nAll assets downloaded!")
