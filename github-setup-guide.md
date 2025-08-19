# GitHub連携設定ガイド

## Step 1: GitHub リポジトリ作成

### 1.1 GitHubでの作業
1. https://github.com にアクセス・ログイン
2. 右上の「+」→「New repository」クリック
3. 以下設定で作成：
   ```
   Repository name: tajik-cosmetics-system
   Description: TJ-Cosmetics統合ECシステム - 中央アジア向け化粧品輸出管理システム
   Visibility: Private ✅
   Initialize: □ Add a README file (チェックしない)
   ```

### 1.2 ローカルでのGit初期化
```bash
# プロジェクトディレクトリに移動
cd "C:\Users\kozoz\Desktop\dev\tajik\tajik-dairi"

# Git初期化
git init

# .gitignore作成（既存の場合はスキップ）
echo "node_modules/
.next/
.env.local
.env
*.log
.DS_Store
dist/
coverage/" > .gitignore

# 全ファイルをステージング
git add .

# 初回コミット
git commit -m "🚀 Initial commit: TJ-Cosmetics System v5.0

✅ Completed Features:
- 20kg package-based pricing system (統一価格計算)
- Real-time profit margin adjustment (利益率リアルタイム調整)
- Country-specific pricing calculation (国別価格計算)
- Unified pricing across all pages (全ページ計算統一)
- Product edit/registration system (商品編集・登録)
- Cost analysis system (コスト分析)

📋 Documentation:
- Complete requirements specification v5.0
- Database design (Supabase ready)
- API integration planning

🔄 Next Phase:
- Supabase database integration
- Authentication system
- Multi-country deployment"

# GitHubリモート追加（[ユーザー名]を実際のユーザー名に変更）
git remote add origin https://github.com/[ユーザー名]/tajik-cosmetics-system.git

# メインブランチに変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

## Step 2: ブランチ戦略設定

```bash
# develop ブランチ作成
git checkout -b develop
git push -u origin develop

# feature ブランチ準備
git checkout -b feature/supabase-integration
git push -u origin feature/supabase-integration

# メインブランチに戻る
git checkout main
```

## Step 3: GitHub設定強化

### 3.1 ブランチ保護設定
1. GitHub リポジトリページで「Settings」タブ
2. 左メニューから「Branches」
3. 「Add rule」→「main」ブランチに以下設定：
   ```
   ☑ Restrict pushes that create files larger than 100MB
   ☑ Require a pull request before merging
     ☑ Require approvals: 1
     ☑ Dismiss stale reviews
   ☑ Require status checks to pass before merging
   ☑ Do not allow bypassing the above settings
   ```

### 3.2 Issue Templates作成
```bash
# .github/ISSUE_TEMPLATE/ ディレクトリ作成
mkdir -p .github/ISSUE_TEMPLATE

# バグレポートテンプレート
cat > .github/ISSUE_TEMPLATE/bug_report.md << 'EOF'
---
name: Bug Report
about: バグレポート
title: "[BUG] "
labels: bug
assignees: ''
---

## 🐛 バグの概要


## 🔄 再現手順
1. 
2. 
3. 

## 📱 環境
- OS: 
- ブラウザ: 
- バージョン: 

## 📷 スクリーンショット


## ✅ 期待する動作


## ❌ 実際の動作

EOF

# 機能追加テンプレート
cat > .github/ISSUE_TEMPLATE/feature_request.md << 'EOF'
---
name: Feature Request
about: 新機能リクエスト
title: "[FEATURE] "
labels: enhancement
assignees: ''
---

## 🚀 機能の概要


## 📋 詳細な説明


## 🎯 期待される効果


## 📐 実装のアイデア


## 📅 優先度
- [ ] 高
- [ ] 中
- [ ] 低
EOF
```

## Step 4: コラボレーション設定

### 4.1 Collaborators追加（必要に応じて）
1. Settings → Manage access
2. 「Invite a collaborator」で協力者招待

### 4.2 Labels作成
```
- priority:high (優先度高) - #FF0000
- priority:medium (優先度中) - #FFFF00  
- priority:low (優先度低) - #00FF00
- area:pricing (価格計算) - #0075CA
- area:database (データベース) - #7057FF
- area:ui (UI) - #008672
- country:tajikistan (タジキスタン) - #FF6B6B
- country:uzbekistan (ウズベキスタン) - #4ECDC4
```

## 完了確認
- ✅ リポジトリ作成完了
- ✅ 初回コミット・プッシュ完了
- ✅ ブランチ保護設定完了
- ✅ Issue テンプレート作成完了

**次のステップ**: Supabase連携設定へ進む