# 🌏 TJ-Cosmetics 統合ECシステム

**中央アジア向け化粧品輸出管理システム**

[![Version](https://img.shields.io/badge/version-5.0-blue.svg)](REQUIREMENTS.md)
[![Status](https://img.shields.io/badge/status-active-green.svg)]()
[![License](https://img.shields.io/badge/license-private-red.svg)]()

## 🎯 システム概要

中央アジア諸国（タジキスタン、ウズベキスタン、カザフスタン、キルギス）向けの化粧品輸出ビジネス管理システム。20kgパッケージベースの正確な価格計算、国別管理、リアルタイム利益率調整機能を提供。

### ✅ 主な機能

- **🧮 20kgパッケージベース価格計算システム**: 国際小包制限に基づく正確な送料計算
- **🌍 国別管理システム**: 各国専用ダッシュボード・設定管理
- **💰 リアルタイム利益率調整**: 即座に価格反映・国別比較
- **📊 統一計算システム**: 全ページで一貫した価格計算
- **🏢 マルチテナント対応**: マスター・国別・代表者の3層権限管理

### 🚀 技術スタック

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL), Row Level Security
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **Version Control**: Git + GitHub

## 🏗️ システム構成

```
📁 TJ-Cosmetics System
├── 🏢 マスター管理システム        # 全国統括管理
├── 🇹🇯 タジキスタン管理システム    # 実装完了
├── 🇺🇿 ウズベキスタン管理システム  # 計画中
├── 🇰🇿 カザフスタン管理システム    # 計画中  
└── 🇰🇬 キルギス管理システム       # 計画中
```

## 💡 価格計算システムの特徴

### 20kgパッケージベース計算方式

```typescript
// 例：400g商品の送料計算
const itemWeight = 0.4; // kg
const packageLimit = 20; // kg  
const packageCost = 39800; // 円

const itemsPerPackage = Math.floor(20 / 0.4); // 50個
const shippingCostPerItem = Math.ceil(39800 / 50); // 796円/個
```

### 計算の正確性

- ✅ **従来方式**: 1kg = ¥1,990 → 400g = ¥796（不正確）
- ✅ **新方式**: 20kg÷50個 → 1個 = ¥796（正確）

## 🛠️ 開発・運用

### 開発環境

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run type-check
```

### 実装状況

#### Phase 1-3: 基盤システム ✅ **完了**
- [x] 商品マスターデータ管理
- [x] 20kgパッケージベース価格計算
- [x] 国別管理システム（タジキスタン）
- [x] リアルタイム利益率調整
- [x] 全ページ計算統一

#### Phase 4: インフラ強化 🔄 **進行中**
- [ ] Supabase データベース連携
- [ ] GitHub CI/CD パイプライン
- [ ] 認証システム統合
- [ ] リアルタイムデータ同期

#### Phase 5-6: 機能拡張 ⏳ **計画中**
- [ ] 他国システム展開
- [ ] ECサイト機能
- [ ] 注文・在庫管理
- [ ] 高度分析機能

## 📊 対応国・通貨

| 国 | 通貨 | 為替レート | 実装状況 |
|---|---|---|---|
| 🇹🇯 タジキスタン | TJS | 0.071 | ✅ 完了 |
| 🇺🇿 ウズベキスタン | UZS | 0.008 | ⏳ 計画中 |
| 🇰🇿 カザフスタン | KZT | 0.19 | ⏳ 計画中 |
| 🇰🇬 キルギス | KGS | 1.02 | ⏳ 計画中 |

## 🔐 アクセス制御

### 権限レベル

1. **マスター管理者**: 全システム・全国データアクセス
2. **国別管理者**: 担当国データのみアクセス  
3. **代表購入者**: 個人注文データのみアクセス

### 国別ログインURL

- **タジキスタン**: `/country/tajikistan/`
- **ウズベキスタン**: `/country/uzbekistan/` (準備中)
- **カザフスタン**: `/country/kazakhstan/` (準備中)
- **キルギス**: `/country/kyrgyzstan/` (準備中)

## 📚 ドキュメント

- [要件定義書 v5.0](REQUIREMENTS.md) - 完全システム仕様
- [GitHub連携ガイド](github-setup-guide.md) - バージョン管理設定
- [Supabase連携ガイド](supabase-setup-guide.md) - データベース設定

## 🏃‍♂️ クイックスタート

```bash
# 1. リポジトリクローン
git clone https://github.com/GoalProject-o/tajik-cosmetics-system.git
cd tajik-cosmetics-system

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 4. 開発サーバー起動
npm run dev
```

## 🤝 コントリビューション

このプロジェクトはプライベートリポジトリです。アクセス権限については管理者にお問い合わせください。

## 📞 サポート

- **システム管理者**: [連絡先情報]
- **技術サポート**: [連絡先情報]
- **Issue報告**: GitHub Issues

---

**Last Updated**: 2024年8月18日  
**Version**: 5.0  
**Status**: 価格計算システム完成、Supabase・GitHub連携準備完了
