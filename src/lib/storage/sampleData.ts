// サンプルデータ
import { ProductListItem } from '@/types/product'

export const sampleProducts: ProductListItem[] = [
  {
    id: 'sample-1',
    sku: 'DHC-OLIVE-001',
    name: {
      ja: 'DHC オリーブオイル クレンジング',
      ru: 'DHC Оливковое масло для снятия макияжа',
      tg: 'DHC равғани зайтун барои пок кардани макияж'
    },
    category: {
      id: 'cosmetics-skincare',
      name: 'スキンケア',
      hsCode: '3304.99.00',
      tariffRate: 8
    },
    brand: 'DHC',
    manufacturer: '株式会社DHC',
    status: 'active',
    purchasePrice: 1200,
    calculatedPrice: 4680,
    profitMargin: 30,
    weight: 0.15,
    images: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'sample-2',
    sku: 'SHISEIDO-FACE-001',
    name: {
      ja: '資生堂 アネッサ パーフェクトUV スキンケアミルク',
      ru: 'Shiseido Anessa Perfect UV Skincare Milk',
      tg: 'Shiseido Anessa UV нигоҳдорандаи пӯст'
    },
    category: {
      id: 'cosmetics-skincare',
      name: 'スキンケア',
      hsCode: '3304.99.00',
      tariffRate: 8
    },
    brand: '資生堂',
    manufacturer: '株式会社資生堂',
    status: 'active',
    purchasePrice: 2800,
    calculatedPrice: 8960,
    profitMargin: 25,
    weight: 0.08,
    images: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'sample-3',
    sku: 'LOTTE-CHOCO-001',
    name: {
      ja: 'ロッテ ガーナミルクチョコレート',
      ru: 'Lotte Ghana Milk Chocolate',
      tg: 'Lotte Ghana шоколади ширин'
    },
    category: {
      id: 'food-snacks',
      name: '食品・スナック',
      hsCode: '1905.90.45',
      tariffRate: 12
    },
    brand: 'ロッテ',
    manufacturer: '株式会社ロッテ',
    status: 'active',
    purchasePrice: 350,
    calculatedPrice: 1260,
    profitMargin: 35,
    weight: 0.05,
    images: [],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'sample-4',
    sku: 'KRACIE-MASK-001',
    name: {
      ja: 'クラシエ 肌美精 うるおい浸透マスク',
      ru: 'Kracie Hadabisei Увлажняющая маска',
      tg: 'Kracie Hadabisei ниқоби намнокӣ'
    },
    category: {
      id: 'cosmetics-skincare',
      name: 'スキンケア',
      hsCode: '3304.99.00',
      tariffRate: 8
    },
    brand: 'クラシエ',
    manufacturer: 'クラシエホームプロダクツ株式会社',
    status: 'draft',
    purchasePrice: 660,
    calculatedPrice: 3692,
    profitMargin: 30,
    weight: 0.4,
    images: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: 'sample-5',
    sku: 'POKKA-TEA-001',
    name: {
      ja: 'ポッカサッポロ 伊右衛門 緑茶',
      ru: 'Pokka Sapporo Iemon Зеленый чай',
      tg: 'Pokka Sapporo Iemon чойи сабз'
    },
    category: {
      id: 'beverages',
      name: '飲料',
      hsCode: '2202.99.00',
      tariffRate: 15
    },
    brand: 'ポッカサッポロ',
    manufacturer: 'ポッカサッポロフード&ビバレッジ株式会社',
    status: 'inactive',
    purchasePrice: 150,
    weight: 0.5,
    images: [],
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-10')
  }
]

export function loadSampleData(): void {
  // 既存データがない場合のみサンプルデータを読み込み
  const existingProducts = JSON.parse(localStorage.getItem('tj-cosmetics-products') || '[]')
  
  if (existingProducts.length === 0) {
    localStorage.setItem('tj-cosmetics-products', JSON.stringify(sampleProducts))
    console.log('サンプルデータを読み込みました')
  }
}