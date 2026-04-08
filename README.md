# job-matcher-front

求人票 × 職務経歴書 マッチング診断の Next.js フロントエンド。

## 技術スタック

- **Next.js 14** — App Router
- **TypeScript**
- **Vercel** — デプロイ先

## ローカル起動

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## デプロイ（Vercel）

1. GitHubリポジトリと連携
2. 環境変数に `NEXT_PUBLIC_API_URL` を設定（RailwayのURL）
3. 自動デプロイ
