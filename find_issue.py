import sys

with open(sys.argv[1], encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total: {len(lines)} lines")

# 1-232行目で括弧バランスをチェック
depth = 0
in_str = None
escape = False

for i, line in enumerate(lines[:232], 1):
    for ch in line:
        if escape:
            escape = False
            continue
        if ch == '\\':
            escape = True
            continue
        if in_str is None:
            if ch in ('"', "'"):
                in_str = ch
            elif ch == '`':
                in_str = '`'
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
        elif in_str == '`':
            if ch == '`':
                in_str = None
        else:
            if ch == in_str:
                in_str = None
    
    # 未閉じの文字列が残っている行
    if in_str is not None and in_str != '`':
        print(f"L{i} unclosed {in_str}: {line.rstrip()[:80]}")

print(f"Depth at L232: {depth}")

# AI生成ボタン付近を表示
for i, line in enumerate(lines, 1):
    if 'NEXT_PUBLIC_GEMINI' in line:
        print(f"\nL{i}: {line.rstrip()[:120]}")
