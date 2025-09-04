# NFT証明書表示システム

NFTの証明書を表示するWebアプリケーションです。URLパラメータとして渡されたIDを基に、APIからNFTデータを取得し、視覚的に魅力的な方法で表示します。

## 🚀 主な機能

- URLクエリパラメータ（`?requestId=xxx`）によるNFT証明書の表示
- NFTの詳細情報表示（タイトル、説明、画像、メタデータ）
- 説明文中のURLを自動的にクリック可能なリンクに変換
- 画像のモーダル表示（クリックで拡大表示）
- ハッシュ検証機能（完全性検証）
- レスポンシブデザイン（モバイル対応）
- エラーハンドリングとフォールバック表示
- 有効期限や作成日などのメタデータ表示

## 🛠 技術スタック

- **フロントエンド**: React 19.1.0、TypeScript 5.8.3
- **状態管理**: TanStack Query（React Query）5.75.0
- **ルーティング**: React Router 7.5.3
- **スタイリング**: TailwindCSS 4.1.5
- **ビルドツール**: Vite 6.3.4
- **コード品質管理**: ESLint 9.25.1, Prettier 3.5.3
- **React Compiler**: babel-plugin-react-compiler 19.1.0-rc.1

## 📋 環境要件

- Node.js 20.x 以上
- npm 10.x 以上

## ⚡ クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# プロダクションビルド
npm run build

# ビルド後のプレビュー
npm run preview
```

## 🗂 プロジェクト構成

```
src/
├── api/              # API関連機能
│   └── nftApi.ts     # NFT証明書API通信
├── components/       # UIコンポーネント
│   └── NFTComponents.tsx # NFTカード、ローディング、フォールバック
├── types/            # 型定義
│   └── NftDataTypes.ts # NFTデータの型定義
├── utils/            # ユーティリティ関数
│   ├── cn.ts         # TailwindCSSクラス結合
│   ├── hashVerification.ts # ハッシュ検証機能
│   └── linkifyText.tsx # テキスト内URL自動リンク化
├── App.tsx           # アプリケーションのルート
├── MainContent.tsx   # メインコンテンツコンポーネント
└── main.tsx          # エントリーポイント
```

## 📖 使用方法

### 基本的な使用方法

アプリケーションにアクセスする際は、URLパラメータで`requestId`を指定してください：

```
https://your-domain.com/contribution-proof-view-dev/?requestId=abc123
```

## 🔧 開発用スクリプト

```bash
# 開発サーバー起動（自動フォーマット・リント・型チェック付き）
npm run dev

# プロダクションビルド（自動フォーマット・リント・型チェック付き）
npm run build

# リンターの実行
npm run lint

# リンターの自動修正
npm run lint:fix

# コードフォーマット
npm run format

# TypeScript型チェック
npm run type-check
```

## ⚙️ 設定

### ビルド設定

- **ベースパス**: `/nft-certification/`
- **シングルファイルビルド**: 有効化（`vite-plugin-singlefile`使用）
- **React Compiler**: 有効化（パフォーマンス最適化）

### デザインシステム

カスタムCSS変数を使用したデザインシステムを採用：

```css
:root {
  --color-credential-primary: #3b82f6;
  --color-credential-border: #e5e7eb;
  --color-credential-bg: #f9fafb;
  --shadow-credential-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --font-family-primary: 'Helvetica Neue', Arial, sans-serif;
}
```

## 🧪 主要コンポーネント

### NFTCard

- NFT証明書の詳細情報を表示
- 画像モーダル機能
- ハッシュ検証機能
- 有効期限チェック

### NFTLoading

- データ読み込み中の表示
- アニメーション付きローディングインジケーター

### NFTFallback

- エラー時のフォールバック表示
- デフォルトサンプルデータの表示

## 🔐 セキュリティ機能

- **ハッシュ検証**: NFTデータの完全性を検証
- **IPFS対応**: `ipfs://` URLの自動変換
- **XSS対策**: テキスト表示時の適切なエスケープ処理

## 🌐 対応ブラウザ

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 ライセンス

© 2025 Epis Education Centre. NFT証明書システム

## 📞 サポート

プロジェクトに関する質問や問題については、開発チームまでお問い合わせください。
