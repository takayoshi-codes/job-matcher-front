import sys

with open(sys.argv[1], encoding='utf-8') as f:
    lines = f.readlines()

# 230行目以前でバックスラッシュや問題になりそうな箇所を探す
print(f"Total lines: {len(lines)}")
for i, line in enumerate(lines[:232], 1):
    # テンプレートリテラルのネストや問題のある文字を探す
    if '\\[' in line or '\\s' in line or '\\S' in line:
        print(f"L{i}: {line.rstrip()}")
