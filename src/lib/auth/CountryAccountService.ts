// 国別アカウント管理サービス
import { 
  CountryAccount, 
  CountryPermission, 
  AuthSession, 
  LoginCredentials, 
  LoginResult,
  CountryAccessControl,
  DEFAULT_COUNTRY_PERMISSIONS
} from '@/types/auth'

export class CountryAccountService {
  private static readonly ACCOUNTS_KEY = 'tj-country-accounts'
  private static readonly SESSIONS_KEY = 'tj-country-sessions'
  private static readonly CURRENT_SESSION_KEY = 'tj-current-session'

  // デフォルトアカウントの生成
  private static getDefaultAccounts(): CountryAccount[] {
    return [
      {
        id: 'tj-admin-001',
        countryCode: 'TJ',
        countryName: 'タジキスタン',
        email: 'admin@tajikistan.tj-cosmetics.com',
        hashedPassword: this.hashPassword('tajikistan2024'), // 本番環境では適切なハッシュ化が必要
        displayName: 'タジキスタン管理者',
        role: 'country_admin',
        permissions: DEFAULT_COUNTRY_PERMISSIONS['TJ'] || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        timezone: 'Asia/Dushanbe',
        language: 'ja',
        currency: 'TJS',
        profile: {
          firstName: 'タジキスタン',
          lastName: '管理者',
          phone: '+992-000-000-000',
          address: 'ドゥシャンベ, タジキスタン',
          notes: 'タジキスタン地域の代表管理者アカウント'
        }
      },
      {
        id: 'uz-admin-001',
        countryCode: 'UZ',
        countryName: 'ウズベキスタン',
        email: 'admin@uzbekistan.tj-cosmetics.com',
        hashedPassword: this.hashPassword('uzbekistan2024'),
        displayName: 'ウズベキスタン管理者',
        role: 'country_admin',
        permissions: DEFAULT_COUNTRY_PERMISSIONS['UZ'] || [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        timezone: 'Asia/Tashkent',
        language: 'uz',
        currency: 'UZS',
        profile: {
          firstName: 'ウズベキスタン',
          lastName: '管理者',
          phone: '+998-000-000-000',
          address: 'タシュケント, ウズベキスタン',
          notes: 'ウズベキスタン地域の代表管理者アカウント'
        }
      }
    ]
  }

  // 簡易ハッシュ化 (本番環境では bcrypt 等を使用)
  private static hashPassword(password: string): string {
    // 本番環境では適切な暗号化ライブラリを使用
    return btoa(password + 'tj-cosmetics-salt-2024')
  }

  // パスワード検証
  private static verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword
  }

  // アカウント取得
  static getAccounts(): CountryAccount[] {
    try {
      const stored = localStorage.getItem(this.ACCOUNTS_KEY)
      if (stored) {
        const accounts = JSON.parse(stored)
        return accounts.map((account: any) => ({
          ...account,
          createdAt: new Date(account.createdAt),
          updatedAt: new Date(account.updatedAt),
          lastLogin: account.lastLogin ? new Date(account.lastLogin) : undefined
        }))
      }
    } catch (error) {
      console.error('アカウント読み込みエラー:', error)
    }

    // デフォルトアカウントを設定
    const defaultAccounts = this.getDefaultAccounts()
    this.saveAccounts(defaultAccounts)
    return defaultAccounts
  }

