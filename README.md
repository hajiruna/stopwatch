# ストップウォッチアプリケーション

シンプルで使いやすいウェブベースのストップウォッチアプリケーションです。

## 機能

- 開始、停止、リセット機能を持つ高精度ストップウォッチ
- ミリ秒単位の精度
- 測定記録の保存と管理
- クリーンで読みやすいユーザーインターフェース

## 技術スタック

- フロントエンド: React, TypeScript, TailwindCSS
- バックエンド: Express.js, Node.js
- データベース: PostgreSQL with Drizzle ORM
- スタイリング: shadcn UI コンポーネント

## セットアップ

```bash
# インストール
npm install

# 開発サーバーの起動
npm run dev

# データベースマイグレーションの実行
npm run db:push
```

## デプロイメント

このアプリケーションはReplitでホストされており、`.replit.app`ドメインでアクセスできます。