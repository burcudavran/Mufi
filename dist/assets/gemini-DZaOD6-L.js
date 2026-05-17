var e=`AIzaSyAwmHIAJsNDkHRK2waKFILQVQSw-gUCq8w`,t=`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`,n=`Sen sadece market fişindeki yiyecek ve içecekleri ayıklayan akıllı bir mutfak asistanısın. Görevin görseldeki gıda ürünlerini bulmaktır.
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
]`;async function r(r,i,a=`fridge`){let o=await fetch(`${t}?key=${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{inlineData:{data:r,mimeType:i}},{text:n}]}]})});if(!o.ok)throw Error(`Gemini API hatası (${o.status}): ${await o.text()}`);let s=(await o.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!s)throw Error(`Gemini yanıtında metin bulunamadı.`);let c=s.replace(/```json\s*/g,``).replace(/```\s*/g,``).trim();return JSON.parse(c)}var i=(e,t)=>`Sen Mufi adında, evdeki malzemelerle harikalar yaratan samimi ve zeki bir şefsin. Sana verilen şu mutfak envanterini: ${JSON.stringify(e)} ana bileşenler (başroller) olarak kullanarak tam olarak ${t} kişilik olacak şekilde 3 adet yaratıcı, sıcak ve doyurucu tarif üret.

KRİTİK SANAL KİLER KURALI: Sadece buzdolabındaki taze ürünlerle sınırlı kalıp kısır tarifler (salata, meze vb.) üretmek yerine; her evde her an bulunabileceğini varsaydığımız TEMEL KİLER MALZEMELERİNİ (Makarna, pirinç, mercimek, bulgur, un, salça, sıvı yağ, zeytinyağı, tuz, su ve temel baharatlar vb.) yukarıdaki listede olmasalar bile tariflerine yardımcı malzeme veya karbonhidrat tabanı olarak tamamen ÖZGÜRCE dahil edebilirsin. Böylece doyurucu ana yemekler ortaya çıkar. Malzeme miktarlarını tam olarak bu ${t} kişiye göre hesapla.

Yanıtı KESİNLİKLE sadece şu JSON formatında döndür, asla markdown kesmeleri (\`\`\`json) veya ekstra metin ekleme:
[
  {
    "title": "Tarif Adı",
    "prepTime": "Hazırlık Süresi (Örn: 30 dk)",
    "ingredients": ["Kişi sayısına göre ayarlanmış malzeme 1", "Malzeme 2"],
    "instructions": ["Adım 1", "Adım 2"],
    "mufiNote": "Mufi'den o tarife özel samimi, neşeli ve iştah açıcı bir şef notu"
  }
]`;async function a(n,r){let a=n.map(e=>e.name),o=await fetch(`${t}?key=${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:i(a,r)}]}]})});if(!o.ok)throw Error(`Gemini API hatası (${o.status}): ${await o.text()}`);let s=(await o.json()).candidates?.[0]?.content?.parts?.[0]?.text;if(!s)throw Error(`Gemini yanıtında metin bulunamadı.`);let c=s.replace(/```json\s*/g,``).replace(/```\s*/g,``).trim();return JSON.parse(c)}export{a as n,r as t};