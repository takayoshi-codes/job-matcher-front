import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

# 現在の壊れたCSV行を修正
import re

# パターンを探して修正
bad = 'const v = String(c ?? "").replace(/"/g, "\\"\\""); return `"${v}"`;'
good = "const v = String(c ?? '').replace(/\"/g, '\"\"'); return '\"' + v + '\"';"

if bad in c:
    c = c.replace(bad, good)
    print('fix1: OK')
else:
    print('fix1: not found, trying alternatives')
    # 現在の行を直接確認
    for i, line in enumerate(c.split('\n'), 1):
        if 'replace' in line and 'csv' in line.lower():
            print(f'L{i}: {repr(line[:120])}')

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
