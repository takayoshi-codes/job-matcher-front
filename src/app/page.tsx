"use client";

import { useState, useRef, useEffect } from "react";
import type { JobInput, CareerInput, MatchResult } from "@/types";
import ScoreGauge from "@/components/ScoreGauge";

const STORAGE_KEY = "career_builder_data";

const emptyJob: JobInput = { title: "", required_skills: [], preferred_skills: [], description: "" };
const emptyCareer: CareerInput = { name: "", skills: "", summary_consulting: "", summary_management: "", summary_it: "", projects: "" };

const JOB_SITES = [
  {
    category: "副業・フリーランス向け",
    color: "#e85d26",
    sites: [
      { name: "シューマツワーカー", desc: "週1〜3日の副業特化", url: "https://shuuumatu-worker.jp/", tag: "副業", searchUrl: (kw: string) => `https://shuuumatu-worker.jp/projects?keyword=${encodeURIComponent(kw)}` },
      { name: "クラウドワークス", desc: "国内最大のクラウドソーシング", url: "https://crowdworks.jp/", tag: "副業", searchUrl: (kw: string) => `https://crowdworks.jp/public/jobs/search?keyword=${encodeURIComponent(kw)}` },
      { name: "ランサーズ", desc: "幅広い職種・スキル案件", url: "https://www.lancers.jp/", tag: "副業", searchUrl: (kw: string) => `https://www.lancers.jp/work/search?keyword=${encodeURIComponent(kw)}` },
      { name: "Workship", desc: "週1〜副業・フリーランス", url: "https://goworkship.com/", tag: "副業", searchUrl: (kw: string) => `https://goworkship.com/magazine/?s=${encodeURIComponent(kw)}` },
      { name: "Offers", desc: "エンジニア副業・転職特化", url: "https://offers.jp/", tag: "副業", searchUrl: (kw: string) => `https://offers.jp/jobs?keyword=${encodeURIComponent(kw)}` },
    ],
  },
  {
    category: "フリーランスエージェント",
    color: "#7c3aed",
    sites: [
      { name: "レバテックフリーランス", desc: "高単価・直請け案件多数", url: "https://freelance.levtech.jp/", tag: "エージェント", searchUrl: (kw: string) => `https://freelance.levtech.jp/project/search/?keyword=${encodeURIComponent(kw)}` },
      { name: "ギークスジョブ", desc: "リモート案件80%・福利厚生あり", url: "https://geechs-job.com/", tag: "エージェント", searchUrl: (kw: string) => `https://geechs-job.com/search?keyword=${encodeURIComponent(kw)}` },
      { name: "ITプロパートナーズ", desc: "週2〜3日の案件が豊富", url: "https://itpropartners.com/", tag: "エージェント", searchUrl: (kw: string) => `https://itpropartners.com/projects?search=${encodeURIComponent(kw)}` },
      { name: "テックストック", desc: "上流・高単価案件特化", url: "https://tech-stock.com/", tag: "エージェント", searchUrl: (kw: string) => `https://tech-stock.com/projects?keyword=${encodeURIComponent(kw)}` },
      { name: "フリーランススタート", desc: "複数エージェントを一括比較", url: "https://freelance-start.com/", tag: "比較", searchUrl: (kw: string) => `https://freelance-start.com/jobs?keyword=${encodeURIComponent(kw)}` },
    ],
  },
];

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", background: "#f5f5f0" },
  header: { background: "#fff", borderBottom: "1px solid #ece9e3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1200, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, background: "#e85d26", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 },
  main: { maxWidth: 1200, margin: "0 auto", padding: "24px 20px 60px" },
  card: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f0ede8" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 },
  cardTitleBar: { width: 4, height: 18, background: "#e85d26", borderRadius: 2 },
  cardDesc: { fontSize: 12, color: "#aaa", marginBottom: 16, paddingLeft: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" },
  inp: { width: "100%", border: "1.5px solid #e0ddd8", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none", fontFamily: "inherit", resize: "vertical" as const },
  hint: { fontSize: 11, color: "#bbb", marginBottom: 6 },
  btn: { padding: "12px 32px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit", transition: "all 0.18s" },
  btnPrimary: { background: "#e85d26", color: "#fff" },
  btnGhost: { background: "#fff", color: "#555", border: "1.5px solid #e0ddd8" },
  tag: { display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: "#fff3ee", color: "#e85d26", border: "1px solid #ffd0c0" },
  tagMissing: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  advice: { background: "#f9f8f6", border: "1px solid #ede9e3", borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 2, whiteSpace: "pre-wrap" as const },
  uploaderArea: { border: "2px dashed #e0ddd8", borderRadius: 8, padding: "16px", textAlign: "center" as const, cursor: "pointer", background: "#f9f8f6", transition: "border-color 0.2s", marginBottom: 14 },
  loadedBanner: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" },
};

function SearchLinksPanel({ keywords }: { keywords: string[] }) {
  if (!keywords || keywords.length === 0) return <JobSitesPanel />;
  const allSites = JOB_SITES.flatMap(g => g.sites.map(s => ({ ...s, color: g.color })));
  return (
    <div style={{ ...s.card, height: "fit-content", position: "sticky", top: 80 }}>
      <div style={s.cardTitle}><div style={s.cardTitleBar} />この求人で検索する</div>
      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 16, paddingLeft: 12 }}>
        AIが生成したキーワードで各サイトを検索できます
      </div>

      {/* キーワードタグ */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
        {keywords.map((kw, i) => (
          <span key={i} style={{ padding: "4px 12px", borderRadius: 20, background: "#fff3ee", border: "1px solid #ffd0c0", fontSize: 12, fontWeight: 600, color: "#e85d26" }}>
            🔍 {kw}
          </span>
        ))}
      </div>

      {/* 各サイトへの検索リンク */}
      {JOB_SITES.map((group) => (
        <div key={group.category} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: group.color, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {group.category}
            <div style={{ flex: 1, height: 1, background: "#f0ede8" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {group.sites.map((site) => {
              const keyword = keywords[0] ?? "";
              return (
                <a key={site.name} href={site.searchUrl(keyword)} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#f9f8f6", borderRadius: 8, border: "1px solid #ede9e3", textDecoration: "none", transition: "all 0.15s", gap: 6 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fff3ee"; (e.currentTarget as HTMLElement).style.borderColor = "#ffd0c0"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#f9f8f6"; (e.currentTarget as HTMLElement).style.borderColor = "#ede9e3"; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 1 }}>{site.name}</div>
                    <div style={{ fontSize: 10, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>「{keyword}」で検索</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: group.color + "18", color: group.color, flexShrink: 0 }}>検索 ↗</span>
                </a>
              );
            })}
          </div>
        </div>
      ))}

      {/* キーワード別に切り替え */}
      {keywords.length > 1 && (
        <div style={{ marginTop: 8, padding: "10px 12px", background: "#f9f8f6", borderRadius: 8, fontSize: 11, color: "#888" }}>
          💡 他のキーワードでも検索してみましょう
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
            {keywords.slice(1).map((kw, i) => (
              <a key={i} href={JOB_SITES[0].sites[0].searchUrl(kw)} target="_blank" rel="noopener noreferrer"
                style={{ padding: "3px 10px", borderRadius: 20, background: "#fff", border: "1px solid #e0ddd8", fontSize: 11, color: "#555", textDecoration: "none" }}>
                {kw} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JobSitesPanel() {
  const allSiteNames = JOB_SITES.flatMap(g => g.sites.map(s => s.name));
  const [checked, setChecked] = useState<string[]>(allSiteNames);

  const toggle = (name: string) =>
    setChecked(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);
  const toggleAll = () => setChecked(prev => prev.length === allSiteNames.length ? [] : allSiteNames);

  return (
    <div style={{ ...s.card, height: "fit-content", position: "sticky", top: 80 }}>
      <div style={s.cardTitle}><div style={s.cardTitleBar} />求人サイト一覧</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingLeft: 12 }}>
        <span style={{ fontSize: 11, color: "#aaa" }}>表示するサイトを選択</span>
        <button
          onClick={toggleAll}
          style={{ fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #e0ddd8", background: "#fff", cursor: "pointer", color: "#666" }}
        >
          {checked.length === allSiteNames.length ? "すべて解除" : "すべて選択"}
        </button>
      </div>
      {JOB_SITES.map((group) => (
        <div key={group.category} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: group.color, letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {group.category}
            <div style={{ flex: 1, height: 1, background: "#f0ede8" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {group.sites.map((site) => {
              const isChecked = checked.includes(site.name);
              return (
                <div key={site.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(site.name)}
                    style={{ flexShrink: 0, width: 14, height: 14, accentColor: "#e85d26", cursor: "pointer" }}
                  />
                  <a href={site.url} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", background: isChecked ? "#f9f8f6" : "#f5f5f5", borderRadius: 8, border: `1px solid ${isChecked ? "#ede9e3" : "#e8e8e8"}`, textDecoration: "none", transition: "all 0.15s", gap: 6, opacity: isChecked ? 1 : 0.4 }}
                    onMouseEnter={e => { if (isChecked) { (e.currentTarget as HTMLElement).style.background = "#fff3ee"; (e.currentTarget as HTMLElement).style.borderColor = "#ffd0c0"; } }}
                    onMouseLeave={e => { if (isChecked) { (e.currentTarget as HTMLElement).style.background = "#f9f8f6"; (e.currentTarget as HTMLElement).style.borderColor = "#ede9e3"; } }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a1a", marginBottom: 1 }}>{site.name}</div>
                      <div style={{ fontSize: 10, color: "#888" }}>{site.desc}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: group.color + "18", color: group.color }}>{site.tag}</span>
                      <span style={{ color: "#bbb", fontSize: 11 }}>↗</span>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {checked.length > 0 && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#fff3ee", borderRadius: 8, fontSize: 11, color: "#e85d26", fontWeight: 600 }}>
          {checked.length}サイトを表示中
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState<"input" | "result">("input");
  const [job, setJob] = useState<JobInput>(emptyJob);
  const [career, setCareer] = useState<CareerInput>(emptyCareer);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reqSkillInput, setReqSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored);
      const loaded: CareerInput = {
        name: data.basic?.name ?? "",
        skills: [data.tech?.language, data.tech?.framework, data.tech?.db, data.tech?.cloud, data.tech?.ai, data.tech?.tools].flat().filter(Boolean).join("、"),
        summary_consulting: data.summary?.consulting ?? "",
        summary_management: data.summary?.management ?? "",
        summary_it: data.summary?.it ?? "",
        projects: (data.projects ?? []).map((p: any) => [p.title, p.overview, p.work].filter(Boolean).join(" ")).join(" "),
      };
      if (loaded.name || loaded.skills) { setCareer(loaded); setLoadedFromStorage(true); }
    } catch { /* 無視 */ }
  }, []);

  const addSkill = (type: "required" | "preferred", value: string) => {
    const v = value.trim(); if (!v) return;
    const tags = v.split(/[,、\s]+/).filter(Boolean);
    setJob(prev => ({ ...prev, [type === "required" ? "required_skills" : "preferred_skills"]: [...prev[type === "required" ? "required_skills" : "preferred_skills"], ...tags] }));
    type === "required" ? setReqSkillInput("") : setPrefSkillInput("");
  };

  const removeSkill = (type: "required" | "preferred", i: number) => {
    const key = type === "required" ? "required_skills" : "preferred_skills";
    setJob(prev => ({ ...prev, [key]: prev[key].filter((_, j) => j !== i) }));
  };

  const handleCSV = async (file: File) => {
    const form = new FormData(); form.append("file", file);
    try {
      const res = await fetch(`/api/parse-csv`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      setCareer(await res.json()); setLoadedFromStorage(false);
    } catch (e: any) { setError(`CSV読み込みエラー: ${e.message}`); }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) await handleCSV(file);
  };

  const handleMatch = async () => {
    if (!job.title && !job.description) { setError("求人情報を入力してください"); return; }
    if (!career.skills && !career.summary_it) { setError("職務経歴を入力してください"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`/api/match`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job, career }) });
      if (!res.ok) throw new Error(await res.text());
      setResult(await res.json()); setStep("result");
    } catch (e: any) { setError(`エラー: ${e.message}`); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}>M</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>求人マッチング診断</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>Job Matching Analyzer</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/career" style={{ ...s.btn, ...s.btnGhost, padding: "8px 16px", fontSize: 13, textDecoration: "none" }}>✍️ Career Builder</a>
            {step === "result" && (
              <button style={{ ...s.btn, ...s.btnGhost, padding: "8px 16px", fontSize: 13 }} onClick={() => { setStep("input"); setResult(null); }}>← 診断をやり直す</button>
            )}
          </div>
        </div>
      </div>

      <div style={s.main}>
        {step === "input" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>求人票 × 職務経歴書 マッチング診断</h1>
              <p style={{ fontSize: 13, color: "#888" }}>求人情報と職務経歴を入力して、AIがマッチングスコアと改善アドバイスを生成します</p>
            </div>

            {loadedFromStorage && (
              <div style={s.loadedBanner}>
                <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ Career Builder のデータを自動読み込みしました（{career.name}）</div>
                <button style={{ ...s.btn, ...s.btnGhost, padding: "6px 12px", fontSize: 12 }} onClick={() => { setCareer(emptyCareer); setLoadedFromStorage(false); }}>クリア</button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: 16, marginBottom: 16 }}>
              {/* 求人票 */}
              <div style={s.card}>
                <div style={s.cardTitle}><div style={s.cardTitleBar} />求人票</div>
                <div style={s.cardDesc}>応募したい求人の情報を入力してください</div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>求人タイトル</label>
                  <input style={s.inp} placeholder="例：AIエンジニア（副業・週2日〜）" value={job.title} onChange={e => setJob(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>必須スキル</label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <input style={{ ...s.inp, flex: 1 }} placeholder="例：Python, Django（Enterで追加）" value={reqSkillInput} onChange={e => setReqSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("required", reqSkillInput); } }} />
                    <button style={{ ...s.btn, ...s.btnPrimary, padding: "10px 14px", fontSize: 13 }} onClick={() => addSkill("required", reqSkillInput)}>追加</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {job.required_skills.map((sk, i) => <span key={i} style={s.tag} onClick={() => removeSkill("required", i)} title="クリックで削除">{sk} ×</span>)}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>歓迎スキル</label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <input style={{ ...s.inp, flex: 1 }} placeholder="例：AWS, Docker（Enterで追加）" value={prefSkillInput} onChange={e => setPrefSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("preferred", prefSkillInput); } }} />
                    <button style={{ ...s.btn, ...s.btnGhost, padding: "10px 14px", fontSize: 13 }} onClick={() => addSkill("preferred", prefSkillInput)}>追加</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {job.preferred_skills.map((sk, i) => <span key={i} style={{ ...s.tag, background: "#f5f5f0", color: "#888", border: "1px solid #e0ddd8" }} onClick={() => removeSkill("preferred", i)} title="クリックで削除">{sk} ×</span>)}
                  </div>
                </div>
                <div>
                  <label style={s.label}>業務内容・求人詳細</label>
                  <div style={s.hint}>求人票の本文をそのまま貼り付けてください（精度が上がります）</div>
                  <textarea style={{ ...s.inp, minHeight: 140 }} placeholder="業務内容・求める人物像などを貼り付け..." value={job.description} onChange={e => setJob(p => ({ ...p, description: e.target.value }))} />
                </div>
              </div>

              {/* 職務経歴 */}
              <div style={s.card}>
                <div style={s.cardTitle}><div style={s.cardTitleBar} />職務経歴書</div>
                <div style={s.cardDesc}>{loadedFromStorage ? "Career Builderのデータを読み込み済みです" : "Career BuilderのCSVをアップロード、または手入力"}</div>
                {!loadedFromStorage && (
                  <a href="/career" style={{ ...s.btn, background: "#1a1a1a", color: "#fff", width: "100%", marginBottom: 12, fontSize: 13, textDecoration: "none", display: "block", textAlign: "center" as const }}>
                    ✍️ Career Builder で入力する →
                  </a>
                )}
                <div style={{ ...s.uploaderArea, borderColor: dragging ? "#e85d26" : "#e0ddd8" }}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => fileRef.current?.click()}>
                  <input ref={fileRef} type="file" accept=".csv" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleCSV(f); }} />
                  <div style={{ fontSize: 20, marginBottom: 4 }}>📥</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>CSVをドロップ</div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>またはクリックして選択</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>技術スタック</label>
                  <textarea style={{ ...s.inp, minHeight: 60 }} placeholder="例：Python, Django, Next.js, PostgreSQL, AWS" value={career.skills} onChange={e => setCareer(p => ({ ...p, skills: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>ITスキルサマリ</label>
                  <textarea style={{ ...s.inp, minHeight: 80 }} placeholder="開発フェーズ経験・業界知見・得意技術など" value={career.summary_it} onChange={e => setCareer(p => ({ ...p, summary_it: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>コンサルティング・マネジメントスキル</label>
                  <textarea style={{ ...s.inp, minHeight: 60 }} placeholder="顧客折衝・PM経験など" value={career.summary_consulting} onChange={e => setCareer(p => ({ ...p, summary_consulting: e.target.value }))} />
                </div>
                <div>
                  <label style={s.label}>職務経歴（案件概要・業務内容）</label>
                  <textarea style={{ ...s.inp, minHeight: 80 }} placeholder="主な案件・担当業務の概要" value={career.projects} onChange={e => setCareer(p => ({ ...p, projects: e.target.value }))} />
                </div>
              </div>

              {/* 求人サイト */}
              <JobSitesPanel />
            </div>

            {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</div>}
            <div style={{ textAlign: "center" }}>
              <button style={{ ...s.btn, ...s.btnPrimary, minWidth: 240, opacity: loading ? 0.7 : 1 }} onClick={handleMatch} disabled={loading}>
                {loading ? "診断中..." : "🔍　マッチング診断を実行"}
              </button>
              {loading && <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Gemini APIで分析中です（10〜20秒程度）</div>}
            </div>
          </>
        )}

        {step === "result" && result && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>診断結果</h1>
              {career.name && <p style={{ fontSize: 13, color: "#888" }}>{career.name} さん × {job.title || "求人票"}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: 16, alignItems: "start" }}>
              <div>
                <div style={{ ...s.card, marginBottom: 16 }}>
                  <div style={s.cardTitle}><div style={s.cardTitleBar} />マッチングスコア</div>
                  <div style={s.cardDesc}>数値が高いほど求人との適合度が高いことを示します</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
                    <ScoreGauge score={result.score_sbert} label="類似度スコア" />
                    <ScoreGauge score={Math.max(0, 1 - result.missing_skills.length * 0.12)} label="スキルカバー率" color="#7c3aed" />
                  </div>
                </div>
                <div style={s.card}>
                  <div style={s.cardTitle}><div style={s.cardTitleBar} />不足スキル</div>
                  <div style={s.cardDesc}>求人が求めるスキルのうち、職務経歴に見当たらないもの</div>
                  {result.missing_skills.length === 0
                    ? <div style={{ color: "#16a34a", fontWeight: 600 }}>✓ 不足スキルは検出されませんでした</div>
                    : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{result.missing_skills.map((sk, i) => <span key={i} style={s.tagMissing}>⚠ {sk}</span>)}</div>
                  }
                </div>
              </div>

              <div>
                <div style={{ ...s.card, marginBottom: 16 }}>
                  <div style={s.cardTitle}><div style={s.cardTitleBar} />AIによる改善アドバイス</div>
                  <div style={s.cardDesc}>Gemini APIが職務経歴と求人を分析して生成したアドバイスです</div>
                  <div style={s.advice}>{result.advice}</div>
                </div>
                {result.job_suggestions && (
                  <div style={s.card}>
                    <div style={s.cardTitle}><div style={s.cardTitleBar} />応募可能な求人タイプ</div>
                    <div style={s.cardDesc}>あなたの経験・スキルから導き出した応募戦略です</div>
                    <div style={s.advice}>{result.job_suggestions}</div>
                  </div>
                )}
              </div>

              <JobSitesPanel />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setStep("input"); setResult(null); }}>別の求人で診断</button>
              <a href="/career" style={{ ...s.btn, ...s.btnGhost, textDecoration: "none" }}>✍️ Career Builderに戻る</a>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => window.print()}>🖨 印刷・PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
