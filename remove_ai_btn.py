import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

nl = '\r\n' if '\r\n' in c else '\n'

# AIボタン全体を削除
start_marker = nl.join([
    '            <div style={{ ...s.card, marginBottom: 16, background: "#fff8f5", border: "1px solid #ffd0c0" }}>',
    '              <div style={s.sectionTitle}><div style={s.bar} />AIで自己PRを生成・添削</div>',
])
end_marker = nl.join([
    '              <div style={{ fontSize: 11, color: "#e85d26", marginTop: 8 }}>※ STEP2〜4の入力が多いほど精度が上がります</div>',
    '            </div>',
])

start_idx = c.find(start_marker)
end_idx = c.find(end_marker)

if start_idx >= 0 and end_idx >= 0:
    end_idx += len(end_marker) + len(nl)
    removed = c[start_idx:end_idx]
    c = c[:start_idx] + c[end_idx:]
    print(f'Removed AI block ({len(removed)} chars)')
else:
    print(f'Block not found: start={start_idx}, end={end_idx}')

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
