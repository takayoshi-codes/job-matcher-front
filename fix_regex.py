import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

# regexのバックスラッシュを修正
# \[短文\] などがJSX内で問題になっている
# raw stringで書かれた正規表現を通常の文字列に変換

fixes = [
    (r'const short = text.match(/\[短文\][\s\S]*?(?=\[中文\]|$)/)?.[0]?.replace("[短文]", "").trim() ?? "";',
     'const short = text.match(/\\[短文\\][\\s\\S]*?(?=\\[中文\\]|$)/)?.[0]?.replace("[短文]", "").trim() ?? "";'),
    (r'const medium = text.match(/\[中文\][\s\S]*?(?=\[長文\]|$)/)?.[0]?.replace("[中文]", "").trim() ?? "";',
     'const medium = text.match(/\\[中文\\][\\s\\S]*?(?=\\[長文\\]|$)/)?.[0]?.replace("[中文]", "").trim() ?? "";'),
    (r'const long = text.match(/\[長文\][\s\S]*?$/)?.[0]?.replace("[長文]", "").trim() ?? "";',
     'const long = text.match(/\\[長文\\][\\s\\S]*?$/)?.[0]?.replace("[長文]", "").trim() ?? "";'),
]

count = 0
for old, new in fixes:
    if old in c:
        c = c.replace(old, new)
        count += 1

print(f'Fixed {count} regex patterns')

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
