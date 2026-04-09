import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

# [\s\S]をJSX内で使える形に変更
# 正規表現をsplit方式に変更
replacements = [
    # AI生成ボタン
    (
        'const short = text.match(/\\[短文\\][\\s\\S]*?(?=\\[中文\\]|$)/)?.[0]?.replace("[短文]", "").trim() ?? "";\n                      const medium = text.match(/\\[中文\\][\\s\\S]*?(?=\\[長文\\]|$)/)?.[0]?.replace("[中文]", "").trim() ?? "";\n                      const long = text.match(/\\[長文\\][\\s\\S]*?$/)?.[0]?.replace("[長文]", "").trim() ?? "";',
        'const parts = text.split(/\\[短文\\]|\\[中文\\]|\\[長文\\]/).map((s: string) => s.trim());\n                      const short = parts[1] ?? "";\n                      const medium = parts[2] ?? "";\n                      const long = parts[3] ?? "";'
    ),
]

count = 0
for old, new in replacements:
    occurrences = c.count(old)
    if occurrences > 0:
        c = c.replace(old, new)
        count += occurrences
        print(f'Fixed {occurrences} occurrences')
    else:
        # CRLF版
        old_crlf = old.replace('\n', '\r\n')
        new_crlf = new.replace('\n', '\r\n')
        if old_crlf in c:
            c = c.replace(old_crlf, new_crlf)
            count += 1
            print('Fixed CRLF version')
        else:
            print(f'NOT FOUND: {old[:50]}')

print(f'Total fixed: {count}')

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
