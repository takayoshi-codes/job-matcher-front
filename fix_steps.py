import re
with open('src/app/career/page.tsx', encoding='utf-8') as f:
    content = f.read()

old = 'const STEPS = [\n  { label: "基本情報", icon: "👤" },\n  { label: "自己PR", icon: "✍️" },\n  { label: "スキルサマリ", icon: "📋" },\n  { label: "技術スタック", icon: "⚙️" },\n  { label: "職務経歴", icon: "💼" },\n  { label: "稼働条件", icon: "📅" },\n  { label: "プレビュー・出力", icon: "📄" },\n];'
new = 'const STEPS = [\n  { label: "基本情報", icon: "👤" },\n  { label: "職務経歴", icon: "💼" },\n  { label: "スキルサマリ", icon: "📋" },\n  { label: "技術スタック", icon: "⚙️" },\n  { label: "自己PR", icon: "✍️" },\n  { label: "稼働条件", icon: "📅" },\n  { label: "プレビュー・出力", icon: "📄" },\n];'

result = content.replace(old, new)
print('replaced' if result != content else 'NOT replaced - checking CRLF')

# CRLF版も試す
old2 = old.replace('\n', '\r\n')
new2 = new.replace('\n', '\r\n')
result2 = content.replace(old2, new2)
if result2 != content:
    print('CRLF replaced')
    result = result2

with open('src/app/career/page.tsx', 'w', encoding='utf-8') as f:
    f.write(result)
