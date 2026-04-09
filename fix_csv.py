import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

# CSVのreplace部分を修正
old = 'const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, \'""\')}"`).join(",")).join("\\n");'
new = 'const csv = rows.map(r => r.map(c => { const v = String(c ?? "").replace(/"/g, "\\"\\""); return `"${v}"`; }).join(",")).join("\\n");'

if old in c:
    c = c.replace(old, new)
    print('CSV fix: OK')
else:
    # CRLF版
    old2 = old.replace('\n', '\r\n')
    new2 = new.replace('\n', '\r\n')
    if old2 in c:
        c = c.replace(old2, new2)
        print('CSV fix CRLF: OK')
    else:
        print('CSV fix: NOT FOUND, searching...')
        idx = c.find("replace(/\"/g,")
        if idx >= 0:
            print(f'Found at char {idx}:', repr(c[idx-50:idx+80]))

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
