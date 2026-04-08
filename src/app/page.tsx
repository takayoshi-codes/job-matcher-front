"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { JobInput, CareerInput, MatchResult } from "@/types";
import ScoreGauge from "@/components/ScoreGauge";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY = "career_builder_data";

const emptyJob: JobInput = { title: "", required_skills: [], preferred_skills: [], description: "" };
const emptyCareer: CareerInput = { name: "", skills: "", summary_consulting: "", summary_management: "", summary_it: "", projects: "" };

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", background: "#f5f5f0" },
  header: { background: "#fff", borderBottom: "1px solid #ece9e3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 900, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, background: "#e85d26", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 },
  logoTitle: { fontSize: 16, fontWeight: 700, color: "#1a1a1a" },
  logoSub: { fontSize: 10, color: "#aaa" },
  main: { maxWidth: 900, margin: "0 auto", padding: "24px 20px 60px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
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
  uploaderArea: { border: "2px dashed #e0ddd8", borderRadius: 8, padding: "20px", textAlign: "center" as const, cursor: "pointer", background: "#f9f8f6", transition: "border-color 0.2s" },
  loadedBanner: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" },
};

export default function Home() {
  const router = useRouter();
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

  // 起動時にlocalStorageからCareer Builderのデータを読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored);
      const loaded: CareerInput = {
        name: data.basic?.name ?? "",
        skills: [
          data.tech?.language, data.tech?.framework, data.tech?.db,
          data.tech?.cloud, data.tech?.ai, data.tech?.tools,
        ].flat().filter(Boolean).join("、"),
        summary_consulting: data.summary?.consulting ?? "",
        summary_management: data.summary?.management ?? "",
        summary_it: data.summary?.it ?? "",
        projects: (data.projects ?? [])
          .map((p: any) => [p.title, p.overview, p.work].filter(Boolean).join(" "))
          .join(" "),
      };
      if (loaded.name || loaded.skills) {
        setCareer(loaded);
        setLoadedFromStorage(true);
      }
    } catch { /* 無視 */ }
  }, []);

  const addSkill = (type: "required" | "preferred", value: string) => {
    const v = value.trim();
    if (!v) return;
    const tags = v.split(/[,、\s]+/).filter(Boolean);
    setJob(prev => ({
      ...prev,
      [type === "required" ? "required_skills" : "preferred_skills"]: [
        ...prev[type === "required" ? "required_skills" : "preferred_skills"],
        ...tags,
      ],
    }));
    type === "required" ? setReqSkillInput("") : setPrefSkillInput("");
  };

  const removeSkill = (type: "required" | "preferred", i: number) => {
    const key = type === "required" ? "required_skills" : "preferred_skills";
    setJob(prev => ({ ...prev, [key]: prev[key].filter((_, j) => j !== i) }));
  };

  const handleCSV = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`/api/parse-csv`, { method: "POST", body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCareer(data);
      setLoadedFromStorage(false);
    } catch (e: any) {
      setError(`CSV読み込みエラー: ${e.message}`);
    }
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) await handleCSV(file);
  };

  const handleMatch = async () => {
    if (!job.title && !job.description) { setError("求人情報を入力してください"); return; }
    if (!career.skills && !career.summary_it) { setError("職務経歴を入力してください"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job, career }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: MatchResult = await res.json();
      setResult(data);
      setStep("result");
    } catch (e: any) {
      setError(`エラー: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearStorageData = () => {
    setCareer(emptyCareer);
    setLoadedFromStorage(false);
  };

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}>M</div>
            <div>
              <div style={s.logoTitle}>求人マッチング診断</div>
              <div style={s.logoSub}>Job Matching Analyzer</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              style={{ ...s.btn, ...s.btnGhost, padding: "8px 16px", fontSize: 13 }}
              onClick={() => router.push("/career")}
            >
              ✍️ Career Builder
            </button>
            {step === "result" && (
              <button style={{ ...s.btn, ...s.btnGhost, padding: "8px 16px", fontSize: 13 }} onClick={() => { setStep("input"); setResult(null); }}>
                ← 診断をやり直す
              </button>
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

            {/* Career Builderからデータ読み込み済みバナー */}
            {loadedFromStorage && (
              <div style={s.loadedBanner}>
                <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
                  ✓ Career Builder のデータを自動読み込みしました（{career.name}）
                </div>
                <button style={{ ...s.btn, ...s.btnGhost, padding: "6px 12px", fontSize: 12 }} onClick={clearStorageData}>
                  クリア
                </button>
              </div>
            )}

            <div style={s.grid}>
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
                    {job.required_skills.map((sk, i) => (
                      <span key={i} style={s.tag} onClick={() => removeSkill("required", i)} title="クリックで削除">{sk} ×</span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>歓迎スキル</label>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <input style={{ ...s.inp, flex: 1 }} placeholder="例：AWS, Docker（Enterで追加）" value={prefSkillInput} onChange={e => setPrefSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("preferred", prefSkillInput); } }} />
                    <button style={{ ...s.btn, ...s.btnGhost, padding: "10px 14px", fontSize: 13 }} onClick={() => addSkill("preferred", prefSkillInput)}>追加</button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {job.preferred_skills.map((sk, i) => (
                      <span key={i} style={{ ...s.tag, background: "#f5f5f0", color: "#888", border: "1px solid #e0ddd8" }} onClick={() => removeSkill("preferred", i)} title="クリックで削除">{sk} ×</span>
                    ))}
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
                <div style={s.cardDesc}>
                  {loadedFromStorage ? "Career Builderのデータを読み込み済みです" : "Career BuilderのCSVをアップロード、または手入力"}
                </div>

                {/* Career Builderへのリンク */}
                {!loadedFromStorage && (
                  <button
                    style={{ ...s.btn, background: "#1a1a1a", color: "#fff", width: "100%", marginBottom: 12, fontSize: 13 }}
                    onClick={() => router.push("/career")}
                  >
                    ✍️ Career Builder で入力する →
                  </button>
                )}

                {/* CSVアップロード */}
                <div
                  style={{ ...s.uploaderArea, borderColor: dragging ? "#e85d26" : "#e0ddd8", marginBottom: 14 }}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileRef.current?.click()}
                >
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
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ textAlign: "center" }}>
              <button style={{ ...s.btn, ...s.btnPrimary, minWidth: 240, opacity: loading ? 0.7 : 1 }} onClick={handleMatch} disabled={loading}>
                {loading ? "診断中..." : "🔍　マッチング診断を実行"}
              </button>
              {loading && <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>Gemini APIでベクトル化・類似度計算中です（5〜15秒程度）</div>}
            </div>
          </>
        )}

        {/* 結果表示 */}
        {step === "result" && result && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>診断結果</h1>
              {career.name && <p style={{ fontSize: 13, color: "#888" }}>{career.name} さん × {job.title || "求人票"}</p>}
            </div>

            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={s.cardTitle}><div style={s.cardTitleBar} />マッチングスコア</div>
              <div style={s.cardDesc}>数値が高いほど求人との適合度が高いことを示します</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 48, flexWrap: "wrap" }}>
                <ScoreGauge score={result.score_sbert} label="類似度スコア" />
                <ScoreGauge score={Math.max(0, 1 - result.missing_skills.length * 0.12)} label="スキルカバー率" color="#7c3aed" />
              </div>
            </div>

            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={s.cardTitle}><div style={s.cardTitleBar} />不足スキル</div>
              <div style={s.cardDesc}>求人が求めるスキルのうち、職務経歴に見当たらないもの</div>
              {result.missing_skills.length === 0
                ? <div style={{ color: "#16a34a", fontWeight: 600 }}>✓ 不足スキルは検出されませんでした</div>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{result.missing_skills.map((sk, i) => <span key={i} style={s.tagMissing}>⚠ {sk}</span>)}</div>
              }
            </div>

            <div style={{ ...s.card, marginBottom: 16 }}>
              <div style={s.cardTitle}><div style={s.cardTitleBar} />AIによる改善アドバイス</div>
              <div style={s.cardDesc}>Gemini APIが職務経歴と求人を分析して生成したアドバイスです</div>
              <div style={s.advice}>{result.advice}</div>
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => { setStep("input"); setResult(null); }}>別の求人で診断</button>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => router.push("/career")}>✍️ Career Builderに戻る</button>
              <button style={{ ...s.btn, ...s.btnGhost }} onClick={() => window.print()}>🖨 印刷・PDF</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
