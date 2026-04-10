"use client";

import { useState, useRef, useEffect } from "react";
import type { CareerInput, MatchResult } from "@/types";
import SiteNav from "@/components/SiteNav";

const STORAGE_KEY = "career_builder_data";

const emptyCareer: CareerInput = {
  name: "", skills: "", summary_consulting: "", summary_management: "", summary_it: "", projects: "",
};

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", background: "#f5f5f0" },
  main: { maxWidth: 860, margin: "0 auto", padding: "28px 20px 80px" },
  card: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f0ede8", marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 },
  cardTitleBar: { width: 4, height: 18, background: "#e85d26", borderRadius: 2 },
  cardDesc: { fontSize: 12, color: "#aaa", marginBottom: 16, paddingLeft: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" },
  inp: { width: "100%", border: "1.5px solid #e0ddd8", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none", fontFamily: "inherit", resize: "vertical" as const },
  btn: { padding: "10px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit", transition: "all 0.18s" },
  btnPrimary: { background: "#e85d26", color: "#fff" },
  btnGhost: { background: "#fff", color: "#555", border: "1.5px solid #e0ddd8" },
  tag: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 },
  loadedBanner: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" },
};

interface BulkResult {
  jobText: string;
  result: MatchResult | null;
  error: string | null;
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 0.7 ? { bg: "#f0fdf4", border: "#86efac", text: "#15803d", label: "高マッチ" }
    : score >= 0.5 ? { bg: "#fefce8", border: "#fde047", text: "#854d0e", label: "中マッチ" }
    : { bg: "#fef2f2", border: "#fca5a5", text: "#9f1239", label: "低マッチ" };
  const pct = Math.round(score * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: color.bg, border: `2px solid ${color.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: color.text, lineHeight: 1 }}>{pct}</span>
        <span style={{ fontSize: 9, fontWeight: 600, color: color.text }}>/ 100</span>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: color.text, background: color.bg, padding: "2px 8px", borderRadius: 99, border: `1px solid ${color.border}` }}>{color.label}</span>
    </div>
  );
}

function JobChip({ text, index, onRemove }: { text: string; index: number; onRemove: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const preview = text.split("\n")[0].slice(0, 80) + (text.length > 80 ? "…" : "");
  return (
    <div style={{ background: "#f9f8f6", border: "1px solid #ede9e3", borderRadius: 8, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#e85d26", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{index + 1}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#444", lineHeight: 1.6, wordBreak: "break-all" }}>{expanded ? text : preview}</p>
        {text.split("\n").length > 1 && (
          <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 4, background: "none", border: "none", padding: 0, fontSize: 11, color: "#aaa", cursor: "pointer", textDecoration: "underline" }}>
            {expanded ? "折りたたむ" : `全文を表示 (${text.split("\n").length}行)`}
          </button>
        )}
      </div>
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "#bbb", fontSize: 18, padding: "0 2px", flexShrink: 0, lineHeight: 1 }}>×</button>
    </div>
  );
}

function ResultCard({ item, index, rank }: { item: BulkResult; result?: MatchResult; index: number; rank: number }) {
  const [open, setOpen] = useState(rank === 1);
  const { result, error, jobText } = item;
  const preview = jobText.split("\n")[0].slice(0, 50) + (jobText.length > 50 ? "…" : "");

  if (error) {
    return (
      <div style={{ ...s.card, marginBottom: 10, borderColor: "#fecaca" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef2f2", border: "2px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>!</div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#9f1239" }}>求人 {index + 1} — 診断エラー</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  if (!result) return null;

  const score = result.score_sbert;
  const rankColor = rank === 1 ? { bg: "#fef9c3", text: "#713f12" } : rank === 2 ? { bg: "#f1f5f9", text: "#334155" } : { bg: "#f5f5f0", text: "#666" };

  return (
    <div style={{ ...s.card, marginBottom: 10, borderColor: rank === 1 ? "#86efac" : "#f0ede8", borderWidth: rank === 1 ? "1.5px" : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: rankColor.bg, color: rankColor.text, flexShrink: 0 }}>{rank}位</span>
        <ScoreCircle score={score} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>求人 {index + 1}：{preview}</p>
          {result.missing_skills.length > 0
            ? <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>不足スキル: {result.missing_skills.slice(0, 3).join(" / ")}{result.missing_skills.length > 3 ? " …" : ""}</p>
            : <p style={{ margin: "4px 0 0", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>✓ 不足スキルなし</p>
          }
        </div>
        <span style={{ color: "#bbb", fontSize: 14, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: 16, borderTop: "1px solid #f0ede8", paddingTop: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#15803d" }}>スキルカバー率</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#15803d" }}>
                {Math.round(Math.max(0, 1 - result.missing_skills.length * 0.12) * 100)}<span style={{ fontSize: 12, fontWeight: 500 }}>%</span>
              </p>
            </div>
            <div style={{ background: result.missing_skills.length === 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${result.missing_skills.length === 0 ? "#bbf7d0" : "#fecaca"}`, borderRadius: 8, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: result.missing_skills.length === 0 ? "#15803d" : "#9f1239" }}>不足スキル</p>
              {result.missing_skills.length === 0
                ? <p style={{ margin: 0, fontSize: 13, color: "#16a34a", fontWeight: 700 }}>✓ なし</p>
                : <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {result.missing_skills.map((sk, i) => <span key={i} style={{ ...s.tag, background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontSize: 11 }}>⚠ {sk}</span>)}
                  </div>
              }
            </div>
          </div>
          <div style={{ background: "#f9f8f6", border: "1px solid #ede9e3", borderRadius: 8, padding: 14, marginBottom: 12 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#555" }}>AIアドバイス</p>
            <p style={{ margin: 0, fontSize: 13, color: "#333", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{result.advice}</p>
          </div>
          {result.job_suggestions && (
            <div style={{ background: "#fff3ee", border: "1px solid #ffd0c0", borderRadius: 8, padding: 14 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#e85d26" }}>応募戦略・おすすめ求人タイプ</p>
              <p style={{ margin: 0, fontSize: 13, color: "#333", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{result.job_suggestions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BulkPage() {
  const [career, setCareer] = useState<CareerInput>(emptyCareer);
  const [loadedFromStorage, setLoadedFromStorage] = useState(false);
  const [jobInput, setJobInput] = useState("");
  const [jobs, setJobs] = useState<string[]>([]);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(-1);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"input" | "results">("input");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Career Builder のデータを自動読み込み
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

  const addJob = () => {
    const trimmed = jobInput.trim();
    if (!trimmed) return;
    setJobs(prev => [...prev, trimmed]);
    setJobInput("");
    textareaRef.current?.focus();
  };

  const removeJob = (index: number) => {
    setJobs(prev => prev.filter((_, i) => i !== index));
  };

  const runAll = async () => {
    if (!loadedFromStorage) { setError("Career Builder で職務経歴を入力してください。"); return; }
    if (jobs.length === 0) { setError("求人を1件以上追加してください。"); return; }
    setError("");
    setLoading(true);
    setResults([]);
    setTab("results");

    const newResults: BulkResult[] = [];
    for (let i = 0; i < jobs.length; i++) {
      setLoadingIndex(i);
      try {
        const res = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            job: { title: "", required_skills: [], preferred_skills: [], description: jobs[i] },
            career,
          }),
        });
        if (!res.ok) throw new Error(await res.text());
        const data: MatchResult = await res.json();
        newResults.push({ jobText: jobs[i], result: data, error: null });
      } catch (e: any) {
        newResults.push({ jobText: jobs[i], result: null, error: e.message ?? "不明なエラー" });
      }
      setResults([...newResults]);
    }
    setLoadingIndex(-1);
    setLoading(false);
  };

  // スコア順にソート（エラーは末尾）
  const sortedResults = results
    .map((r, i) => ({ ...r, originalIndex: i }))
    .sort((a, b) => {
      if (!a.result && !b.result) return 0;
      if (!a.result) return 1;
      if (!b.result) return -1;
      return b.result.score_sbert - a.result.score_sbert;
    });

  const successResults = results.filter(r => r.result);
  const avgScore = successResults.length > 0
    ? Math.round(successResults.reduce((s, r) => s + r.result!.score_sbert * 100, 0) / successResults.length)
    : null;
  const bestScore = successResults.length > 0
    ? Math.round(Math.max(...successResults.map(r => r.result!.score_sbert * 100)))
    : null;

  return (
    <div style={s.wrap}>
      <SiteNav />

      <div style={s.main}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>複数求人 一括マッチング診断</h1>
          <p style={{ fontSize: 13, color: "#888" }}>求人テキストを貼り付けるだけで、AIが全件をスコアリング・比較します</p>
        </div>

        {/* Career Builder 未入力ガード */}
        {!loadedFromStorage && (
          <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: 12, padding: "20px 24px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#92400e", marginBottom: 4 }}>Career Builder の入力が必要です</div>
              <div style={{ fontSize: 13, color: "#b45309", lineHeight: 1.7 }}>診断を行うには、まず Career Builder で職務経歴を入力してください。入力内容は自動で保存され、このページに反映されます。</div>
            </div>
            <a href="/career" style={{ ...s.btn, ...s.btnPrimary, textDecoration: "none", flexShrink: 0 }}>
              ✍️ Career Builder へ →
            </a>
          </div>
        )}

        {/* Career Builder 読み込み済みバナー */}
        {loadedFromStorage && (
          <div style={s.loadedBanner}>
            <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ Career Builder のデータを自動読み込みしました（{career.name}）</div>
            <a href="/career" style={{ fontSize: 12, color: "#16a34a", textDecoration: "underline", cursor: "pointer" }}>Career Builder で編集 →</a>
          </div>
        )}

        {/* タブ */}
        <div style={{ display: "flex", borderBottom: "1px solid #ece9e3", marginBottom: 20 }}>
          {(["input", "results"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: tab === t ? 700 : 400, color: tab === t ? "#e85d26" : "#888", background: "none", border: "none", borderBottom: `2px solid ${tab === t ? "#e85d26" : "transparent"}`, cursor: "pointer", marginBottom: -1 }}>
              {t === "input" ? "求人を登録" : `診断結果 ${results.length > 0 ? `(${results.length}件)` : ""}`}
            </button>
          ))}
        </div>

        {/* 入力タブ */}
        {tab === "input" && (
          <>
            <div style={s.card}>
              <div style={s.cardTitle}><div style={s.cardTitleBar} />求人を追加 <span style={{ fontSize: 12, fontWeight: 400, color: "#aaa", marginLeft: 4 }}>{jobs.length}件登録済み</span></div>
              <div style={s.cardDesc}>求人票のテキストを1件ずつ貼り付けて追加してください</div>
              <textarea
                ref={textareaRef}
                style={{ ...s.inp, minHeight: 120 }}
                placeholder={"求人票のテキストをここに貼り付けてください。\n報酬・稼働時間・必要スキルなども含めて貼り付けると精度が上がります。"}
                value={jobInput}
                onChange={e => setJobInput(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={addJob} disabled={!jobInput.trim()} style={{ ...s.btn, ...s.btnPrimary, opacity: jobInput.trim() ? 1 : 0.4, cursor: jobInput.trim() ? "pointer" : "not-allowed" }}>
                  + 求人を追加
                </button>
              </div>
            </div>

            {jobs.length > 0 && (
              <div style={s.card}>
                <div style={s.cardTitle}><div style={s.cardTitleBar} />登録済み求人</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {jobs.map((job, i) => (
                    <JobChip key={i} text={job} index={i} onRemove={() => removeJob(i)} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{error}</div>
            )}

            <div style={{ textAlign: "center" }}>
              <button
                onClick={runAll}
                disabled={loading || jobs.length === 0 || !loadedFromStorage}
                style={{ ...s.btn, ...s.btnPrimary, minWidth: 260, fontSize: 15, padding: "13px 32px", opacity: (loading || jobs.length === 0 || !loadedFromStorage) ? 0.5 : 1, cursor: (loading || jobs.length === 0 || !loadedFromStorage) ? "not-allowed" : "pointer" }}
              >
                {loading ? `診断中 (${loadingIndex + 1} / ${jobs.length})…` : `🔍 ${jobs.length}件を一括診断する`}
              </button>
              {!loadedFromStorage && <div style={{ fontSize: 12, color: "#b45309", marginTop: 8 }}>Career Builder で職務経歴を入力すると診断できます</div>}
              {jobs.length === 0 && loadedFromStorage && <div style={{ fontSize: 12, color: "#aaa", marginTop: 8 }}>求人を1件以上追加してください</div>}
            </div>
          </>
        )}

        {/* 結果タブ */}
        {tab === "results" && (
          <>
            {/* 進行中プログレス */}
            {loading && (
              <div style={{ ...s.card, marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: "#555", marginBottom: 8 }}>求人 {loadingIndex + 1} / {jobs.length} を診断中…</div>
                <div style={{ height: 6, background: "#f0ede8", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(loadingIndex / jobs.length) * 100}%`, background: "#e85d26", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
            )}

            {/* サマリー */}
            {successResults.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  { label: "診断件数", value: `${results.length}`, unit: "件" },
                  { label: "平均スコア", value: `${avgScore}`, unit: "/ 100" },
                  { label: "最高スコア", value: `${bestScore}`, unit: "/ 100" },
                ].map(m => (
                  <div key={m.label} style={{ background: "#fff", border: "1px solid #f0ede8", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a" }}>{m.value}<span style={{ fontSize: 12, fontWeight: 500, color: "#888", marginLeft: 4 }}>{m.unit}</span></div>
                  </div>
                ))}
              </div>
            )}

            {sortedResults.length > 0 ? (
              <>
                <p style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>スコア順に表示 — クリックで詳細を展開</p>
                {sortedResults.map((r, rankIndex) => (
                  <ResultCard key={r.originalIndex} item={r} index={r.originalIndex} rank={rankIndex + 1} />
                ))}
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <button onClick={() => { setTab("input"); }} style={{ ...s.btn, ...s.btnGhost, marginRight: 10 }}>← 求人を追加</button>
                  <button onClick={() => { setJobs([]); setResults([]); setTab("input"); }} style={{ ...s.btn, ...s.btnGhost }}>最初からやり直す</button>
                </div>
              </>
            ) : !loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#bbb", fontSize: 14 }}>
                「求人を登録」タブから診断を実行してください
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
