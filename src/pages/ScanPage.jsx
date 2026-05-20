import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { AlertCircle, Camera, Receipt, Refrigerator, X } from 'lucide-react'
import { useMufi } from '../context/MufiContext'
import { analyzeInventoryImage } from '../lib/gemini'

const CATEGORY_MAP = {
  'Et & Protein': 'meat',
  'Süt Ürünleri': 'dairy',
  'Sebze / Meyve': 'produce',
  'Temel Gıda': 'pantry',
}

const MODE_BUTTONS = [
  {
    id: 'fridge',
    label: 'Buzdolabını Tara',
    icon: Refrigerator,
    desc: 'Şef, dolapta ne var ne yok bir bakalım mı?',
  },
  {
    id: 'receipt',
    label: 'Fişi Okut',
    icon: Receipt,
    desc: 'Marketten neler aldın? Fişini göster, gerisini Mufi\'ye bırak!',
  },
]

export default function ScanPage() {
  const { setInventory } = useMufi()
  const [scanMode, setScanMode] = useState('fridge')
  const [isScanning, setIsScanning] = useState(false)
  const [pendingItems, setPendingItems] = useState(null)
  const [skippedCount, setSkippedCount] = useState(0)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const activeMode = MODE_BUTTONS.find((m) => m.id === scanMode)

  async function handleScan(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsScanning(true)
    setPendingItems(null)
    setError(null)

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const raw = await analyzeInventoryImage(base64, file.type, scanMode)

      const skipped = raw.filter((item) => !(item.category in CATEGORY_MAP))
      const mapped = raw
        .filter((item) => item.category in CATEGORY_MAP)
        .map((item) => {
          const expiryDate = new Date()
          expiryDate.setDate(expiryDate.getDate() + (item.shelf_life_days || 7))
          const id = crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)
          return {
            id,
            name: item.name,
            category: CATEGORY_MAP[item.category],
            expiryDate: expiryDate.toISOString().slice(0, 10),
            quantity: item.qty,
            storage: 'fridge',
          }
        })

      if (!mapped.length && skipped.length) {
        setError(`Mufi ürünleri tanımlayamadı (kategori eşleşmedi). Farklı bir açıdan tekrar dene.`)
        return
      }

      setPendingItems(mapped)
      setSkippedCount(skipped.length)
    } catch (err) {
      setError(err.message || 'Görsel analiz edilemedi.')
    } finally {
      setIsScanning(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleRemovePending(id) {
    setPendingItems((prev) => prev.filter((item) => item.id !== id))
  }

  function handleConfirm() {
    if (!pendingItems || pendingItems.length === 0) return
    setInventory((prev) => [...pendingItems, ...prev])
    setPendingItems(null)
    setSkippedCount(0)
  }

  function handleCancel() {
    setPendingItems(null)
    setSkippedCount(0)
  }

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 shadow-card"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="mb-5 flex gap-2">
        {MODE_BUTTONS.map((mode) => {
          const Icon = mode.icon
          const isActive = scanMode === mode.id
          return (
            <motion.button
              key={mode.id}
              onClick={() => setScanMode(mode.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                isActive
                  ? 'bg-mufi-accent text-white shadow-sm'
                  : 'bg-mufi-bg text-mufi-tertiary ring-1 ring-mufi-border hover:text-mufi-secondary'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {mode.label}
            </motion.button>
          )
        })}
      </div>

      {pendingItems ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="mb-1 text-[15px] font-semibold text-mufi-label">
            Mufi Bunları Tespit Etti, Onaylıyor musun? 🔍
          </p>
          {skippedCount > 0 && (
            <p className="mb-4 text-[12px] text-amber-600">
              {skippedCount} ürün kategorisi tanınamadığı için atlandı.
            </p>
          )}

          <ul className="space-y-2">
            {pendingItems.map((item) => (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 }}
                className="flex items-center justify-between gap-3 rounded-2xl bg-mufi-bg px-3.5 py-3 ring-1 ring-mufi-border"
              >
                <div>
                  <p className="text-[14px] font-medium text-mufi-label">
                    {item.name}
                  </p>
                  <p className="text-[12px] text-mufi-tertiary">
                    {item.quantity}
                  </p>
                </div>
                <motion.button
                  onClick={() => handleRemovePending(item.id)}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white ring-1 ring-mufi-border transition hover:bg-red-50 hover:ring-red-200"
                >
                  <X className="h-3.5 w-3.5 text-mufi-tertiary hover:text-red-400" strokeWidth={2} />
                </motion.button>
              </motion.li>
            ))}
          </ul>

          {pendingItems.length === 0 && (
            <p className="mb-4 text-[14px] text-mufi-secondary">
              Tüm ürünleri kaldırdın. Yeni bir tarama yapabilirsin.
            </p>
          )}

          <div className="mt-5 flex gap-3">
            <motion.button
              onClick={handleCancel}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-1 items-center justify-center rounded-2xl bg-mufi-bg px-4 py-3 text-[14px] font-medium text-mufi-secondary ring-1 ring-mufi-border transition"
            >
              İptal
            </motion.button>
            <motion.button
              onClick={handleConfirm}
              disabled={pendingItems.length === 0}
              whileHover={pendingItems.length > 0 ? { scale: 1.01 } : {}}
              whileTap={pendingItems.length > 0 ? { scale: 0.97 } : {}}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-mufi-accent px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition disabled:opacity-50"
            >
              Onayla ve Mutfağa Gönder 🚀
            </motion.button>
          </div>
        </motion.div>
      ) : (
        <>
          <p className="mb-5 text-[15px] leading-relaxed text-mufi-secondary">
            {activeMode?.desc}
          </p>

          <motion.label
            className="relative flex h-56 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-mufi-bg ring-1 ring-mufi-border"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.99 }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleScan}
            />

            {isScanning ? (
              <>
                <div className="absolute inset-0 bg-black/5" />
                <motion.div
                  className="absolute left-3 right-3 h-[2px] bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]"
                  animate={{ top: ['12%', '88%'] }}
                  transition={{
                    duration: 1.25,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </>
            ) : error ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                  <AlertCircle
                    className="h-6 w-6 text-red-400"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[13px] font-medium text-red-500">{error}</p>
              </div>
            ) : (
              <motion.div
                className="flex flex-col items-center gap-2"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Camera className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
                </motion.div>
                <p className="text-[13px] font-medium text-gray-400">
                  Dokunarak tara
                </p>
              </motion.div>
            )}
          </motion.label>
        </>
      )}
    </motion.div>
  )
}
