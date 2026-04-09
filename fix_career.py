import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

# CRLFかLFか判定
nl = '\r\n' if '\r\n' in c else '\n'

# 1. スキルサマリに経験なしタグ追加
old1 = nl.join([
    '              <div style={s.card} key={f}>',
    '                <div style={s.sectionTitle}><div style={s.bar} />{l}</div>',
    '                <div style={s.desc}>{hint}</div>',
    '                <textarea style={{ ...s.inp, minHeight: 160 }} placeholder={`・〇〇の経験\\n・〇〇を担当`} value={(data.summary as any)[f]} onChange={e => update("summary", f, e.target.value)} />',
    '              </div>',
])
new1 = nl.join([
    '              <div style={s.card} key={f}>',
    '                <div style={s.sectionTitle}><div style={s.bar} />{l}</div>',
    '                <div style={s.desc}>{hint}</div>',
    '                <div style={{ marginBottom: 8 }}>',
    '                  <span style={{ ...s.tag, ...((data.summary as any)[f] === "経験なし・該当なし" ? s.tagOn : s.tagOff) }}',
    '                    onClick={() => update("summary", f, (data.summary as any)[f] === "経験なし・該当なし" ? "" : "経験なし・該当なし")}>',
    '                    {(data.summary as any)[f] === "経験なし・該当なし" && <span style={{ fontSize: 10 }}>✓</span>}経験なし・該当なし',
    '                  </span>',
    '                </div>',
    '                {(data.summary as any)[f] !== "経験なし・該当なし" && (',
    '                  <textarea style={{ ...s.inp, minHeight: 140 }} placeholder={ph as string} value={(data.summary as any)[f]} onChange={e => update("summary", f, e.target.value)} />',
    '                )}',
    '              </div>',
])
if old1 in c:
    c = c.replace(old1, new1)
    print('1. skill summary none: OK')
else:
    print('1. skill summary none: NOT FOUND')

# 2. AI生成ボタン追加
old2 = nl.join([
    '        {/* STEP 4: 自己PR */}',
    '        {step === 4 && (',
    '          <div>',
    '            {[["short"',
])
new2 = nl.join([
    '        {/* STEP 4: 自己PR */}',
    '        {step === 4 && (',
    '          <div>',
    '            <div style={{ ...s.card, marginBottom: 16, background: "#fff8f5", border: "1px solid #ffd0c0" }}>',
    '              <div style={s.sectionTitle}><div style={s.bar} />AIで自己PRを生成・添削</div>',
    '              <div style={s.desc}>入力済みの職務経歴・スキルを元にGemini AIが自己PRを自動生成します</div>',
    '              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>',
    '                <button style={{ ...s.btn, ...s.btnPrimary, fontSize: 13 }}',
    '                  onClick={async () => {',
    '                    const summary = [data.projects.map((p: any) => p.title + " " + p.overview).join(" "), Object.values(data.tech).flat().join("、"), data.summary.it, data.summary.consulting, data.summary.management].filter(Boolean).join(" ");',
    '                    const prompt = "以下の職務経歴・スキルを元に副業フリーランス向けの自己PRを3種類生成してください。\\n\\n" + summary + "\\n\\n以下の形式で返してください：\\n[短文]\\n（100文字程度）\\n\\n[中文]\\n（400文字程度）\\n\\n[長文]\\n（800文字程度）";',
    '                    try {',
    '                      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=" + process.env.NEXT_PUBLIC_GEMINI_API_KEY;',
    '                      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });',
    '                      const json = await res.json();',
    '                      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";',
    r'                      const short = text.match(/\[短文\][\s\S]*?(?=\[中文\]|$)/)?.[0]?.replace("[短文]", "").trim() ?? "";',
    r'                      const medium = text.match(/\[中文\][\s\S]*?(?=\[長文\]|$)/)?.[0]?.replace("[中文]", "").trim() ?? "";',
    r'                      const long = text.match(/\[長文\][\s\S]*?$/)?.[0]?.replace("[長文]", "").trim() ?? "";',
    '                      if (short) update("pr", "short", short);',
    '                      if (medium) update("pr", "medium", medium);',
    '                      if (long) update("pr", "long", long);',
    '                    } catch { alert("AI生成に失敗しました"); }',
    '                  }}>✨ AIで自己PRを生成</button>',
    '                <button style={{ ...s.btn, ...s.btnGhost, fontSize: 13 }}',
    '                  onClick={async () => {',
    '                    if (!data.pr.short && !data.pr.medium && !data.pr.long) { alert("まず自己PRを入力してください"); return; }',
    '                    const prompt = "以下の自己PRを副業フリーランス向けに改善してください。同じ形式で返してください。\\n\\n[短文]\\n" + data.pr.short + "\\n\\n[中文]\\n" + data.pr.medium + "\\n\\n[長文]\\n" + data.pr.long;',
    '                    try {',
    '                      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=" + process.env.NEXT_PUBLIC_GEMINI_API_KEY;',
    '                      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });',
    '                      const json = await res.json();',
    '                      const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";',
    r'                      const short = text.match(/\[短文\][\s\S]*?(?=\[中文\]|$)/)?.[0]?.replace("[短文]", "").trim() ?? "";',
    r'                      const medium = text.match(/\[中文\][\s\S]*?(?=\[長文\]|$)/)?.[0]?.replace("[中文]", "").trim() ?? "";',
    r'                      const long = text.match(/\[長文\][\s\S]*?$/)?.[0]?.replace("[長文]", "").trim() ?? "";',
    '                      if (short) update("pr", "short", short);',
    '                      if (medium) update("pr", "medium", medium);',
    '                      if (long) update("pr", "long", long);',
    '                    } catch { alert("AI添削に失敗しました"); }',
    '                  }}>📝 AIで添削・改善</button>',
    '              </div>',
    '              <div style={{ fontSize: 11, color: "#e85d26", marginTop: 8 }}>※ STEP2〜4の入力が多いほど精度が上がります</div>',
    '            </div>',
    '            {[["short"',
])
if old2 in c:
    c = c.replace(old2, new2)
    print('2. AI buttons: OK')
