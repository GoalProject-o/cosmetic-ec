// 国別認証・アカウント管理の型定義

export interface CountryAccount {
  id: string
  countryCode: string
  countryName: string
  email: string
  hashedPassword: string
  displayName: string
  role: 'country_admin' | 'country_manager' | 'country_viewer'
  permissions: CountryPermission[]
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  createdBy: string
  timezone: string
  language: 'ja' | 'en' | 'ru' | 'tg' | 'uz' | 'kk' | 'ky'
  currency: string
  profile: {
    firstName: string
    lastName: string
    phone?: string
    address?: string
    notes?: string
  }
}

export interface CountryPermission {
  id: string
  name: string
  resource: 'dashboard' | 'products' | 'orders' | 'customers' | 'settings' | 'reports' | 'analytics'
  actions: ('read' | 'create' | 'update' | 'delete')[]
  countryCode: string
  isActive: boolean
}

export interface AuthSession {
  accountId: string
  countryCode: string
  email: string
  displayName: string
  role: string
  permissions: CountryPermission[]
  expiresAt: Date
  createdAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
  countryCode?: string // オプション：特定の国のアカウントとしてログイン
}

export interface LoginResult {
  success: boolean
  session?: AuthSession
  account?: Omit<CountryAccount, 'hashedPassword'>
  error?: string
  requiresTwoFactor?: boolean
}

// 国別権限管理
export interface CountryAccessControl {
  countryCode: string
  allowedResources: string[]
  allowedActions: Record<string, string[]>
  dataFilters: {
    // その国のデータのみアクセス可能
    restrictToCountry: boolean
    // 特定の顧客グループのみ
    customerGroups?: string[]
    // 特定の商品カテゴリのみ
    productCategories?: string[]
  }
}

// デフォルトの国別権限設定
export const DEFAULT_COUNTRY_PERMISSIONS: Record<string, CountryPermission[]> = {
  'TJ': [ // タジキスタン
    {
      id: 'tj-dashboard-read',
      name: 'ダッシュボード閲覧',
      resource: 'dashboard',
      actions: ['read'],
      countryCode: 'TJ',
      isActive: true
    },
    {
      id: 'tj-products-manage',
      name: '商品管理',
      resource: 'products',
      actions: ['read', 'create', 'update'],
      countryCode: 'TJ',
      isActive: true
    },
    {
      id: 'tj-orders-manage',
      name: '注文管理',
      resource: 'orders',
      actions: ['read', 'update'],
      countryCode: 'TJ',
      isActive: true
    },
    {
      id: 'tj-customers-manage',
      name: '顧客管理',
      resource: 'customers',
      actions: ['read', 'create', 'update'],
      countryCode: 'TJ',
      isActive: true
    },
    {
      id: 'tj-settings-basic',
      name: '基本設定',
      resource: 'settings',
      actions: ['read', 'update'],
      countryCode: 'TJ',
      isActive: true
    },
    {
      id: 'tj-reports-view',
      name: 'レポート閲覧',
      resource: 'reports',
      actions: ['read'],
      countryCode: 'TJ',
      isActive: true
    }
  ],
  'UZ': [ // ウズベキスタン - 同様の権限構造
    {
      id: 'uz-dashboard-read',
      name: 'ダッシュボード閲覧',
      resource: 'dashboard',
      actions: ['read'],
      countryCode: 'UZ',
      isActive: true
    },
    // ... 他の権限も同様に定義
  ]
}