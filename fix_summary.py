with open('src/app/career/page.tsx', encoding='utf-8') as f:
    content = f.read()

# 改行コードを統一
nl = '\r\n' if '\r\n' in content else '\n'

# 1. スキルサマリに経験なし追加
old1 = '[["consulting","\u30b3\u30f3\u30b5\u30eb\u30c6\u30a3\u30f3\u30b0\u30b9\u30ad\u30eb","\u9867\u5ba2\u6298\u8885\u30fb\u8981\u4ef6\u5b9a\u7fa9\u30fb\u63d0\u6848\u30fb\u696d\u52d9\u6539\u5584\u306a\u3069\u306e\u7d4c\u9a13"],["management","\u30de\u30cd\u30b8\u30e1\u30f3\u30c8\u30b9\u30ad\u30eb","PM\u30fbPL\u7d4c\u9a13\u3001\u30c1\u30fc\u30e0\u898f\u6a21\u3001\u7ba1\u7406\u696d\u52d9\u306a\u3069\u3092\u5177\u4f53\u7684\u306b"],["it","IT\u30b9\u30ad\u30eb\u30fb\u30c6\u30af\u30cb\u30ab\u30eb\u30b9\u30ad\u30eb","\u958b\u767a\u30d5\u30a7\u30fc\u30ba\u7d4c\u9a13\u3001\u696d\u754c\u77e5\u898b\u3001\u5148\u7aef\u6280\u8853\u3092\u8a18\u8f09"]].map(([f,l,hint]) => ('
if old1 in content:
    new1 = '[["consulting","\u30b3\u30f3\u30b5\u30eb\u30c6\u30a3\u30f3\u30b0\u30b9\u30ad\u30eb","\u9867\u5ba2\u6298\u8885\u30fb\u8981\u4ef6\u5b9a\u7fa9\u30fb\u63d0\u6848\u30fb\u696d\u52d9\u6539\u5584\u306a\u3069\u306e\u7d4c\u9a13","・顧客折衝・要件定義の経験あり\\n・提案書作成・プレゼン経験あり"],["management","\u30de\u30cd\u30b8\u30e1\u30f3\u30c8\u30b9\u30ad\u30eb","PM\u30fbPL\u7d4c\u9a13\u3001\u30c1\u30fc\u30e0\u898f\u6a21\u3001\u7ba1\u7406\u696d\u52d9\u306a\u3069\u3092\u5177\u4f53\u7684\u306b","・PLとして5名チームをマネジメント\\n・工数管理・進捗報告を担当"],["it","IT\u30b9\u30ad\u30eb\u30fb\u30c6\u30af\u30cb\u30ab\u30eb\u30b9\u30ad\u30eb","得意な開発フェーズ・業界・技術領域を記入してください","・全工程経験あり（要件定義〜運用保守）\\n・金融・保険・自治体ドメインの知識"]].map(([f,l,hint,ph]) => ('
    content = content.replace(old1, new1)
    print('skill summary old replaced')

with open('src/app/career/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('done')
