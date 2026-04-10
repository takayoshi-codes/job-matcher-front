"use client";

import { usePathname } from "next/navigation";

const s: Record<string, React.CSSProperties> = {
  header: { background: "#fff", borderBottom: "1px solid #ece9e3", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 100 },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", gap: 0 },
  logo: { display: "flex", alignItems: "center", gap: 10, marginRight: 32, padding: "12px 0" },
  logoIcon: { width: 32, height: 32, background: "#e85d26", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 },
  navLink: { display: "flex", alignItems: "center", gap: 6, padding: "16px 14px", fontSize: 13, fontWeight: 600, textDecoration: "none", borderBottom: "2px solid transparent", color: "#888", transition: "color 0.15s", whiteSpace: "nowrap" as const },
  navLinkActive: { color: "#e85d26", borderBottomColor: "#e85d26" },
  badge: { fontSize: 9, fontWeight: 700, background: "#e85d26", color: "#fff", padding: "2px 6px", borderRadius: 99 },
};

const NAV_ITEMS = [
  { href: "/career", label: "✍️ Career Builder", desc: "職務経歴を入力" },
  { href: "/", label: "🔍 1件診断", desc: "" },
  { href: "/bulk", label: "📋 一括診断", desc: "" },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <div style={s.header}>
      <div style={s.inner}>
        <div style={s.logo}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>求人マッチング診断</div>
            <div style={{ fontSize: 10, color: "#aaa" }}>Job Matching Analyzer</div>
          </div>
        </div>
        <nav style={{ display: "flex", alignItems: "stretch" }}>
          {NAV_ITEMS.map(item => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                style={{ ...s.navLink, ...(isActive ? s.navLinkActive : {}) }}
              >
                {item.label}
                
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
