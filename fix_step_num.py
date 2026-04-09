with open('src/app/career/page.tsx', encoding='utf-8') as f:
    content = f.read()

# 自己PR(step===1)を4に、職務経歴(step===4)を1に入れ替え
# まず一時的な文字列に置換してから最終形に
content = content.replace('{step === 1 && (\n          <div>\n            {[["short"', '{step === 99TEMP && (\n          <div>\n            {[["short"')
content = content.replace('{step === 4 && (\n          <div>\n            <div style={{ display: "flex", justifyContent: "space-between"', '{step === 1 && (\n          <div>\n            <div style={{ display: "flex", justifyContent: "space-between"')
content = content.replace('{step === 99TEMP && (\n          <div>\n            {[["short"', '{step === 4 && (\n          <div>\n            {[["short"')

# CRLF版
content = content.replace('{step === 1 && (\r\n          <div>\r\n            {[["short"', '{step === 99TEMP && (\r\n          <div>\r\n            {[["short"')
content = content.replace('{step === 4 && (\r\n          <div>\r\n            <div style={{ display: "flex", justifyContent: "space-between"', '{step === 1 && (\r\n          <div>\r\n            <div style={{ display: "flex", justifyContent: "space-between"')
content = content.replace('{step === 99TEMP && (\r\n          <div>\r\n            {[["short"', '{step === 4 && (\r\n          <div>\r\n            {[["short"')

with open('src/app/career/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
