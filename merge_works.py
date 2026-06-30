"""
works_section_edit.html を編集後、このスクリプトを実行すると
OG建設 Webサイト (standalone).html に変更が反映されます。

使い方:
  python merge_works.py
"""
import sys, json, re

sys.stdout.reconfigure(encoding='utf-8')

STANDALONE = r'OG建設 Webサイト (standalone).html'
EDIT_FILE  = r'works_section_edit.html'
TAG = '<script type="__bundler/template">'

# ── 1. 編集ファイルから <section> を取り出す ──
with open(EDIT_FILE, 'r', encoding='utf-8') as f:
    edit_html = f.read()

# <body> の後から </body> の前を取得し、コメント・空行を除く
body_m = re.search(r'<body>(.*?)</body>', edit_html, re.DOTALL)
if not body_m:
    print('ERROR: <body> が見つかりません')
    sys.exit(1)
body = body_m.group(1).strip()
# HTMLコメントを除去（先頭説明コメント）
body = re.sub(r'<!--[^<]*?-->\s*', '', body, count=1).strip()

# <section id="works"> ～ </section> を抽出
m = re.search(r'<section[^>]*id="works".*?</section>', body, re.DOTALL)
if not m:
    print('ERROR: <section id="works"> が見つかりません')
    sys.exit(1)
new_works = m.group(0)
print(f'新しい実績セクション: {len(new_works)} 文字')

# ── 2. standalone HTML のテンプレートを取り出す ──
with open(STANDALONE, 'r', encoding='utf-8') as f:
    html = f.read()

tpl_s = html.find(TAG)
# テンプレートJSON文字列の末尾は '"</script>' パターン (JSONの閉じ"の直後が</script>)
# 内部に</script>が含まれる場合があるため find('</script>') では誤検知する
_end_marker = '"</script>'
tpl_e = html.find(_end_marker, tpl_s + len(TAG)) + 1  # +1 で閉じ " を含む位置
tpl_raw = html[tpl_s + len(TAG):tpl_e]
tpl = json.loads(tpl_raw)

# ── 3. 旧 works セクションを新しいものに差し替える ──
works_pos   = tpl.find('id="works"')
section_open = tpl.rfind('<section', 0, works_pos)
section_close = tpl.find('</section>', works_pos) + len('</section>')
old_works = tpl[section_open:section_close]

print(f'旧セクション: {len(old_works)} 文字')
tpl_new = tpl[:section_open] + new_works + tpl[section_close:]
print(f'テンプレート差分: {len(tpl_new) - len(tpl):+d} 文字')

# ── 4. JSON エンコードして書き戻す ──
# </script> をエスケープして将来の境界検出バグを防ぐ
tpl_new_raw = json.dumps(tpl_new, ensure_ascii=False).replace('</', '<\\/')
html_new = html[:tpl_s + len(TAG)] + tpl_new_raw + html[tpl_e:]

with open(STANDALONE, 'w', encoding='utf-8') as f:
    f.write(html_new)

print(f'\n✓ 反映完了: {STANDALONE}')
print(f'  ファイルサイズ: {len(html_new)//1024} KB')
