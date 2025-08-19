# Supabase連携設定ガイド

## 🎯 Supabase導入の目的
- **データ永続化**: LocalStorage→PostgreSQLデータベース
- **リアルタイム同期**: 複数端末での同期
- **認証システム**: 国別アカウント管理
- **スケーラビリティ**: 大規模データ対応

## Step 1: Supabaseプロジェクト作成

### 1.1 アカウント作成・ログイン
1. https://supabase.com にアクセス
2. 「Start your project」クリック
3. GitHubアカウントでサインアップ（推奨）

### 1.2 新規プロジェクト作成
1. ダッシュボードで「New project」クリック
2. 以下設定で作成：
   ```
   Organization: 個人アカウント
   Name: TJ-Cosmetics-System
   Database Password: [強固なパスワード生成・保存]
   Region: Northeast Asia (Tokyo) - ap-northeast-1
   Pricing Plan: Free tier ($0/month)
   ```

### 1.3 プロジェクト情報取得
プロジェクト作成後（2-3分待機）、以下情報をコピー・保存：
```
Project URL: https://[プロジェクトID].supabase.co
API Key (anon public): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API Key (service_role): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: データベーススキーマ設定

### 2.1 SQL Editorでテーブル作成
1. Supabaseダッシュボード→「SQL Editor」
2. 「New query」で以下SQLを実行：

```sql
-- 1. 商品カテゴリーテーブル
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  name_local JSONB, -- {"ru": "Название", "tg": "Ном"}
  hs_code VARCHAR(20) NOT NULL,
  tariff_rate DECIMAL(5,2) DEFAULT 0,
  parent_id UUID REFERENCES product_categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 商品マスターテーブル
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name JSONB NOT NULL, -- {"ja": "商品名", "ru": "Название", "tg": "Номи мол"}
  description JSONB,
  category_id UUID REFERENCES product_categories(id),
  brand VARCHAR(100),
  manufacturer VARCHAR(100),
  purchase_price DECIMAL(10,2) NOT NULL,
  weight DECIMAL(8,3) NOT NULL, -- kg
  dimensions JSONB, -- {"length": 10, "width": 5, "height": 15}
  images JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft',
  target_countries TEXT[] DEFAULT '{}', -- {'TJ', 'UZ', 'KZ'}
  country_specific_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. 国別価格計算結果テーブル
CREATE TABLE country_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL, -- 'TJ', 'UZ', 'KZ', 'KG'
  calculated_price DECIMAL(10,2) NOT NULL,
  profit_margin DECIMAL(5,2) NOT NULL,
  total_taxes DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) NOT NULL,
  calculation_details JSONB, -- 詳細計算内訳保存
  items_per_package INTEGER,
  package_shipping_cost DECIMAL(10,2),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, country_code)
);

-- 4. 国別設定テーブル
CREATE TABLE country_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code VARCHAR(2) UNIQUE NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  local_name VARCHAR(100),
  currency VARCHAR(3) NOT NULL,
  flag_emoji VARCHAR(10),
  exchange_rate DECIMAL(10,6) NOT NULL,
  timezone VARCHAR(50),
  language VARCHAR(5),
  
  -- 税金設定
  tax_rates JSONB NOT NULL, -- {"vat": 12.0, "customs_duty": 8.0, "import_tax": 3.0}
  
  -- 手数料設定
  fee_settings JSONB NOT NULL, -- {"handling_fee": 500, "admin_fee_rate": 1.5}
  
  -- 配送設定  
  shipping_settings JSONB NOT NULL, -- {"max_weight": 20, "base_cost": 39800}
  
  -- 梱包費用設定
  packaging_costs JSONB NOT NULL, -- {"large_box": 300, "bubble_wrap": 50}
  
  -- 追加費用設定
  additional_costs JSONB, -- {"insurance_rate": 1.5, "storage_fee": 50}
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 価格計算履歴テーブル
CREATE TABLE pricing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,
  calculation_version VARCHAR(20), -- 'v2.0-package-based'
  input_parameters JSONB NOT NULL,
  calculation_result JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_country_pricing_product ON country_pricing(product_id);
CREATE INDEX idx_country_pricing_country ON country_pricing(country_code);
CREATE INDEX idx_pricing_history_product ON pricing_history(product_id);
```

### 2.2 Row Level Security (RLS) 設定
```sql
-- RLS有効化
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_history ENABLE ROW LEVEL SECURITY;

-- マスター管理者：全データアクセス可能
CREATE POLICY "master_admin_full_access" ON products
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'master_admin'
  );

-- 国別管理者：自国データのみアクセス可能  
CREATE POLICY "country_admin_access" ON country_pricing
  FOR ALL USING (
    country_code = (auth.jwt() ->> 'country_code') OR
    (auth.jwt() ->> 'role') = 'master_admin'
  );

