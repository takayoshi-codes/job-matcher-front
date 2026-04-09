import sys

with open(sys.argv[1], encoding='utf-8') as f:
    lines = f.readlines()

# より正確な解析：正規表現内のクォートを無視
depth = 0
in_str = None
escape = False
in_regex = False

for i, line in enumerate(lines[:232], 1):
    j = 0
    while j < len(line):
        ch = line[j]
        
        if escape:
            escape = False
            j += 1
            continue
            
        if ch == '\\':
            escape = True
            j += 1
            continue
        
        if in_regex:
            if ch == '/':
                in_regex = False
            j += 1
            continue
            
        if in_str is None:
            if ch == '/':
                # 正規表現の開始かチェック（前の非空白文字を確認）
                prev_chars = line[:j].rstrip()
                if prev_chars and prev_chars[-1] in ('=', '(', ',', '[', '!', '&', '|', '+', '-', '*', '{', ';', ':'):
                    in_regex = True
                else:
                    pass  # 除算
            elif ch in ('"', "'"):
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
        j += 1
    
    if in_str is not None and in_str != '`':
        print(f"L{i} unclosed {in_str}: {line.rstrip()[:80]}")

print(f"\nDepth at L232: {depth}")
print(f"in_str at L232: {in_str}")
