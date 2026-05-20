const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent'

// ---------- rate limiter + retry (429/503 için) ----------
let lastRequest = 0

async function fetchWithRetry(url, options, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const now = Date.now()
    const elapsed = now - lastRequest
    const minGap = 2_000
    if (elapsed < minGap) {
      await new Promise((r) => setTimeout(r, minGap - elapsed))
    }
    lastRequest = Date.now()

    const res = await fetch(url, options)

    if (res.ok) return res

    if ((res.status === 429 || res.status === 503) && attempt < retries) {
      const wait = (attempt + 1) * 3_000
      console.warn(`Gemini ${res.status}, ${wait / 1000}s bekleniyor (deneme ${attempt + 1}/${retries})...`)
      await new Promise((r) => setTimeout(r, wait))
      continue
    }

    throw new Error(`Gemini API hatası (${res.status}): ${await res.text()}`)
  }

  throw new Error('Gemini API çok yoğun, lütfen daha sonra tekrar dene.')
}

// ---------- promptlar ----------
const FRIDGE_PROMPT = `Sen bir mutfak asistanısın. Görevin buzdolabı/raf fotoğrafındaki TÜM yiyecek ve içecekleri tek tek listelemektir.
- Görselde ne kadar çok ürün varsa hepsini sırala, hiçbirini atlama.
- Marka adını da ürün adına ekle (Örn: "Sütaş Yoğurt", "Pınar Süt").
- Görünür miktarı tahmin et (Örn: "2 Adet", "500 ml", "1 kg").
- Her gıdanın türüne göre kaç gün bozulmadan dayanabileceğini 'shelf_life_days' olarak sayı cinsinden ver.
- GIDA DIŞI ürünleri (temizlik malzemesi, sünger, poşet vb.) listeye ekleme.

Yanıtı KESİNLİKLE sadece JSON formatında döndür:
[
  {
    "name": "Ürün Adı",
    "category": "Et & Protein veya Süt Ürünleri veya Sebze / Meyve veya Temel Gıda",
    "qty": "Miktar",
    "shelf_life_days": 14,
    "status": "fresh"
  }
]`

const RECEIPT_PROMPT = `Sen sadece market fişindeki yiyecek ve içecekleri ayıklayan akıllı bir mutfak asistanısın. Görevin görseldeki gıda ürünlerini bulmaktır.
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

async function callGemini(prompt, base64Data, mimeType) {
  const res = await fetchWithRetry(`${GEMINI_ENDPOINT}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt },
          ],
        },
      ],
    }),
  })

  const json = await res.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini yanıtında metin bulunamadı.')
  }

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`Gemini yanıtı çözülemedi: ${cleaned.slice(0, 200)}`)
  }
}

export async function analyzeInventoryImage(base64Data, mimeType, scanMode = 'fridge') {
  const prompt = scanMode === 'receipt' ? RECEIPT_PROMPT : FRIDGE_PROMPT
  return callGemini(prompt, base64Data, mimeType)
}

const RECIPE_PROMPT = (items, servings, dietType, allergens) => {
  const dietRule = dietType
    ? `- Kullanıcının diyeti: ${dietType}. Bu diyete KESİNLİKLE uygun tarifler üret. Örneğin "Vejetaryen" ise et/tavuk/balık içeren tarif ÜRETME. "Vegan" ise hiçbir hayvansal ürün kullanma. "Ketojenik" ise düşük karbonhidratlı tarifler üret.`
    : ''

  const allergenRule =
    allergens && allergens.length > 0
      ? `- Kullanıcının alerjileri: ${allergens.join(', ')}. Bu alerjenleri İÇEREN HİÇBİR malzeme kullanma. Örneğin "Süt" alerjisi varsa süt, peynir, yoğurt, krema, tereyağı gibi hiçbir süt ürünü kullanma.`
      : ''

  return `Sen Mufi adında, evdeki malzemelerle harikalar yaratan samimi ve zeki bir şefsin. Sana verilen şu mutfak envanterini: ${JSON.stringify(items)} ana bileşenler (başroller) olarak kullanarak tam olarak ${servings} kişilik olacak şekilde 3 adet yaratıcı, sıcak ve doyurucu tarif üret.

KRİTİK SANAL KİLER KURALI: Sadece buzdolabındaki taze ürünlerle sınırlı kalıp kısır tarifler (salata, meze vb.) üretmek yerine; her evde her an bulunabileceğini varsaydığımız TEMEL KİLER MALZEMELERİNİ (Makarna, pirinç, mercimek, bulgur, un, salça, sıvı yağ, zeytinyağı, tuz, su ve temel baharatlar vb.) yukarıdaki listede olmasalar bile tariflerine yardımcı malzeme veya karbonhidrat tabanı olarak tamamen ÖZGÜRCE dahil edebilirsin. Böylece doyurucu ana yemekler ortaya çıkar. Malzeme miktarlarını tam olarak bu ${servings} kişiye göre hesapla.

${dietRule}
${allergenRule}

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
}

export async function generateAIRecipes(inventoryItems, portionCount, profile = null) {
  const namesOnly = inventoryItems.map((item) => item.name)
  const dietType = profile?.diet_type ?? null
  const allergens = [
    ...(profile?.allergens ?? []),
    ...(profile?.custom_allergens ? profile.custom_allergens.split(',').map((a) => a.trim()).filter(Boolean) : []),
  ]

  const res = await fetchWithRetry(`${GEMINI_ENDPOINT}?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: RECIPE_PROMPT(namesOnly, portionCount, dietType, allergens) },
          ],
        },
      ],
    }),
  })

  const json = await res.json()
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini yanıtında metin bulunamadı.')
  }

  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    throw new Error(`Gemini tarif yanıtı çözülemedi: ${cleaned.slice(0, 200)}`)
  }
}
