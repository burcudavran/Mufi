import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ShoppingCart, Store, Target, Trophy } from 'lucide-react'
import { useMufi } from '../context/MufiContext'
import { fetchMarketPrices } from '../services/marketApi'

const STRATEGIES = [
  { id: 'cheapest', label: 'En Ucuz Sepet', icon: Target },
  { id: 'fp', label: 'Fiyat / Performans', icon: Store },
  { id: 'premium', label: 'Premium Sadakat', icon: Trophy },
]

const MARKET_COLORS = {
  Migros: { bg: 'bg-red-50', text: 'text-red-600', badge: 'bg-red-500' },
  CarrefourSA: { bg: 'bg-blue-50', text: 'text-blue-600', badge: 'bg-blue-500' },
  A101: { bg: 'bg-orange-50', text: 'text-orange-600', badge: 'bg-orange-500' },
  Şok: { bg: 'bg-green-50', text: 'text-green-600', badge: 'bg-green-500' },
}

export default function MarketPage() {
  const { otonomShoppingList: mergedList, setShoppingList, inventory } = useMufi()
  const [strategy, setStrategy] = useState('cheapest')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [ordered, setOrdered] = useState(false)

  const mergedListKey = useMemo(
    () => mergedList.map((i) => `${i.id}_${i.name}`).join('|'),
    [mergedList],
  )

  useEffect(() => {
    if (mergedList.length === 0) return

    let cancelled = false

    ;(async () => {
      setLoading(true)
      setData(null)

      const result = await fetchMarketPrices(mergedList, strategy, inventory)
      if (!cancelled) {
        setData(result)
        setLoading(false)
      }
    })()

    return () => { cancelled = true }
    // mergedListKey tracks content changes, mergedList.length handles empty state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergedListKey, mergedList.length, strategy, inventory])

  function handleOrder() {
    setOrdered(true)
    setShoppingList([])
  }

  if (ordered) {
    return (
      <motion.div
        className="rounded-3xl bg-white p-6 shadow-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-3 py-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
            <ShoppingCart className="h-8 w-8 text-green-500" strokeWidth={1.5} />
          </div>
          <p className="text-[17px] font-semibold text-mufi-label">
            Süper! Eksikler otonom olarak sipariş edildi
          </p>
          <p className="text-[14px] text-mufi-secondary">
            Kurye yola çıkmak üzere! 🚀
          </p>
        </motion.div>
      </motion.div>
    )
  }

  if (mergedList.length === 0) {
    return (
      <motion.div
        className="rounded-3xl bg-white p-6 shadow-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mufi-bg">
            <ShoppingCart className="h-7 w-7 text-mufi-tertiary" strokeWidth={1.5} />
          </div>
          <p className="text-[17px] font-semibold text-mufi-label">
            Otonom Sepetiniz Boş ✨
          </p>
          <p className="text-[14px] leading-relaxed text-mufi-secondary">
            Mutfakta bir şeyler tükendiğinde veya son kullanma tarihi
            yaklaştığında burada otomatik olarak listelenecek.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 shadow-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-5 flex items-center gap-2">
        <ShoppingCart className="h-5 w-5 text-mufi-accent" strokeWidth={1.75} />
        <p className="text-[15px] font-semibold text-mufi-label">
          Mufi Senin İçin Eksikleri Belirledi! 🛒
        </p>
      </div>

      <div className="mb-5 flex rounded-full bg-mufi-bg p-0.5 ring-1 ring-mufi-border">
        {STRATEGIES.map((s) => {
          const Icon = s.icon
          const isActive = strategy === s.id
          return (
            <motion.button
              key={s.id}
              onClick={() => setStrategy(s.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium transition ${
                isActive
                  ? 'bg-white text-mufi-label shadow-sm'
                  : 'text-mufi-tertiary hover:text-mufi-secondary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {s.label}
            </motion.button>
          )
        })}
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-3"
        >
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="flex items-center justify-between gap-3 rounded-2xl bg-mufi-bg px-4 py-3 ring-1 ring-mufi-border"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="h-4 w-28 animate-pulse rounded-full bg-mufi-border" />
              <div className="flex items-center gap-2">
                <div className="h-5 w-14 animate-pulse rounded-full bg-mufi-border" />
                <div className="h-5 w-12 animate-pulse rounded bg-mufi-border" />
              </div>
            </motion.div>
          ))}
          <div className="flex flex-col items-center gap-2 pt-2 text-center">
            <motion.p
              className="text-[13px] text-mufi-secondary"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              Mufi zincir market fiyatlarını tarıyor ve marka
              alışkanlıklarınızı analiz ediyor... 📊
            </motion.p>
          </div>
        </motion.div>
      ) : data && data.products.length > 0 ? (
        <motion.div
          key={strategy}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-start"
        >
          <div className="space-y-2 md:col-span-2">
            {data.products.map((p, idx) => {
              const mc = MARKET_COLORS[p.market] || MARKET_COLORS.Migros
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.008, x: 2 }}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-mufi-bg px-4 py-3 ring-1 ring-mufi-border transition-shadow hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-medium text-mufi-label">
                        {p.originalName}
                      </p>
                      {p.isPreferred && (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 ring-1 ring-amber-200">
                          🎯 Tercihiniz
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12px] text-mufi-tertiary">
                      {p.brand}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${mc.bg} ${mc.text}`}
                    >
                      {p.market}
                    </span>
                    <span className="text-[15px] font-bold tabular-nums text-mufi-label">
                      {p.price.toFixed(2)} ₺
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="md:col-span-1">
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(79,70,229,0.08)' }}
              className="rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 p-5 ring-1 ring-indigo-100 transition-shadow"
            >
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-indigo-600">
                Sepet Özeti
              </p>

              <div className="mb-4">
                <p className="text-[11px] text-indigo-500/80">En Uygun Market</p>
                <p className="mt-0.5 text-[20px] font-bold tracking-tight text-indigo-900">
                  {data.bestMarket}
                </p>
              </div>

              <div className="mb-5">
                <p className="text-[11px] text-indigo-500/80">Toplam Tahmini Tutar</p>
                <p className="mt-0.5 text-[28px] font-bold tracking-tight text-indigo-900">
                  {data.total.toFixed(2)} ₺
                </p>
              </div>

              <div className="mb-4 space-y-1.5">
                {data.products.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-[12px]">
                    <span className="text-indigo-700/70">{p.productName}</span>
                    <span className="shrink-0 font-medium text-indigo-800">
                      {p.price.toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>

              <motion.button
                onClick={handleOrder}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <ShoppingCart className="h-4 w-4" strokeWidth={2} />
                Siparişi Tamamla 🚀
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : data && data.products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-8 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mufi-bg">
            <ShoppingCart className="h-7 w-7 text-mufi-tertiary" strokeWidth={1.5} />
          </div>
          <p className="text-[15px] font-medium text-mufi-label">
            Bu ürünler için fiyat bulunamadı
          </p>
          <p className="max-w-xs text-[13px] leading-relaxed text-mufi-secondary">
            Mufi şu anda sepetindeki bazı ürünler için fiyat verisine sahip
            değil. Lütfen daha sonra tekrar dene.
          </p>
        </motion.div>
      ) : null}
    </motion.div>
  )
}
