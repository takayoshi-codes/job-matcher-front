"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  { label: "基本情報", icon: "👤" },
  { label: "自己PR", icon: "✍️" },
  { label: "スキルサマリ", icon: "📋" },
  { label: "技術スタック", icon: "⚙️" },
  { label: "職務経歴", icon: "💼" },
  { label: "稼働条件", icon: "📅" },
  { label: "プレビュー・出力", icon: "📄" },
];

const TECH_OPTIONS = {
  language: ["Python", "JavaScript", "TypeScript", "Java", "PHP", "Ruby", "Go", "C#", "VB.NET", "COBOL", "PL/SQL", "Shell", "VBA", "HTML", "CSS"],
  framework: ["Next.js", "React", "Django", "FastAPI", "Spring", "Laravel", ".NET Framework", "Bootstrap", "Tailwind CSS", "Streamlit"],
  db: ["PostgreSQL", "MySQL", "Oracle", "SQLite", "SQL Server", "MongoDB", "DynamoDB", "BigQuery"],
  os: ["Windows", "Linux (Ubuntu)", "Linux (CentOS/RHEL)", "macOS", "Unix (HP-UX)", "MVS (IBM)"],
  cloud: ["AWS", "Azure", "GCP", "Vercel", "Railway", "Heroku"],
  ai: ["TensorFlow", "Keras", "scikit-learn", "PyTorch", "BERT", "GPT-2", "Word2Vec", "MeCab", "OpenCV", "Gemini API", "OpenAI API", "Claude API", "HuggingFace"],
  tools: ["Git", "GitHub", "GitHub Actions", "GitLab", "Docker", "Selenium", "Figma", "Redmine", "Backlog", "Slack API", "Gmail API", "Supabase"],
  sns: ["Instagram運用", "X (Twitter)運用", "TikTok運用", "YouTube運用", "Facebook運用", "LinkedIn運用", "Canva", "Buffer", "Hootsuite", "Meta広告", "Google広告"],
  video: ["Premiere Pro", "Final Cut Pro", "DaVinci Resolve", "After Effects", "CapCut", "iMovie", "OBS Studio", "Photoshop", "Illustrator", "Lightroom"],
};

const TECH_LABELS: Record<string, string> = {
  language: "言語", framework: "フレームワーク", db: "データベース",
  os: "OS", cloud: "クラウド", ai: "AI / ML", tools: "ツール",
  sns: "SNS・マーケティング", video: "動画・デザイン",
};

const PHASES = ["要件定義", "基本設計", "詳細設計", "開発・実装", "単体テスト", "結合テスト", "システムテスト", "リリース・移行", "運用・保守"];
const JOB_TYPE_GROUPS = [
  {
    label: "開発・エンジニアリング",
    types: ["Webアプリ開発", "フルスタック開発", "スマホアプリ開発", "API・バックエンド開発", "フロントエンド開発", "業務システム開発", "組み込み・IoT開発"],
  },
  {
    label: "AI・データ",
    types: ["AI・機械学習開発", "データ分析・可視化", "業務自動化・効率化", "スクレイピング・データ収集", "チャットボット開発"],
  },
  {
    label: "インフラ・クラウド",
    types: ["インフラ・クラウド構築", "AWS・GCP・Azure", "セキュリティ", "DevOps・CI/CD"],
  },
  {
    label: "PM・コンサル",
    types: ["PMO・プロジェクト管理", "ITコンサルティング", "要件定義・設計", "業務改善・DX推進"],
  },
  {
    label: "クリエイティブ・その他",
    types: ["動画編集・映像制作", "SNS運用・マーケティング", "Webデザイン・UI/UX", "グラフィックデザイン", "ライティング・コンテンツ制作", "翻訳・ローカライズ", "テスト・QA", "テクニカルサポート"],
  },
];
const JOB_TYPES = JOB_TYPE_GROUPS.flatMap(g => g.types);

const emptyProject = { from: "", to: "", present: false, title: "", overview: "", position: "", scale: "", phase: [] as string[], work: "", env: "" };

const initialData = {
  basic: { name: "", furigana: "", age: "", gender: "", station: "", line: "", education: "", certifications: "" },
  pr: { short: "", medium: "", long: "" },
  summary: { consulting: "", management: "", it: "" },
  tech: { language: [] as string[], framework: [] as string[], db: [] as string[], os: [] as string[], cloud: [] as string[], ai: [] as string[], tools: [] as string[], other: "" },
  projects: [{ ...emptyProject }],
  working: { rateMin: "", rateMax: "", rateUnit: "月額", daysPerWeek: "", hoursPerDay: "", weekdays: [] as string[], remote: "", location: "", available: "", jobType: [] as string[] },
};

