import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Plus, Snowflake, Sparkles, Thermometer, Utensils, X } from 'lucide-react'
import { INVENTORY_CATEGORIES } from '../constants/inventory'
import { useMufi } from '../context/MufiContext'
import { formatExpiryDate, getExpiryStatus } from '../lib/expiryUtils'

function defaultExpiry() {
  const d = new Date()
  d.setDate(d.getDate() + 5)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const FORM_CATEGORIES = INVENTORY_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.label,
}))

const INITIAL_FORM = { name: '', category: 'dairy', quantity: '', expiryDate: defaultExpiry() }

function InventoryItem({ item, onConsume }) {
  const status = getExpiryStatus(item.expiryDate)
  const isUrgent = status.level === 'urgent' || status.level === 'expired'
  const isFreezer = item.storage === 'freezer'

  return (
    <motion.li
      whileHover={{ scale: 1.01, x: 2 }}
      transition={{ duration: 0.15 }}
      className={`flex items-start justify-between gap-3 rounded-2xl px-3.5 py-3 transition ${
        isUrgent
          ? 'bg-orange-50/90 ring-1 ring-orange-200/80'
          : 'bg-mufi-bg/80'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        {isFreezer ? (
          <Snowflake className="h-4 w-4 shrink-0 text-sky-400" strokeWidth={2} />
        ) : (
          <Thermometer className="h-4 w-4 shrink-0 text-amber-400" strokeWidth={2} />
        )}
        <div>
          <p
            className={`text-[15px] font-medium leading-snug ${
              isUrgent ? 'text-orange-900' : 'text-mufi-label'
            }`}
          >
            {item.name}
          </p>
          <p
            className={`mt-0.5 text-[13px] ${
              isUrgent ? 'text-orange-700/90' : 'text-mufi-secondary'
            }`}
          >
            {item.quantity}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 text-right">
        <div>
          <p
            className={`text-[11px] font-medium uppercase tracking-wide ${
              isUrgent ? 'text-orange-600' : 'text-mufi-tertiary'
            }`}
          >
            Tahmini SKT
          </p>
          <p
            className={`text-[12px] font-semibold ${
              isUrgent ? 'text-orange-800' : 'text-mufi-secondary'
            }`}
          >
            {status.label}
          </p>
          <p
            className={`text-[11px] ${
              isUrgent ? 'text-orange-600/80' : 'text-mufi-tertiary'
            }`}
          >
            {formatExpiryDate(item.expiryDate)}
          </p>
        </div>
        <motion.button
          onClick={() => onConsume(item.id)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-mufi-border transition hover:bg-red-50 hover:ring-red-200"
          title="Tükendi"
        >
          <Utensils className="h-3.5 w-3.5 text-mufi-tertiary transition hover:text-red-400" strokeWidth={2} />
        </motion.button>
      </div>
    </motion.li>
  )
}

function ManualEntryForm({ onClose }) {
  const { addManualItem } = useMufi()
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')

  function set(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const trimmed = form.name.trim()
    if (!trimmed) {
      setError('Lütfen bir ürün adı girin.')
      return
    }

    addManualItem({
      name: trimmed,
      category: form.category,
      quantity: form.quantity.trim() || '1 Adet',
      expiryDate: form.expiryDate,
      storage: 'fridge',
    })

    setForm(INITIAL_FORM)
    onClose()
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-mufi-border bg-white p-4 shadow-sm"
    >
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[12px] font-medium text-mufi-secondary">
            Ürün Adı
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            placeholder="Örn: Sütaş Ayran"
            className="w-full rounded-xl bg-mufi-bg px-3 py-2.5 text-[14px] text-mufi-label outline-none ring-1 ring-mufi-border transition focus:ring-2 focus:ring-mufi-accent/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-mufi-secondary">
              Kategori
            </label>
            <select
              value={form.category}
              onChange={set('category')}
              className="w-full rounded-xl bg-mufi-bg px-3 py-2.5 text-[14px] text-mufi-label outline-none ring-1 ring-mufi-border transition focus:ring-2 focus:ring-mufi-accent/40"
            >
              {FORM_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[12px] font-medium text-mufi-secondary">
              Miktar / Gramaj
            </label>
            <input
              type="text"
              value={form.quantity}
              onChange={set('quantity')}
              placeholder="Örn: 2 Adet"
              className="w-full rounded-xl bg-mufi-bg px-3 py-2.5 text-[14px] text-mufi-label outline-none ring-1 ring-mufi-border transition focus:ring-2 focus:ring-mufi-accent/40"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[12px] font-medium text-mufi-secondary">
            Son Tüketim Tarihi
          </label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={set('expiryDate')}
            className="w-full rounded-xl bg-mufi-bg px-3 py-2.5 text-[14px] text-mufi-label outline-none ring-1 ring-mufi-border transition focus:ring-2 focus:ring-mufi-accent/40"
          />
        </div>

        {error && (
          <p className="text-[13px] font-medium text-red-500">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-mufi-bg px-3 py-2.5 text-[13px] font-medium text-mufi-secondary ring-1 ring-mufi-border transition"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
            İptal
          </motion.button>
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-mufi-accent px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm transition"
          >
            Mutfağa Ekle 🚀
          </motion.button>
        </div>
      </div>
    </motion.form>
  )
}

export default function Dashboard() {
  const { inventory, shoppingList, consumeItem } = useMufi()
  const [storageTab, setStorageTab] = useState('fridge')
  const [showForm, setShowForm] = useState(false)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const criticalCount = inventory.filter((item) => {
    const expiry = new Date(item.expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysLeft >= 0 && daysLeft <= 3
  }).length

  const shoppingListCount = shoppingList.length

  const filtered = inventory.filter((item) => item.storage === storageTab)
  const counts = {
    fridge: inventory.filter((i) => i.storage === 'fridge').length,
    freezer: inventory.filter((i) => i.storage === 'freezer').length,
  }

  return (
    <div className="space-y-5">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-[#dfe8d8] bg-gradient-to-br from-[#eef5e8] via-[#f7f3ea] to-[#f0ebe3] px-4 py-4 shadow-card"
      >
        <motion.div
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-mufi-accent/10 blur-2xl"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -left-4 -bottom-8 h-20 w-20 rounded-full bg-amber-300/15 blur-2xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex gap-3">
          <motion.div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/70 shadow-sm"
            whileHover={{ scale: 1.05, rotate: 3 }}
          >
            <Sparkles className="h-5 w-5 text-mufi-accent" strokeWidth={1.75} />
          </motion.div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mufi-accent">
              Mufi AI
            </p>
            <p className="mt-1 text-[14px] leading-relaxed text-mufi-label">
              {criticalCount > 0
                ? `Dolabında tarihi yaklaşan ${criticalCount} ürünün var`
                : 'Tüm ürünlerinin tarihleri gayet iyi durumda'}
              {shoppingListCount > 0 && (
                <>, sepetinde ise {shoppingListCount} eksik bulunuyor.</>
              )}
              {' '}Mufi senin için her şeyi kontrol altında tutuyor!
            </p>
          </div>
        </div>
      </motion.section>

      <div className="flex items-center gap-2">
        <motion.button
          onClick={() => setShowForm((p) => !p)}
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[13px] font-medium text-mufi-label shadow-sm ring-1 ring-mufi-border transition hover:bg-mufi-bg"
        >
          <motion.div
            animate={{ rotate: showForm ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-4 w-4 text-mufi-accent" strokeWidth={2.5} />
          </motion.div>
          Manuel Ürün Ekle
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {showForm && <ManualEntryForm onClose={() => setShowForm(false)} />}
      </AnimatePresence>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-[20px] font-semibold tracking-tight text-mufi-label">
              Buzdolabı
            </h2>
            <p className="mt-0.5 text-[13px] text-mufi-secondary">
              {storageTab === 'fridge'
                ? `${counts.fridge} ürün takipte`
                : `${counts.freezer} ürün takipte`}
            </p>
          </div>
        </div>

        <div className="mb-5 flex rounded-full bg-mufi-bg p-0.5 ring-1 ring-mufi-border">
          <motion.button
            onClick={() => setStorageTab('fridge')}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${
              storageTab === 'fridge'
                ? 'bg-white text-mufi-label shadow-sm'
                : 'text-mufi-tertiary hover:text-mufi-secondary'
            }`}
          >
            <Thermometer className="h-3.5 w-3.5" strokeWidth={2} />
            Soğutucu
          </motion.button>
          <motion.button
            onClick={() => setStorageTab('freezer')}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${
              storageTab === 'freezer'
                ? 'bg-white text-mufi-label shadow-sm'
                : 'text-mufi-tertiary hover:text-mufi-secondary'
            }`}
          >
            <Snowflake className="h-3.5 w-3.5" strokeWidth={2} />
            Dondurucu
          </motion.button>
        </div>

        <div className="space-y-4">
          {INVENTORY_CATEGORIES.map((category, index) => {
            const items = filtered.filter(
              (item) => item.category === category.id,
            )
            if (items.length === 0) return null

            return (
              <motion.article
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(0,0,0,0.06)' }}
                className="rounded-3xl border border-mufi-border bg-white p-4 shadow-card transition-shadow"
              >
                <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-mufi-secondary">
                  {category.label}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <InventoryItem
                      key={item.id}
                      item={item}
                      onConsume={consumeItem}
                    />
                  ))}
                </ul>
              </motion.article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