else:
    print('2. AI buttons: NOT FOUND')

# 3. プレビューデザイン刷新
old3 = nl.join([
    '            {/* プレビュー */}',
    '            <div style={{ background: "#fff", borderRadius: 12, padding: 36, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 16 }}>',
    '              <div style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>{outputMode === "skill" ? "スキルシート" : "職務経歴書"}</div>',
    '              <div style={{ fontSize: 17, fontWeight: 600, textAlign: "center", marginBottom: 4 }}>{data.basic.name || "（氏名未入力）"}</div>',
    '              <div style={{ fontSize: 12, color: "#888", textAlign: "center", marginBottom: 24 }}>',
    '                {[data.basic.age && `${data.basic.age}歳`, data.basic.gender, data.basic.station && `最寄：${data.basic.station}`].filter(Boolean).join("　｜　")}',
    '              </div>',
    '              <hr style={{ border: "none", borderTop: "2px solid #e85d26", marginBottom: 20 }} />',
])
new3 = nl.join([
    '            {/* プレビュー */}',
    '            <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", marginBottom: 16 }}>',
    '              <div style={{ background: "#1a1a2e", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>',
    '                <div>',
    '                  <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{outputMode === "skill" ? "SKILL SHEET" : outputMode === "agent" ? "CAREER SUMMARY" : "CURRICULUM VITAE"}</div>',
    '                  <div style={{ fontSize: 26, fontWeight: 500, color: "#fff", marginBottom: 3 }}>{data.basic.name || "（氏名未入力）"}</div>',
    '                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{[data.basic.age && `${data.basic.age}歳`, data.basic.gender, data.basic.station && `${data.basic.station}（${data.basic.line}）`].filter(Boolean).join("　｜　")}</div>',
    '                </div>',
    '                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>',
    '                  {data.working.jobType.slice(0, 3).map((jt: string) => (<span key={jt} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, border: "0.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.65)" }}>{jt}</span>))}',
    '                </div>',
    '              </div>',
    '              <div style={{ height: 4, background: "linear-gradient(90deg, #e85d26 0%, #f59e0b 100%)" }} />',
    '              <div style={{ display: "flex" }}>',
    '                <div style={{ width: 190, flexShrink: 0, background: "#f9f8f6", padding: "24px 16px", borderRight: "0.5px solid #ece9e3" }}>',
    '                  <div style={{ marginBottom: 20 }}>',
    '                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "#e85d26", marginBottom: 8 }}>基本情報</div>',
    '                    {data.basic.education && <div style={{ fontSize: 10, color: "#555", lineHeight: 1.7, marginBottom: 2 }}>{data.basic.education}</div>}',
    '                    {(data.working.rateMin || data.working.rateMax) && <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>単価：{data.working.rateMin}〜{data.working.rateMax}円</div>}',
    '                    {data.working.daysPerWeek && <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>稼働：{data.working.daysPerWeek}</div>}',
    '                    {data.working.remote && <div style={{ fontSize: 10, color: "#555" }}>{data.working.remote}</div>}',
    '                  </div>',
    '                  {(data.tech.language.length > 0 || data.tech.framework.length > 0) && (',
    '                    <div style={{ marginBottom: 20 }}>',
    '                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "#e85d26", marginBottom: 8 }}>技術スタック</div>',
    '                      <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>',
    '                        {[...data.tech.language, ...data.tech.framework, ...data.tech.db, ...data.tech.cloud].filter(Boolean).map((sk: string) => (',
    '                          <span key={sk} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#fff3ee", border: "0.5px solid #ffd0c0", color: "#c0440e" }}>{sk}</span>',
    '                        ))}',
    '                      </div>',
    '                    </div>',
    '                  )}',
    '                  {data.basic.certifications && (',
    '                    <div>',
    '                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "#e85d26", marginBottom: 8 }}>資格</div>',
    '                      {data.basic.certifications.split(/[、,\\n]/).filter(Boolean).map((c: string) => (',
    '                        <div key={c} style={{ fontSize: 10, color: "#555", padding: "3px 0", borderBottom: "0.5px solid #f0ede8" }}>{c.trim()}</div>',
    '                      ))}',
    '                    </div>',
    '                  )}',
    '                </div>',
    '                <div style={{ flex: 1, padding: "24px 24px", minWidth: 0 }}>',
])
if old3 in c:
    c = c.replace(old3, new3)
    print('3. preview header: OK')
else:
    print('3. preview header: NOT FOUND')

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
