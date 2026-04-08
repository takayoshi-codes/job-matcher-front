import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "求人マッチング診断",
  description: "職務経歴書と求人票のマッチングスコアを算出し、改善アドバイスを生成します",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
