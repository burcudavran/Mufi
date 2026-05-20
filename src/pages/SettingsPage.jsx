import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { ALLERGENS, DIET_TYPES } from '../constants/preferences'
import { saveProfile } from '../lib/profileService'
import { useMufi } from '../context/MufiContext'

export default function SettingsPage() {
  const { profile, updateProfile } = useMufi()

  const [dietType, setDietType] = useState(profile?.diet_type ?? '')
  const [allergens, setAllergens] = useState(profile?.allergens ?? [])
  const [otherAllergens, setOtherAllergens] = useState(profile?.custom_allergens ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function toggleAllergen(name) {
    setAllergens((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    )
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const updated = await saveProfile({
        dietType: dietType || 'Karma',
        allergens,
        customAllergens: otherAllergens,
      })
      updateProfile(updated)
      setSuccess(true)
    } catch {
      setError('Profil kaydedilemedi. Lütfen tekrar dene.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="rounded-3xl bg-white p-6 shadow-card"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h2 className="mb-1 text-[20px] font-semibold tracking-tight text-mufi-label">
        Profil Ayarları
      </h2>
      <p className="mb-5 text-[14px] text-mufi-secondary">
        Diyet tipini ve alerjenlerini güncelle.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-mufi-secondary">
            Diyet Tipi
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            {DIET_TYPES.map((diet) => {
              const selected = dietType === diet
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => setDietType(diet)}
                  className={`rounded-2xl border px-4 py-3 text-left text-[14px] font-medium transition active:scale-[0.98] ${
                    selected
                      ? 'border-mufi-accent bg-mufi-accent text-white shadow-sm'
                      : 'border-mufi-border bg-white text-mufi-label shadow-card'
                  }`}
                >
                  {diet}
                </button>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wider text-mufi-secondary">
            Alerjenler
          </legend>
          <ul className="space-y-2">
            {ALLERGENS.map((allergen) => {
              const checked = allergens.includes(allergen)
              return (
                <li key={allergen}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3.5 transition ${
                      checked
                        ? 'border-mufi-accent bg-mufi-accent-soft'
                        : 'border-mufi-border bg-white shadow-card'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAllergen(allergen)}
                      className="h-5 w-5 rounded-md border-mufi-border text-mufi-accent focus:ring-mufi-accent/30"
                    />
                    <span className="text-[15px] font-medium text-mufi-label">
                      {allergen}
                    </span>
                    {checked && <Check className="ml-auto h-4 w-4 text-mufi-accent" />}
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>

        <div>
          <label
            htmlFor="other-allergens"
            className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-mufi-secondary"
          >
            Diğer Alerjenler
          </label>
          <input
            id="other-allergens"
            type="text"
            value={otherAllergens}
            onChange={(e) => setOtherAllergens(e.target.value)}
            placeholder="Örn. kivi, susam, hardal"
            className="w-full rounded-2xl border border-mufi-border bg-white px-4 py-3.5 text-[16px] shadow-card outline-none focus:border-mufi-accent focus:ring-2 focus:ring-mufi-accent/20"
          />
          <p className="mt-2 text-[13px] text-mufi-tertiary">
            Birden fazla alerjeni virgülle ayırabilirsin.
          </p>
        </div>

        {error && (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {error}
          </p>
        )}

        {success && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-green-50 px-4 py-3 text-[14px] text-green-600"
          >
            Profil başarıyla güncellendi!
          </motion.p>
        )}

        <motion.button
          type="submit"
          disabled={saving || !dietType}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mufi-accent px-4 py-3.5 text-[15px] font-semibold text-white shadow-sm transition disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </motion.button>
      </form>
    </motion.div>
  )
}
