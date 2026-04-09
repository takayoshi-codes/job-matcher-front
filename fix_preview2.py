import sys

with open(sys.argv[1], encoding='utf-8') as f:
    c = f.read()

nl = '\r\n' if '\r\n' in c else '\n'

# 1. 職務経歴をタイムライン形式に変更
old1 = nl.join([
    '              {outputMode !== "skill" && data.projects.some(p => p.title) && (',
    '                <div style={{ marginBottom: 20 }}>',
    '                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>職務経歴</div>',
    '                  {data.projects.filter(p => p.title).map((p, i) => (',
    '                    <div key={i} style={{ background: "#f9f8f6", border: "1px solid #ede9e3", borderRadius: 8, padding: 16, marginBottom: 12 }}>',
    '                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{p.title}</div>',
    '                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#888", marginBottom: 8, flexWrap: "wrap" }}>',
    '                        {p.from && <span>📅 {p.from} 〜 {p.present ? "現在" : p.to}</span>}',
    '                        {p.position && <span>👤 {p.position}</span>}',
    '                        {p.scale && <span>👥 {p.scale}</span>}',
    '                      </div>',
    '                      {p.overview && <div style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.8 }}>{p.overview}</div>}',
    '                      {p.phase.length > 0 && <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>担当フェーズ：{p.phase.join("　/　")}</div>}',
    '                      {p.work && <div style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{p.work}</div>}',
    '                      {p.env && <div style={{ fontSize: 12, color: "#777", background: "#f0ede8", padding: "8px 12px", borderRadius: 6, whiteSpace: "pre-wrap", marginTop: 8 }}>{p.env}</div>}',
    '                    </div>',
    '                  ))}',
    '                </div>',
    '              )}',
])
new1 = nl.join([
    '              {outputMode !== "skill" && data.projects.some(p => p.title) && (',
    '                <div style={{ marginBottom: 20 }}>',
    '                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#e85d26", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>職務経歴<div style={{ flex: 1, height: 1, background: "#f0ede8" }} /></div>',
    '                  <div style={{ position: "relative", paddingLeft: 20 }}>',
    '                    <div style={{ position: "absolute", left: 6, top: 6, bottom: 0, width: 1, background: "#ece9e3" }} />',
    '                    {data.projects.filter(p => p.title).map((p, i) => (',
    '                      <div key={i} style={{ position: "relative", marginBottom: 16 }}>',
    '                        <div style={{ position: "absolute", left: -20, top: 5, width: 12, height: 12, borderRadius: "50%", background: "#fff", border: "2px solid #e85d26" }} />',
    '                        <div style={{ fontSize: 10, color: "#e85d26", fontWeight: 600, marginBottom: 2 }}>{p.from} 〜 {p.present ? "現在" : p.to}{p.position && <span style={{ marginLeft: 8, color: "#888", fontWeight: 400 }}>{p.position}</span>}</div>',
    '                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>{p.title}</div>',
    '                        {p.overview && <div style={{ fontSize: 11, color: "#666", lineHeight: 1.7, marginBottom: 4 }}>{p.overview}</div>}',
    '                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 4 }}>',
    '                          {Array.isArray(p.phase) && p.phase.map((ph: string) => (<span key={ph} style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "#f0ede8", color: "#666", border: "0.5px solid #e0ddd8" }}>{ph}</span>))}',
    '                          {p.scale && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 3, background: "#f0ede8", color: "#666", border: "0.5px solid #e0ddd8" }}>{p.scale}</span>}',
    '                        </div>',
    '                        {p.env && <div style={{ fontSize: 10, color: "#777", background: "#f5f3ef", padding: "5px 10px", borderRadius: 4, marginTop: 2 }}>{p.env}</div>}',
    '                      </div>',
    '                    ))}',
    '                  </div>',
    '                </div>',
    '              )}',
])

if old1 in c:
    c = c.replace(old1, new1)
    print('1. timeline: OK')
else:
    print('1. timeline: NOT FOUND')

# 2. 稼働条件と閉じタグ修正
old2 = nl.join([
    '              {(outputMode === "full" || outputMode === "agent") && (',
    '                <div>',
    '                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>稼働条件</div>',
    '                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>',
    '                    <tbody>',
    '                      {[["希望単価", (data.working.rateMin || data.working.rateMax) ? `${data.working.rateMin ? data.working.rateMin + "円" : ""}〜${data.working.rateMax ? data.working.rateMax + "円" : ""}（${data.working.rateUnit}）` : ""],["稼働日数",data.working.daysPerWeek],["稼働時間",data.working.hoursPerDay],["稼働曜日",data.working.weekdays.join("、")],["リモート",data.working.remote],["勤務エリア",data.working.location],["参画可能時期",data.working.available],["希望職種",data.working.jobType.join("　/　")]]',
    '                        .filter(([,v]) => v)',
    '                        .map(([l,v]) => (',
    '                          <tr key={l} style={{ borderBottom: "1px solid #f5f3ef" }}>',
    '                            <td style={{ padding: "7px 10px", fontWeight: 600, color: "#666", width: 110 }}>{l}</td>',
    '                            <td style={{ padding: "7px 10px" }}>{v}</td>',
    '                          </tr>',
    '                        ))}',
    '                    </tbody>',
    '                  </table>',
    '                </div>',
    '              )}',
    '            </div>',
])
new2 = nl.join([
    '              {(outputMode === "full" || outputMode === "agent") && (',
    '                <div style={{ marginBottom: 8 }}>',
    '                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#e85d26", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>稼働条件<div style={{ flex: 1, height: 1, background: "#f0ede8" }} /></div>',
    '                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>',
    '                    <tbody>',
    '                      {[["希望単価", (data.working.rateMin || data.working.rateMax) ? `${data.working.rateMin ? data.working.rateMin + "円" : ""}〜${data.working.rateMax ? data.working.rateMax + "円" : ""}（${data.working.rateUnit}）` : ""],["稼働日数",data.working.daysPerWeek],["稼働曜日",Array.isArray(data.working.weekdays) ? data.working.weekdays.join("・") : ""],["リモート",data.working.remote],["勤務エリア",data.working.location],["参画可能時期",data.working.available],["希望職種",Array.isArray(data.working.jobType) ? data.working.jobType.join(" / ") : ""]]',
    '                        .filter(([,v]) => v)',
    '                        .map(([l,v]) => (',
    '                          <tr key={l} style={{ borderBottom: "0.5px solid #f5f3ef" }}>',
    '                            <td style={{ padding: "5px 8px", color: "#888", width: 90, fontSize: 11 }}>{l}</td>',
    '                            <td style={{ padding: "5px 8px", color: "#333" }}>{v}</td>',
    '                          </tr>',
    '                        ))}',
    '                    </tbody>',
    '                  </table>',
    '                </div>',
    '              )}',
    '                </div>',
    '              </div>',
    '            </div>',
])

if old2 in c:
    c = c.replace(old2, new2)
    print('2. working conditions: OK')
else:
    print('2. working conditions: NOT FOUND')

with open(sys.argv[1], 'w', encoding='utf-8') as f:
    f.write(c)
print('saved')