-- 同様のポリシーを他テーブルにも適用
CREATE POLICY "country_settings_access" ON country_settings
  FOR ALL USING (
    country_code = (auth.jwt() ->> 'country_code') OR  
    (auth.jwt() ->> 'role') = 'master_admin'
  );
```

### 2.3 初期データ投入
```sql
-- カテゴリーデータ
INSERT INTO product_categories (name, hs_code, tariff_rate) VALUES
('スキンケア', '3304.99.00', 8.0),
('メイクアップ', '3304.20.00', 10.0),
('香水・フレグランス', '3303.00.00', 12.0),
('サプリメント', '2106.90.92', 15.0),
('食品・スナック', '1905.90.45', 12.0);

-- 国別設定データ（タジキスタン）
INSERT INTO country_settings (
  country_code, country_name, local_name, currency, flag_emoji,
  exchange_rate, timezone, language,
  tax_rates, fee_settings, shipping_settings, packaging_costs
) VALUES (
  'TJ', 'タジキスタン', 'Тоҷикистон', 'TJS', '🇹🇯',
  0.071, 'Asia/Dushanbe', 'tg',
  '{"vat": 18.0, "customs_duty": 8.0, "import_tax": 5.0, "environmental_tax": 300}',
  '{"handling_fee": 800, "admin_fee_rate": 1.5, "document_fee": 1500}',
  '{"max_weight": 20, "base_cost": 39800, "method": "international_parcel"}',
  '{"large_box": 300, "bubble_wrap": 50, "tape": 30, "fragile_stickers": 20}'
);
```

## Step 3: ローカル環境設定

### 3.1 依存関係インストール
```bash
cd "C:\Users\kozoz\Desktop\dev\tajik\tajik-dairi"

# Supabase JavaScript クライアント
npm install @supabase/supabase-js

# 認証関連
npm install @supabase/auth-ui-react @supabase/auth-ui-shared

# 開発ツール（オプション）
npm install -D @supabase/cli
```

### 3.2 環境変数設定
```bash
# .env.localファイル作成・編集
echo "# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[あなたのプロジェクトID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[あなたのanon public key]
SUPABASE_SERVICE_ROLE_KEY=[あなたのservice role key]

# Local Development
NODE_ENV=development" >> .env.local
```

### 3.3 Supabaseクライアント設定
```typescript
// src/lib/supabase/client.ts 作成
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// タイプ定義
export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          sku: string
          name: Record<string, string>
          purchase_price: number
          weight: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          sku: string
          name: Record<string, string>
          purchase_price: number
          weight: number
          status?: string
        }
        Update: {
          sku?: string
          name?: Record<string, string>
          purchase_price?: number
          weight?: number
          status?: string
        }
      }
      // 他のテーブル定義...
    }
  }
}
```

## Step 4: 認証システム統合

### 4.1 認証設定（Supabaseダッシュボード）
1. Authentication → Settings
2. Site URL: `http://localhost:3005`
3. Redirect URLs: `http://localhost:3005/auth/callback`

### 4.2 カスタム認証フロー
```typescript
// src/lib/auth/supabase-auth.ts
import { supabase } from '../supabase/client'

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  return data
}

export const signUpWithRole = async (
  email: string, 
  password: string, 
  role: string,
  countryCode?: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        country_code: countryCode
      }
    }
  })
  
  if (error) throw error
  return data
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

## Step 5: データ移行計画

### 5.1 LocalStorageからSupabaseへの移行
```typescript
// src/lib/migration/data-migration.ts
import { supabase } from '../supabase/client'

export const migrateLocalStorageToSupabase = async () => {
  // 1. LocalStorageから既存データ取得
  const localProducts = JSON.parse(localStorage.getItem('tj-cosmetics-products') || '[]')
  
  // 2. Supabaseに商品データ移行
  for (const product of localProducts) {
    const { error } = await supabase
      .from('products')
      .insert({
        sku: product.sku,
        name: product.name,
        purchase_price: product.purchasePrice,
        weight: product.weight,
        status: product.status
      })
    
    if (error) console.error('Migration error:', error)
  }
  
  // 3. 価格計算データ移行
  // ...
  
  console.log('Migration completed!')
}
```

## 完了確認チェックリスト
- ✅ Supabaseプロジェクト作成
- ✅ データベーススキーマ作成
- ✅ RLS設定完了
- ✅ 初期データ投入
- ✅ ローカル環境設定
- ✅ 認証システム準備
- ✅ データ移行準備

**推定作業時間**: 2-3時間
**難易度**: 中級

## 次のステップ
1. GitHub連携完了後、Supabase連携実装
2. LocalStorageからの段階的移行
3. 認証システム統合
4. リアルタイム同期実装