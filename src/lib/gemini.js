const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const ENDPOINT =
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'

const PROMPT = `Sen sadece market fişindeki yiyecek ve içecekleri ayıklayan akıllı bir mutfak asistanısın. Görevin görseldeki gıda ürünlerini bulmaktır.
- Fişteki 'KASAR PEY', 'DMTS', 'YMRTA' gibi gıda kısaltmalarını 'Kaşar Peyniri', 'Domates', 'Yumurta' gibi düzgün isimlere genişlet ve listeye ekle.
- Temizlik malzemesi, şampuan, peçete, poşet, pil gibi GIDA DIŞI ürünleri KESİNLİKLE listeye dahil etme, tamamen yok say.
- Her gıdanın türüne göre kaç gün bozulmadan dayanabileceğini 'shelf_life_days' olarak sayı cinsinden ver (Örn: Kaşar için 14, sarımsak için 60, domates için 7).

Yanıtı KESİNLİKLE sadece şu saf JSON formatında döndür, başka hiçbir açıklama ekleme:
[
  {
    "name": "Düzgünleştirilmiş Ürün Adı",
    "category": "Et & Protein veya Süt Ürünleri veya Sebze / Meyve veya Temel Gıda",
    "qty": "Miktar (Örn: 1 Adet, 500 g)",
    "shelf_life_days": 14,
    "status": "fresh"
  }
]`

export async function analyzeInventoryImage(base64Data, mimeType, _scanMode = 'fridge') {
  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: PROMPT },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini API hatası (${res.status}): ${await res.text()}`)
  }

  const json = await res.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini yanıtında metin bulunamadı.')
  }

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}

const RECIPE_PROMPT = (items, servings) =>
  `Sen Mufi adında, evdeki malzemelerle harikalar yaratan samimi ve zeki bir şefsin. Sana verilen şu mutfak envanterini: ${JSON.stringify(items)} ana bileşenler (başroller) olarak kullanarak tam olarak ${servings} kişilik olacak şekilde 3 adet yaratıcı, sıcak ve doyurucu tarif üret.

KRİTİK SANAL KİLER KURALI: Sadece buzdolabındaki taze ürünlerle sınırlı kalıp kısır tarifler (salata, meze vb.) üretmek yerine; her evde her an bulunabileceğini varsaydığımız TEMEL KİLER MALZEMELERİNİ (Makarna, pirinç, mercimek, bulgur, un, salça, sıvı yağ, zeytinyağı, tuz, su ve temel baharatlar vb.) yukarıdaki listede olmasalar bile tariflerine yardımcı malzeme veya karbonhidrat tabanı olarak tamamen ÖZGÜRCE dahil edebilirsin. Böylece doyurucu ana yemekler ortaya çıkar. Malzeme miktarlarını tam olarak bu ${servings} kişiye göre hesapla.

Yanıtı KESİNLİKLE sadece şu JSON formatında döndür, asla markdown kesmeleri (\`\`\`json) veya ekstra metin ekleme:
[
  {
    "title": "Tarif Adı",
    "prepTime": "Hazırlık Süresi (Örn: 30 dk)",
    "ingredients": ["Kişi sayısına göre ayarlanmış malzeme 1", "Malzeme 2"],
    "instructions": ["Adım 1", "Adım 2"],
    "mufiNote": "Mufi'den o tarife özel samimi, neşeli ve iştah açıcı bir şef notu"
  }
]`

export async function generateAIRecipes(inventoryItems, portionCount) {
  const namesOnly = inventoryItems.map((item) => item.name)

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: RECIPE_PROMPT(namesOnly, portionCount) },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini API hatası (${res.status}): ${await res.text()}`)
  }

  const json = await res.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini yanıtında metin bulunamadı.')
  }

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  return JSON.parse(cleaned)
}
