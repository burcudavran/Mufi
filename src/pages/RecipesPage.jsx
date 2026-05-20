import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { AlertCircle, ChefHat, Clock, Minus, Plus, Sparkles, X } from 'lucide-react'
import { useMufi } from '../context/MufiContext'
import { generateAIRecipes } from '../lib/gemini'

const LOADING_MESSAGES = [
  'Şef önlüğümü giyiyorum, kileri talan ediyorum... 🍳',
  'Malzemeleri kokluyorum, ilham perisi geliyor... ✨',
  'Tencereler kaynıyor, lezzetler dans ediyor... 🎵',
]

export default function RecipesPage() {
  const { inventory, profile } = useMufi()
  const [servings, setServings] = useState(2)
  const [loading, setLoading] = useState(false)
  const [recipes, setRecipes] = useState(null)
  const [error, setError] = useState(null)
  const [loadingMessage] = useState(
    () => LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)],
  )
  const abortRef = useRef(null)

  async function handleGenerate() {
    setLoading(true)
    setRecipes(null)
    setError(null)

    abortRef.current = new AbortController()

    try {
      const data = await generateAIRecipes(inventory, servings, profile)
      if (!abortRef.current?.signal.aborted) {
        setRecipes(data)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Tarif oluşturma hatası:', err)
      setError(err.message || 'Tarif oluşturulamadı. Lütfen daha sonra tekrar dene.')
    } finally {
      if (!abortRef.current?.signal.aborted) {
        setLoading(false)
      }
    }
  }

  function handleCancel() {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 shadow-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="rounded-2xl bg-mufi-bg p-4 ring-1 ring-mufi-border">
        <p className="mb-3 text-[14px] font-semibold text-mufi-label">
          Mufi bugün kaç kişilik bir ziyafet hazırlasın? 🍽️
        </p>

        <div className="flex items-center justify-center gap-4">
          <motion.button
            onClick={() => setServings(Math.max(1, servings - 1))}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-mufi-border transition hover:bg-gray-50"
          >
            <Minus className="h-4 w-4 text-mufi-secondary" strokeWidth={2} />
          </motion.button>

          <motion.span
            key={servings}
            className="min-w-[3ch] text-center text-[22px] font-semibold tracking-tight text-mufi-label"
            initial={{ y: -4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {servings}
          </motion.span>

          <motion.button
            onClick={() => setServings(Math.min(20, servings + 1))}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-mufi-border transition hover:bg-gray-50"
          >
            <Plus className="h-4 w-4 text-mufi-secondary" strokeWidth={2} />
          </motion.button>

          <motion.p
            className="ml-auto text-[13px] text-mufi-tertiary"
            animate={{ opacity: servings === 1 ? 0.7 : 1 }}
          >
            {servings === 1 ? 'kişilik' : 'kişilik'}
          </motion.p>
        </div>
      </div>

      <motion.button
        onClick={handleGenerate}
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.008 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        className="mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-mufi-accent px-4 py-3 text-[15px] font-semibold text-white shadow-sm transition disabled:opacity-60"
      >
        {loading && (
          <motion.div
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}
        <Sparkles className="h-4 w-4" strokeWidth={2} />
        {loading ? 'Yapay Zeka Düşünüyor...' : 'Yapay Zekayı Çalıştır'}
      </motion.button>

      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-center gap-3"
        >
          <p className="text-[14px] text-mufi-secondary">{loadingMessage}</p>
          <motion.button
            onClick={handleCancel}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[12px] font-medium text-red-500 ring-1 ring-red-200 transition hover:bg-red-100"
          >
            <X className="h-3 w-3" strokeWidth={2.5} />
            İptal
          </motion.button>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-600"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {recipes && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 space-y-4"
        >
          {recipes.map((recipe, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(0,0,0,0.06)' }}
              className="rounded-3xl border border-mufi-border bg-white p-5 shadow-card transition-shadow"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-[17px] font-semibold leading-snug text-mufi-label">
                  {recipe.title}
                </h3>
                <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-mufi-bg px-3 py-1">
                  <Clock className="h-3.5 w-3.5 text-mufi-tertiary" strokeWidth={2} />
                  <span className="text-[12px] font-medium text-mufi-secondary">
                    {recipe.prepTime}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-mufi-tertiary">
                  Malzemeler
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="rounded-full bg-mufi-bg px-3 py-1 text-[13px] text-mufi-secondary"
                    >
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-mufi-tertiary">
                  Hazırlanışı
                </p>
                <ol className="space-y-1.5">
                  {recipe.instructions.map((step, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-[13px] leading-relaxed text-mufi-secondary"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mufi-accent/10 text-[11px] font-semibold text-mufi-accent">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[#f7f0e8] to-[#efe8dd] px-4 py-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-mufi-accent" strokeWidth={2} />
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-mufi-accent">
                    Mufi'nin Şef Notu
                  </p>
                </div>
                <p className="text-[13px] leading-relaxed text-mufi-label">
                  {recipe.mufiNote}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