  // アカウント保存
  static saveAccounts(accounts: CountryAccount[]): void {
    try {
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts))
    } catch (error) {
      console.error('アカウント保存エラー:', error)
    }
  }

  // 特定の国のアカウントを取得
  static getAccountsByCountry(countryCode: string): CountryAccount[] {
    return this.getAccounts().filter(account => account.countryCode === countryCode)
  }

  // メールでアカウントを検索
  static getAccountByEmail(email: string): CountryAccount | null {
    const accounts = this.getAccounts()
    return accounts.find(account => account.email === email) || null
  }

  // ログイン処理
  static async login(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const account = this.getAccountByEmail(credentials.email)
      
      if (!account) {
        return { success: false, error: 'アカウントが見つかりません' }
      }

      if (!account.isActive) {
        return { success: false, error: 'アカウントが無効化されています' }
      }

      // 特定の国コードが指定されている場合のチェック
      if (credentials.countryCode && account.countryCode !== credentials.countryCode) {
        return { success: false, error: '指定された国のアカウントではありません' }
      }

      // パスワード検証
      if (!this.verifyPassword(credentials.password, account.hashedPassword)) {
        return { success: false, error: 'パスワードが正しくありません' }
      }

      // セッション作成
      const session: AuthSession = {
        accountId: account.id,
        countryCode: account.countryCode,
        email: account.email,
        displayName: account.displayName,
        role: account.role,
        permissions: account.permissions,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8時間後
        createdAt: new Date()
      }

      // セッション保存
      this.saveSession(session)

      // 最終ログイン時刻を更新
      account.lastLogin = new Date()
      account.updatedAt = new Date()
      const accounts = this.getAccounts()
      const accountIndex = accounts.findIndex(a => a.id === account.id)
      if (accountIndex !== -1) {
        accounts[accountIndex] = account
        this.saveAccounts(accounts)
      }

      return {
        success: true,
        session,
        account: {
          id: account.id,
          countryCode: account.countryCode,
          countryName: account.countryName,
          email: account.email,
          displayName: account.displayName,
          role: account.role,
          permissions: account.permissions,
          isActive: account.isActive,
          lastLogin: account.lastLogin,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
          createdBy: account.createdBy,
          timezone: account.timezone,
          language: account.language,
          currency: account.currency,
          profile: account.profile
        }
      }
    } catch (error) {
      console.error('ログインエラー:', error)
      return { success: false, error: 'ログイン処理でエラーが発生しました' }
    }
  }

  // セッション保存
  static saveSession(session: AuthSession): void {
    try {
      localStorage.setItem(this.CURRENT_SESSION_KEY, JSON.stringify(session))
      
      // セッション履歴も保存
      const sessions = this.getSessions()
      sessions.push(session)
      // 最新の10セッションのみ保持
      const recentSessions = sessions.slice(-10)
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(recentSessions))
    } catch (error) {
      console.error('セッション保存エラー:', error)
    }
  }

  // 現在のセッション取得
  static getCurrentSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_SESSION_KEY)
      if (stored) {
        const session = JSON.parse(stored)
        const sessionObj = {
          ...session,
          expiresAt: new Date(session.expiresAt),
          createdAt: new Date(session.createdAt)
        }

        // セッション有効期限チェック
        if (sessionObj.expiresAt < new Date()) {
          this.logout()
          return null
        }

        return sessionObj
      }
    } catch (error) {
      console.error('セッション読み込みエラー:', error)
    }
    return null
  }

  // セッション履歴取得
  static getSessions(): AuthSession[] {
    try {
      const stored = localStorage.getItem(this.SESSIONS_KEY)
      if (stored) {
        return JSON.parse(stored).map((session: any) => ({
          ...session,
          expiresAt: new Date(session.expiresAt),
          createdAt: new Date(session.createdAt)
        }))
      }
    } catch (error) {
      console.error('セッション履歴読み込みエラー:', error)
    }
    return []
  }

  // ログアウト
  static logout(): void {
    try {
      localStorage.removeItem(this.CURRENT_SESSION_KEY)
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  // 権限チェック
  static hasPermission(resource: string, action: string, countryCode?: string): boolean {
    const session = this.getCurrentSession()
    if (!session) return false

    // 国コードチェック
    if (countryCode && session.countryCode !== countryCode) return false

    return session.permissions.some(permission => 
      permission.resource === resource && 
      permission.actions.includes(action as any) &&
      permission.isActive
    )
  }

  // 国別アクセス制御設定
  static getAccessControl(countryCode: string): CountryAccessControl {
    return {
      countryCode,
      allowedResources: ['dashboard', 'products', 'orders', 'customers', 'settings', 'reports'],
      allowedActions: {
        dashboard: ['read'],
        products: ['read', 'create', 'update'],
        orders: ['read', 'update'],
        customers: ['read', 'create', 'update'],
        settings: ['read', 'update'],
        reports: ['read']
      },
      dataFilters: {
        restrictToCountry: true,
        customerGroups: [`${countryCode.toLowerCase()}-customers`],
        productCategories: [`${countryCode.toLowerCase()}-products`]
      }
    }
  }

  // アカウント作成
  static createAccount(accountData: Omit<CountryAccount, 'id' | 'createdAt' | 'updatedAt'>): CountryAccount {
    const newAccount: CountryAccount = {
      ...accountData,
      id: `${accountData.countryCode.toLowerCase()}-${Date.now()}`,
      hashedPassword: this.hashPassword(accountData.hashedPassword), // 平文パスワードをハッシュ化
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const accounts = this.getAccounts()
    accounts.push(newAccount)
    this.saveAccounts(accounts)

    return newAccount
  }

  // アカウント更新
  static updateAccount(accountId: string, updates: Partial<CountryAccount>): boolean {
    try {
      const accounts = this.getAccounts()
      const accountIndex = accounts.findIndex(a => a.id === accountId)
      
      if (accountIndex === -1) return false

      accounts[accountIndex] = {
        ...accounts[accountIndex],
        ...updates,
        updatedAt: new Date()
      }

      this.saveAccounts(accounts)
      return true
    } catch (error) {
      console.error('アカウント更新エラー:', error)
      return false
    }
  }

  // 認証状態チェック
  static isAuthenticated(): boolean {
    return this.getCurrentSession() !== null
  }

  // 認証されたユーザーの国コード取得
  static getCurrentCountryCode(): string | null {
    const session = this.getCurrentSession()
    return session ? session.countryCode : null
  }
}