const STORAGE_KEY = "career_builder_data";

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: "100vh", background: "#f5f5f0", fontFamily: "'Noto Sans JP', sans-serif" },
  header: { background: "#fff", borderBottom: "1px solid #ece9e3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 860, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoWrap: { display: "flex", alignItems: "center", gap: 10 },
  logoIcon: { width: 32, height: 32, background: "#e85d26", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16 },
  main: { maxWidth: 860, margin: "0 auto", padding: "24px 20px 120px" },
  card: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #f0ede8" },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a1a", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 },
  bar: { width: 4, height: 18, background: "#e85d26", borderRadius: 2, flexShrink: 0 },
  desc: { fontSize: 12, color: "#aaa", marginBottom: 20, paddingLeft: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, display: "block" },
  hint: { fontSize: 11, color: "#bbb", marginBottom: 6 },
  inp: { width: "100%", border: "1.5px solid #e0ddd8", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#1a1a1a", background: "#fff", outline: "none", fontFamily: "inherit", resize: "vertical" as const },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  tag: { display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer", border: "1.5px solid", transition: "all 0.15s", userSelect: "none" as const, fontWeight: 500 },
  tagOff: { background: "#fff", borderColor: "#e0ddd8", color: "#888" },
  tagOn: { background: "#fff3ee", borderColor: "#e85d26", color: "#e85d26" },
  tagsWrap: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
  btn: { padding: "11px 24px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "inherit", transition: "all 0.18s" },
  btnPrimary: { background: "#e85d26", color: "#fff" },
  btnGhost: { background: "#fff", color: "#555", border: "1.5px solid #e0ddd8" },
  btnMatch: { background: "#1a1a1a", color: "#fff" },
  footer: { position: "fixed" as const, bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #ece9e3", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 -2px 10px rgba(0,0,0,0.06)" },
  projectCard: { background: "#fff", border: "1.5px solid #f0ede8", borderRadius: 12, padding: 20, marginBottom: 12 },
  projectNum: { fontSize: 11, fontWeight: 700, color: "#e85d26", background: "#fff3ee", padding: "3px 10px", borderRadius: 20 },
  savedBadge: { fontSize: 12, color: "#16a34a", fontWeight: 600, background: "#f0fdf4", padding: "4px 12px", borderRadius: 20, border: "1px solid #bbf7d0" },
};

export default function CareerBuilderPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [saved, setSaved] = useState(false);
  const [outputMode, setOutputMode] = useState("full");

  // 起動時にlocalStorageから復元
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 古いデータとinitialDataをマージして新フィールドのundefinedを防ぐ
        setData(prev => ({
          ...prev,
          ...parsed,
          projects: (parsed.projects ?? prev.projects).map((p: any) => ({
            ...p,
            phase: Array.isArray(p.phase) ? p.phase : [],
          })),
          working: {
            ...prev.working,
            ...(parsed.working ?? {}),
            weekdays: Array.isArray(parsed.working?.weekdays) ? parsed.working.weekdays : [],
            daysPerWeek: parsed.working?.daysPerWeek ?? parsed.working?.days ?? "",
            hoursPerDay: parsed.working?.hoursPerDay ?? "",
            rateMin: parsed.working?.rateMin ?? "",
            rateMax: parsed.working?.rateMax ?? "",
            jobType: Array.isArray(parsed.working?.jobType) ? parsed.working.jobType : [],
          }
        }));
      }
    } catch { /* 無視 */ }
  }, []);

  // データ変更時に自動保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSaved(true);
      const t = setTimeout(() => setSaved(false), 2000);
      return () => clearTimeout(t);
    } catch { /* 無視 */ }
  }, [data]);

  const update = useCallback((section: string, field: string, value: any) => {
    setData(prev => ({ ...prev, [section]: { ...(prev as any)[section], [field]: value } }));
  }, []);

  const toggleTech = useCallback((cat: string, item: string) => {
    setData(prev => {
      const arr = (prev.tech as any)[cat] as string[];
      return { ...prev, tech: { ...prev.tech, [cat]: arr.includes(item) ? arr.filter((x: string) => x !== item) : [...arr, item] } };
    });
  }, []);

  const updateProject = useCallback((idx: number, field: string, value: any) => {
    setData(prev => {
      const projects = [...prev.projects];
      projects[idx] = { ...projects[idx], [field]: value };
      return { ...prev, projects };
    });
  }, []);

  const togglePhase = useCallback((idx: number, phase: string) => {
    setData(prev => {
      const projects = [...prev.projects];
      const phases = projects[idx].phase;
      projects[idx] = { ...projects[idx], phase: phases.includes(phase) ? phases.filter(p => p !== phase) : [...phases, phase] };
      return { ...prev, projects };
    });
  }, []);

  const toggleJobType = useCallback((type: string) => {
    setData(prev => {
      const arr = prev.working.jobType;
      return { ...prev, working: { ...prev.working, jobType: arr.includes(type) ? arr.filter(x => x !== type) : [...arr, type] } };
    });
  }, []);

  // CSVエクスポート
  const exportCSV = () => {
    const rows = [
      ["セクション", "項目", "内容"],
      ["基本情報", "氏名", data.basic.name],
      ["基本情報", "フリガナ", data.basic.furigana],
      ["基本情報", "年齢", data.basic.age],
      ["基本情報", "性別", data.basic.gender],
      ["基本情報", "最寄駅", `${data.basic.station}（${data.basic.line}）`],
      ["基本情報", "学歴", data.basic.education],
      ["基本情報", "資格", data.basic.certifications],
      ["自己PR", "短文", data.pr.short],
      ["自己PR", "中文", data.pr.medium],
      ["自己PR", "長文", data.pr.long],
      ["スキルサマリ", "コンサルスキル", data.summary.consulting],
      ["スキルサマリ", "マネジメントスキル", data.summary.management],
      ["スキルサマリ", "ITスキル", data.summary.it],
      ["技術スタック", "言語", data.tech.language.join("、")],
      ["技術スタック", "FW", data.tech.framework.join("、")],
      ["技術スタック", "DB", data.tech.db.join("、")],
      ["技術スタック", "OS", data.tech.os.join("、")],
      ["技術スタック", "クラウド", data.tech.cloud.join("、")],
      ["技術スタック", "AI/ML", data.tech.ai.join("、")],
      ["技術スタック", "ツール", data.tech.tools.join("、")],
      ["技術スタック", "その他", data.tech.other],
      ...data.projects.flatMap((p, i) => [
        [`職務経歴${i + 1}`, "期間", `${p.from} 〜 ${p.present ? "現在" : p.to}`],
        [`職務経歴${i + 1}`, "案件名", p.title],
        [`職務経歴${i + 1}`, "案件概要", p.overview],
        [`職務経歴${i + 1}`, "ポジション", p.position],
        [`職務経歴${i + 1}`, "規模", p.scale],
        [`職務経歴${i + 1}`, "担当フェーズ", p.phase.join("、")],
        [`職務経歴${i + 1}`, "業務内容", p.work],
        [`職務経歴${i + 1}`, "開発環境", p.env],
      ]),
      ["稼働条件", "希望単価", `${data.working.rateMin ? data.working.rateMin + "円" : ""}〜${data.working.rateMax ? data.working.rateMax + "円" : ""}（${data.working.rateUnit}）`],
      ["稼働条件", "稼働日数", data.working.daysPerWeek],
      ["稼働条件", "稼働時間", data.working.hoursPerDay],
      ["稼働条件", "稼働曜日", data.working.weekdays.join("、")],
      ["稼働条件", "リモート希望", data.working.remote],
      ["稼働条件", "勤務可能エリア", data.working.location],
      ["稼働条件", "参画可能時期", data.working.available],
      ["稼働条件", "希望職種", data.working.jobType.join("、")],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `career_${data.basic.name || "data"}.csv`;
    a.click();
  };

  // 求人マッチング診断へ遷移（localStorageに保存済みなのでそのまま遷移）
  const goToMatcher = () => {
    router.push("/");
  };

  const prText = outputMode === "agent" ? data.pr.medium : data.pr.long;

  return (
    <div style={s.wrap}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus, select:focus { border-color: #e85d26 !important; box-shadow: 0 0 0 3px rgba(232,93,38,0.1); }
        input::placeholder, textarea::placeholder { color: #bbb; }
        input:disabled { background: #f5f5f2 !important; color: #aaa !important; }
        @media (max-width: 580px) { .grid2 { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerInner}>
          <div style={s.logoWrap}>
            <div style={s.logoIcon}>C</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>Career Builder</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>職務経歴書・スキルシート作成</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {saved && <span style={s.savedBadge}>✓ 自動保存済み</span>}
            <span style={{ fontSize: 12, fontWeight: 700, background: "#fff3ee", color: "#e85d26", padding: "4px 14px", borderRadius: 20, border: "1px solid #ffd0c0" }}>
              {step + 1} / {STEPS.length}　{STEPS[step].icon} {STEPS[step].label}
            </span>
          </div>
        </div>

        {/* ステップバー */}
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 10px", display: "flex", alignItems: "center", overflowX: "auto" }}>
          {STEPS.map((st, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? "1 1 0" : "0 0 auto" }}>
              <div onClick={() => setStep(i)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: i < step ? "#e85d26" : i === step ? "#e85d26" : "#f0ede8", color: i <= step ? "#fff" : "#bbb", boxShadow: i === step ? "0 0 0 3px rgba(232,93,38,0.2)" : "none" }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 9, fontWeight: i === step ? 700 : 400, color: i === step ? "#e85d26" : i < step ? "#888" : "#ccc", whiteSpace: "nowrap" }}>{st.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? "#e85d26" : "#f0ede8", margin: "0 3px 14px" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* STEP 0: 基本情報 */}
        {step === 0 && (
          <div style={s.card}>
            <div style={s.sectionTitle}><div style={s.bar} />基本情報</div>
            <div style={s.desc}>プロフィールの基本情報を入力してください</div>
            <div style={{ ...s.grid2, marginBottom: 14 }} className="grid2">
              {[["name","氏名","山田 太郎"],["furigana","フリガナ","ヤマダ タロウ"],["age","年齢","30"],["station","最寄駅","渋谷駅"],["line","路線","JR山手線"]].map(([f,l,p]) => (
                <div key={f}>
                  <label style={s.label}>{l}</label>
                  <input style={s.inp} placeholder={p} value={(data.basic as any)[f]} onChange={e => update("basic", f, e.target.value)} />
                </div>
              ))
              }
              <div>
                <label style={s.label}>性別</label>
                <select style={s.inp} value={data.basic.gender} onChange={e => update("basic", "gender", e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="男性">男性</option>
                  <option value="女性">女性</option>
                  <option value="その他">その他</option>
                  <option value="答えたくない">答えたくない</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={s.label}>最終学歴</label>
              <input style={s.inp} placeholder="例：〇〇大学 情報工学部 卒業（2018年3月）" value={data.basic.education} onChange={e => update("basic", "education", e.target.value)} />
            </div>
            <div>
              <label style={s.label}>保有資格・認定</label>
              <div style={s.hint}>複数ある場合は読点（、）で区切って入力</div>
              <textarea style={{ ...s.inp, minHeight: 60 }} placeholder="例：応用情報技術者、FP2級、AWS SAA、G検定" value={data.basic.certifications} onChange={e => update("basic", "certifications", e.target.value)} />
            </div>
          </div>
        )}

        {/* STEP 1: 自己PR */}
        {step === 1 && (
          <div>
            {[["short","短文（100文字目安）","クラウドワークス・ランサーズ向け",3,100],["medium","中文（400文字目安）","レバテック・ビズリーチ向け",7,400],["long","長文（800文字目安）","LinkedIn・Wantedly・職務経歴書フル版向け",14,800]].map(([f,l,hint,rows,target]) => (
              <div style={s.card} key={f as string}>
                <div style={s.sectionTitle}><div style={s.bar} />{l as string}</div>
                <div style={s.desc}>{hint as string}</div>
                <textarea style={{ ...s.inp, minHeight: Number(rows) * 24 }} placeholder={`${l}の自己PRを入力…`} value={(data.pr as any)[f as string]} onChange={e => update("pr", f as string, e.target.value)} />
                <div style={{ fontSize: 11, textAlign: "right", marginTop: 4, color: (data.pr as any)[f as string].length > Number(target) * 1.2 ? "#e85d26" : "#bbb" }}>
                  {(data.pr as any)[f as string].length} 文字（目安 {target}文字）
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STEP 2: スキルサマリ */}
        {step === 2 && (
          <div>
            {[["consulting","コンサルティングスキル","顧客折衝・要件定義・提案・業務改善などの経験"],["management","マネジメントスキル","PM・PL経験、チーム規模、管理業務などを具体的に"]].map(([f,l,hint]) => (
              <div style={s.card} key={f}>
                <div style={s.sectionTitle}><div style={s.bar} />{l}</div>
                <div style={s.desc}>{hint}</div>
                <textarea style={{ ...s.inp, minHeight: 160 }} placeholder={`・〇〇の経験\n・〇〇を担当`} value={(data.summary as any)[f]} onChange={e => update("summary", f, e.target.value)} />
              </div>
            ))}

            {/* ITスキル：タグ選択＋自由入力 */}
            <div style={s.card}>
              <div style={s.sectionTitle}><div style={s.bar} />ITスキル・テクニカルスキル</div>
              <div style={s.desc}>得意な技術領域・業界知見・開発フェーズ経験を選択＋自由記述</div>
              {/* タグ選択 */}
              {[
                { label: "得意な開発フェーズ", tags: ["要件定義", "基本設計", "詳細設計", "開発・実装", "テスト", "リリース・移行", "運用・保守"] },
                { label: "業界・ドメイン知識", tags: ["金融・保険", "製造業", "流通・小売", "医療・ヘルスケア", "不動産", "教育", "EC・通販", "SaaS・IT", "官公庁・公共"] },
                { label: "得意な技術領域", tags: ["Webアプリ開発", "AI・機械学習", "データ分析", "業務自動化", "インフラ・クラウド", "モバイルアプリ", "組み込み・IoT", "セキュリティ"] },
              ].map(group => (
                <div key={group.label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#e85d26", marginBottom: 6 }}>{group.label}</div>
                  <div style={s.tagsWrap}>
                    {group.tags.map(tag => {
                      const on = typeof data.summary.it === "string" && data.summary.it.includes(tag);
                      return (
                        <div key={tag} style={{ ...s.tag, ...(on ? s.tagOn : s.tagOff) }}
                          onClick={() => {
                            const cur = data.summary.it;
                            const next = on
                              ? cur.split("・").filter((t: string) => t !== tag).join("・")
                              : cur ? cur + "・" + tag : tag;
                            update("summary", "it", next);
                          }}>
                          {on && <span style={{ fontSize: 10 }}>✓</span>}{tag}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {/* 自由入力 */}
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>追記・詳細（自由記述）</div>
                <textarea style={{ ...s.inp, minHeight: 100 }}
                  placeholder={"例：金融系基幹システムの開発経験5年。要件定義〜運用保守まで一貫して担当。\nAWS上でのマイクロサービス設計・構築が得意。"}
                  value={data.summary.it}
                  onChange={e => update("summary", "it", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 技術スタック */}
        {step === 3 && (
          <div style={s.card}>
            <div style={s.sectionTitle}><div style={s.bar} />技術スタック</div>
            <div style={s.desc}>使用経験のある技術をすべて選択してください</div>
            {Object.entries(TECH_OPTIONS).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#e85d26", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  {TECH_LABELS[cat]}
                  <div style={{ flex: 1, height: 1, background: "#f0ede8" }} />
                </div>
                <div style={s.tagsWrap}>
                  {items.map(item => {
                    const on = ((data.tech as any)[cat] as string[]).includes(item);
                    return (
                      <div key={item} style={{ ...s.tag, ...(on ? s.tagOn : s.tagOff) }} onClick={() => toggleTech(cat, item)}>
                        {on && <span style={{ fontSize: 10 }}>✓</span>}{item}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div>
              <label style={s.label}>その他</label>
              <input style={s.inp} placeholder="例：Redmine、Backlog、Power Platform" value={data.tech.other} onChange={e => update("tech", "other", e.target.value)} />
            </div>
          </div>
        )}

        {/* STEP 4: 職務経歴 */}
        {step === 4 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>職務経歴</div>
              <button style={{ ...s.btn, ...s.btnPrimary, padding: "8px 16px", fontSize: 13 }} onClick={() => setData(prev => ({ ...prev, projects: [...prev.projects, { ...emptyProject }] }))}>＋ 案件追加</button>
            </div>
            {data.projects.map((p, i) => (
              <div style={s.projectCard} key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={s.projectNum}>案件 {i + 1}</span>
                  {data.projects.length > 1 && (
                    <button style={{ ...s.btn, background: "#fff", color: "#e85d26", border: "1.5px solid #ffd0c0", padding: "4px 12px", fontSize: 12 }} onClick={() => setData(prev => ({ ...prev, projects: prev.projects.filter((_, j) => j !== i) }))}>削除</button>
                  )}
                </div>
                <div style={{ ...s.grid2, marginBottom: 14 }} className="grid2">
                  <div>
                    <label style={s.label}>開始年月</label>
                    <input style={s.inp} type="month" value={p.from} onChange={e => updateProject(i, "from", e.target.value)} />
                  </div>
                  <div>
                    <label style={s.label}>終了年月</label>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input style={{ ...s.inp, flex: 1 }} type="month" value={p.to} disabled={p.present} onChange={e => updateProject(i, "to", e.target.value)} />
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                        <input type="checkbox" checked={p.present} onChange={e => updateProject(i, "present", e.target.checked)} /> 現在
                      </label>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>案件名</label>
                  <input style={s.inp} placeholder="例：大手生命保険会社 基幹システム刷新PJ" value={p.title} onChange={e => updateProject(i, "title", e.target.value)} />
                </div>
                <div style={{ ...s.grid2, marginBottom: 14 }} className="grid2">
                  <div>
                    <label style={s.label}>ポジション</label>
                    <input style={s.inp} placeholder="例：PM / PL / メンバー" value={p.position} onChange={e => updateProject(i, "position", e.target.value)} />
                  </div>
                  <div>
                    <label style={s.label}>チーム規模</label>
                    <input style={s.inp} placeholder="例：全体30名・配下4名" value={p.scale} onChange={e => updateProject(i, "scale", e.target.value)} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>案件概要</label>
                  <textarea style={{ ...s.inp, minHeight: 70 }} placeholder="プロジェクトの背景・目的・概要" value={p.overview} onChange={e => updateProject(i, "overview", e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>担当フェーズ</label>
                  <div style={{ ...s.tagsWrap, marginTop: 6 }}>
                    {PHASES.map(ph => {
                      const on = Array.isArray(p.phase) && p.phase.includes(ph);
                      return (
                        <div key={ph} style={{ ...s.tag, ...(on ? s.tagOn : s.tagOff) }} onClick={() => togglePhase(i, ph)}>
                          {on && <span style={{ fontSize: 10 }}>✓</span>}{ph}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={s.label}>業務内容</label>
                  <textarea style={{ ...s.inp, minHeight: 130 }} placeholder="■コンサルティング業務&#10;・顧客折衝&#10;&#10;■マネジメント業務&#10;・タスク管理" value={p.work} onChange={e => updateProject(i, "work", e.target.value)} />
                </div>
                <div>
                  <label style={s.label}>開発環境</label>
                  <textarea style={{ ...s.inp, minHeight: 70 }} placeholder="OS：Windows&#10;言語：Python&#10;DB：Oracle" value={p.env} onChange={e => updateProject(i, "env", e.target.value)} />
                </div>
              </div>
            ))}
            <button style={{ ...s.btn, ...s.btnGhost, width: "100%", marginTop: 4 }} onClick={() => setData(prev => ({ ...prev, projects: [...prev.projects, { ...emptyProject }] }))}>＋ 案件をさらに追加</button>
          </div>
        )}

        {/* STEP 5: 稼働条件 */}
        {step === 5 && (
          <div>
            <div style={s.card}>
              <div style={s.sectionTitle}><div style={s.bar} />希望単価・稼働条件</div>
              <div style={s.desc}>エージェント登録・直接営業時に活用します</div>

              {/* 希望単価 */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...s.label, marginBottom: 0 }}>希望単価</label>
                  <select style={{ ...s.inp, width: 80, padding: "6px 8px", fontSize: 12 }} value={data.working.rateUnit} onChange={e => update("working", "rateUnit", e.target.value)}>
                    <option>月額</option><option>時給</option><option>日額</option>
                  </select>
                </div>
                {/* 下限 */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>下限</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid #e0ddd8", background: "#fff", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => { const v = parseInt(data.working.rateMin || "0") - 100000; update("working", "rateMin", Math.max(0, v).toString()); }}>−</button>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input style={{ ...s.inp, textAlign: "right", paddingRight: 28 }} placeholder="0" value={data.working.rateMin} onChange={e => update("working", "rateMin", e.target.value.replace(/[^0-9]/g, ""))} />
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#888" }}>円</span>
                    </div>
                    <button type="button" style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid #e85d26", background: "#fff3ee", color: "#e85d26", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => { const v = parseInt(data.working.rateMin || "0") + 100000; update("working", "rateMin", v.toString()); }}>＋</button>
                    {data.working.rateMin && <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", flexShrink: 0 }}>{parseInt(data.working.rateMin).toLocaleString()}円</span>}
                  </div>
                </div>
                {/* 上限 */}
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>上限</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid #e0ddd8", background: "#fff", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => { const v = parseInt(data.working.rateMax || "0") - 100000; update("working", "rateMax", Math.max(0, v).toString()); }}>−</button>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input style={{ ...s.inp, textAlign: "right", paddingRight: 28 }} placeholder="上限なし" value={data.working.rateMax} onChange={e => update("working", "rateMax", e.target.value.replace(/[^0-9]/g, ""))} />
                      <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#888" }}>円</span>
                    </div>
                    <button type="button" style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid #e85d26", background: "#fff3ee", color: "#e85d26", fontSize: 18, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={() => { const v = parseInt(data.working.rateMax || "0") + 100000; update("working", "rateMax", v.toString()); }}>＋</button>
                    {data.working.rateMax && <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", flexShrink: 0 }}>{parseInt(data.working.rateMax).toLocaleString()}円</span>}
                  </div>
                </div>
              </div>

              {/* 稼働日数・時間・曜日 */}
              <div style={{ ...s.grid2, marginBottom: 16 }} className="grid2">
                <div>
                  <label style={s.label}>稼働可能日数（週）</label>
                  <select style={s.inp} value={data.working.daysPerWeek} onChange={e => update("working", "daysPerWeek", e.target.value)}>
                    <option value="">選択してください</option>
                    <option>週1日（月4〜5日）</option>
                    <option>週2日（月8〜10日）</option>
                    <option>週3日（月12〜15日）</option>
                    <option>週4日（月16〜20日）</option>
                    <option>週5日（フルタイム）</option>
                    <option>応相談</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>稼働可能時間（1日）</label>
                  <select style={s.inp} value={data.working.hoursPerDay} onChange={e => update("working", "hoursPerDay", e.target.value)}>
                    <option value="">選択してください</option>
                    <option>1日4時間（半日）</option>
                    <option>1日6時間</option>
                    <option>1日8時間（フルタイム）</option>
                    <option>応相談</option>
                  </select>
                </div>
              </div>

              {/* 稼働曜日 */}
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>稼働可能曜日</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                  {["平日（月〜金）", "土曜日", "日曜日", "祝日"].map(day => {
                    const on = Array.isArray(data.working.weekdays) && data.working.weekdays.includes(day);
                    return (
                      <div key={day}
                        style={{ ...s.tag, ...(on ? s.tagOn : s.tagOff) }}
                        onClick={() => {
                          const arr = data.working.weekdays;
                          update("working", "weekdays", on ? arr.filter((d: string) => d !== day) : [...arr, day]);
                        }}
                      >
                        {on && <span style={{ fontSize: 10 }}>✓</span>}{day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...s.grid2, marginBottom: 0 }} className="grid2">
                <div>
                  <label style={s.label}>リモート希望</label>
                  <select style={s.inp} value={data.working.remote} onChange={e => update("working", "remote", e.target.value)}>
                    <option value="">選択してください</option>
                    <option>フルリモート希望</option>
                    <option>週1〜2日出社可</option>
                    <option>常駐可（要相談）</option>
                    <option>応相談</option>
                  </select>
                </div>
                <div>
                  <label style={s.label}>勤務可能エリア</label>
                  <div style={{ marginBottom: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#e85d26", marginBottom: 8 }}>
                      <input type="checkbox"
                        checked={data.working.location.includes("フルリモート")}
                        onChange={e => {
                          const cur = data.working.location.replace("フルリモート・", "").replace("・フルリモート", "").replace("フルリモート", "").trim();
                          update("working", "location", e.target.checked ? (cur ? cur + "・フルリモート" : "フルリモート") : cur);
                        }}
                        style={{ accentColor: "#e85d26", width: 16, height: 16 }}
                      />
                      🏠 フルリモート希望
                    </label>
                    <select style={{ ...s.inp, marginBottom: 6 }}
                      onChange={e => {
                        const v = e.target.value;
                        if (!v) return;
                        const cur = data.working.location;
                        if (!cur.includes(v)) update("working", "location", cur ? cur + "・" + v : v);
                        e.target.value = "";
                      }}
                    >
                      <option value="">エリア・都道府県を追加…</option>
                      <optgroup label="北海道・東北">
                        <option>北海道</option><option>青森県</option><option>岩手県</option><option>宮城県</option><option>秋田県</option><option>山形県</option><option>福島県</option>
                      </optgroup>
                      <optgroup label="関東">
                        <option>東京都</option><option>神奈川県</option><option>埼玉県</option><option>千葉県</option><option>茨城県</option><option>栃木県</option><option>群馬県</option>
                      </optgroup>
                      <optgroup label="中部">
                        <option>愛知県</option><option>静岡県</option><option>新潟県</option><option>長野県</option><option>山梨県</option><option>岐阜県</option><option>富山県</option><option>石川県</option><option>福井県</option>
                      </optgroup>
                      <optgroup label="近畿">
                        <option>大阪府</option><option>兵庫県</option><option>京都府</option><option>奈良県</option><option>滋賀県</option><option>和歌山県</option><option>三重県</option>
                      </optgroup>
                      <optgroup label="中国">
                        <option>広島県</option><option>岡山県</option><option>山口県</option><option>鳥取県</option><option>島根県</option>
                      </optgroup>
                      <optgroup label="四国">
                        <option>愛媛県</option><option>香川県</option><option>高知県</option><option>徳島県</option>
                      </optgroup>
                      <optgroup label="九州・沖縄">
                        <option>福岡県</option><option>佐賀県</option><option>長崎県</option><option>熊本県</option><option>大分県</option><option>宮崎県</option><option>鹿児島県</option><option>沖縄県</option>
                      </optgroup>
                    </select>
                    {data.working.location && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {data.working.location.split("・").filter(Boolean).map((loc: string) => (
                          <span key={loc} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: "#fff3ee", border: "1px solid #ffd0c0", fontSize: 12, color: "#e85d26", fontWeight: 600 }}>
                            {loc}
                            <span style={{ cursor: "pointer", fontSize: 11 }} onClick={() => {
                              const arr = data.working.location.split("・").filter((l: string) => l !== loc);
                              update("working", "location", arr.join("・"));
                            }}>×</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={s.label}>参画可能時期</label>
                  <input style={s.inp} placeholder="例：即日〜 / 2025年4月以降" value={data.working.available} onChange={e => update("working", "available", e.target.value)} />
                </div>
              </div>
            </div>
            <div style={s.card}>
              <div style={s.sectionTitle}><div style={s.bar} />希望職種・案件種別</div>
              <div style={s.desc}>複数選択可</div>
              {JOB_TYPE_GROUPS.map(group => (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#e85d26", letterSpacing: "0.05em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    {group.label}
                    <div style={{ flex: 1, height: 1, background: "#f0ede8" }} />
                  </div>
                  <div style={s.tagsWrap}>
                    {group.types.map(t => {
                      const on = Array.isArray(data.working.jobType) && data.working.jobType.includes(t);
                      return (
                        <div key={t} style={{ ...s.tag, ...(on ? s.tagOn : s.tagOff) }} onClick={() => toggleJobType(t)}>
                          {on && <span style={{ fontSize: 10 }}>✓</span>}{t}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: プレビュー・出力 */}
        {step === 6 && (
          <div>
            {/* 出力モード */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {[["full","📄 職務経歴書（フル版）"],["skill","📋 スキルシート"],["agent","📨 エージェント提出用"]].map(([m,l]) => (
                <button key={m} onClick={() => setOutputMode(m)} style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: `1.5px solid ${outputMode === m ? "#e85d26" : "#e0ddd8"}`, background: outputMode === m ? "#fff3ee" : "#fff", color: outputMode === m ? "#e85d26" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{l}</button>
              ))}
            </div>

            {/* プレビュー */}
            <div style={{ background: "#fff", borderRadius: 12, padding: 36, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontWeight: 700, textAlign: "center", marginBottom: 6 }}>{outputMode === "skill" ? "スキルシート" : "職務経歴書"}</div>
              <div style={{ fontSize: 17, fontWeight: 600, textAlign: "center", marginBottom: 4 }}>{data.basic.name || "（氏名未入力）"}</div>
              <div style={{ fontSize: 12, color: "#888", textAlign: "center", marginBottom: 24 }}>
                {[data.basic.age && `${data.basic.age}歳`, data.basic.gender, data.basic.station && `最寄：${data.basic.station}`].filter(Boolean).join("　｜　")}
              </div>
              <hr style={{ border: "none", borderTop: "2px solid #e85d26", marginBottom: 20 }} />

              {data.basic.certifications && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>保有資格</div>
                  <div style={{ fontSize: 13 }}>{data.basic.certifications}</div>
                </div>
              )}

              {(outputMode === "full" || outputMode === "agent") && prText && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>自己PR</div>
                  <div style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{prText}</div>
                </div>
              )}

              {(data.summary.consulting || data.summary.management || data.summary.it) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>スキルサマリ</div>
                  {[["コンサルティングスキル", data.summary.consulting],["マネジメントスキル", data.summary.management],["ITスキル", data.summary.it]].filter(([,v]) => v).map(([l,v]) => (
                    <div key={l} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: "#e85d26", marginBottom: 4 }}>【{l}】</div>
                      <div style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{v}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>技術スタック</div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <tbody>
                    {[["言語",data.tech.language],["FW",data.tech.framework],["DB",data.tech.db],["OS",data.tech.os],["クラウド",data.tech.cloud],["AI/ML",data.tech.ai],["ツール",[...data.tech.tools,...(data.tech.other?[data.tech.other]:[])]]]
                      .filter(([,v]) => (v as string[]).length > 0)
                      .map(([l,v]) => (
                        <tr key={l as string} style={{ borderBottom: "1px solid #f5f3ef" }}>
                          <td style={{ padding: "7px 10px", fontWeight: 600, color: "#666", width: 80 }}>{l as string}</td>
                          <td style={{ padding: "7px 10px" }}>{(v as string[]).join("　/　")}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {outputMode !== "agent" && data.projects.some(p => p.title) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>職務経歴</div>
                  {data.projects.filter(p => p.title).map((p, i) => (
                    <div key={i} style={{ background: "#f9f8f6", border: "1px solid #ede9e3", borderRadius: 8, padding: 16, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{p.title}</div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#888", marginBottom: 8, flexWrap: "wrap" }}>
                        {p.from && <span>📅 {p.from} 〜 {p.present ? "現在" : p.to}</span>}
                        {p.position && <span>👤 {p.position}</span>}
                        {p.scale && <span>👥 {p.scale}</span>}
                      </div>
                      {p.overview && <div style={{ fontSize: 12, marginBottom: 8, lineHeight: 1.8 }}>{p.overview}</div>}
                      {p.phase.length > 0 && <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>担当フェーズ：{p.phase.join("　/　")}</div>}
                      {p.work && <div style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{p.work}</div>}
                      {p.env && <div style={{ fontSize: 12, color: "#777", background: "#f0ede8", padding: "8px 12px", borderRadius: 6, whiteSpace: "pre-wrap", marginTop: 8 }}>{p.env}</div>}
                    </div>
                  ))}
                </div>
              )}

              {(outputMode === "full" || outputMode === "agent") && (
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, background: "#f8f7f4", padding: "7px 12px", borderLeft: "4px solid #e85d26", borderRadius: "0 6px 6px 0", marginBottom: 10 }}>稼働条件</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <tbody>
                      {[["希望単価", (data.working.rateMin || data.working.rateMax) ? `${data.working.rateMin ? data.working.rateMin + "円" : ""}〜${data.working.rateMax ? data.working.rateMax + "円" : ""}（${data.working.rateUnit}）` : ""],["稼働日数",data.working.daysPerWeek],["稼働時間",data.working.hoursPerDay],["稼働曜日",data.working.weekdays.join("、")],["リモート",data.working.remote],["勤務エリア",data.working.location],["参画可能時期",data.working.available],["希望職種",data.working.jobType.join("　/　")]]
                        .filter(([,v]) => v)
                        .map(([l,v]) => (
                          <tr key={l} style={{ borderBottom: "1px solid #f5f3ef" }}>
                            <td style={{ padding: "7px 10px", fontWeight: 600, color: "#666", width: 110 }}>{l}</td>
                            <td style={{ padding: "7px 10px" }}>{v}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 出力ボタン群 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }} onClick={() => window.print()}>🖨　印刷・PDF保存</button>
              <button style={{ ...s.btn, ...s.btnGhost, flex: 1 }} onClick={exportCSV}>📥 CSVエクスポート</button>
            </div>

            {/* 求人マッチング診断へ */}
            <button
              style={{ ...s.btn, ...s.btnMatch, width: "100%", fontSize: 15, padding: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              onClick={goToMatcher}
            >
              求人マッチング診断へ進む →
            </button>
            <div style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 8 }}>
              入力データは自動保存されているので、そのまま診断に使えます
            </div>
          </div>
        )}
      </div>

      {/* Footer Nav */}
      <div style={s.footer}>
        <button style={{ ...s.btn, ...s.btnGhost, opacity: step === 0 ? 0.3 : 1, minWidth: 90 }} onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>← 前へ</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{ cursor: "pointer", width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? "#e85d26" : i < step ? "#ffb89a" : "#f0ede8", transition: "all 0.2s" }} />
          ))}
        </div>
        {step < STEPS.length - 1
          ? <button style={{ ...s.btn, ...s.btnPrimary, minWidth: 90 }} onClick={() => setStep(s => s + 1)}>次へ →</button>
          : <div style={{ minWidth: 90 }} />
        }
      </div>
    </div>
  );
}
