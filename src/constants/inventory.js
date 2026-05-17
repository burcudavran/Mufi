export const INVENTORY_CATEGORIES = [
  { id: 'meat', label: 'Et & Tavuk' },
  { id: 'dairy', label: 'Süt Ürünleri' },
  { id: 'produce', label: 'Sebze / Meyve' },
  { id: 'pantry', label: 'Temel Gıda' },
]

function daysFromNow(days) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const MOCK_INVENTORY = [
  {
    id: '1',
    name: 'Tavuk göğsü',
    quantity: '400 g',
    expiryDate: daysFromNow(1),
    category: 'meat',
    storage: 'fridge',
  },
  {
    id: '2',
    name: 'Yoğurt',
    quantity: '500 g',
    expiryDate: daysFromNow(2),
    category: 'dairy',
    storage: 'fridge',
  },
  {
    id: '3',
    name: 'Süt',
    quantity: '1 L',
    expiryDate: daysFromNow(5),
    category: 'dairy',
    storage: 'fridge',
  },
  {
    id: '4',
    name: 'Domates',
    quantity: '6 adet',
    expiryDate: daysFromNow(4),
    category: 'produce',
    storage: 'fridge',
  },
  {
    id: '5',
    name: 'Makarna',
    quantity: '500 g',
    expiryDate: daysFromNow(120),
    category: 'pantry',
    storage: 'fridge',
  },
  {
    id: '6',
    name: 'Dana kıyma',
    quantity: '500 g',
    expiryDate: daysFromNow(60),
    category: 'meat',
    storage: 'freezer',
  },
  {
    id: '7',
    name: 'Bezelye',
    quantity: '400 g',
    expiryDate: daysFromNow(180),
    category: 'produce',
    storage: 'freezer',
  },
]

export const MOCK_AI_INSIGHT =
  'Yoğurt tüketim hızınıza göre bitmek üzere olabilir, kontrol edelim mi?'
