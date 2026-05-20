import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { ALLERGENS, DIET_TYPES } from '../constants/preferences'
import {
  formatSupabaseError,
  saveProfile,
} from '../lib/profileService'

const STEPS = ['diet', 'allergens']

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(0)
  const [dietType, setDietType] = useState(null)
  const [allergens, setAllergens] = useState([])
  const [otherAllergens, setOtherAllergens] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1

  function toggleAllergen(name) {
    setAllergens((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name],
    )
  }

  async function handleFinish() {
    if (!dietType) return

    setIsSaving(true)
    setError(null)

    try {
      const profile = await saveProfile({
        dietType,
        allergens: [...allergens],
        customAllergens: otherAllergens,
      }, user?.id)

      onComplete(profile)
    } catch (err) {
      console.error('Profil kayıt hatası:', err)
      setError(formatSupabaseError(err))
    } finally {
      setIsSaving(false)
    }
  }

  function handleNext() {
    if (currentStep === 'diet' && !dietType) return
    if (isLastStep) {
      handleFinish()
      return
    }
    setStep((s) => s + 1)
  }

  return (
    <motion.div
      className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-mufi-bg safe-top safe-bottom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="px-6 pb-4 pt-10">
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((_, index) => (
            <motion.div
              key={STEPS[index]}
              className={`h-1 flex-1 rounded-full ${
                index <= step ? 'bg-mufi-accent' : 'bg-mufi-divider'
              }`}
              layout
            />
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mufi-secondary">
          Adım {step + 1} / {STEPS.length}
        </p>
        <h1 className="mt-2 text-[30px] font-semibold tracking-tight text-mufi-label">
          {currentStep === 'diet' ? 'Diyet tipin' : 'Alerjenlerin'}
        </h1>
        <p className="mt-2 text-[15px] text-mufi-secondary">
          {currentStep === 'diet'
            ? 'Sana en uygun beslenme tarzını seç.'
            : 'Varsa işaretle; diğerlerini virgülle yaz.'}
        </p>
      </motion.div>

      <motion.div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {currentStep === 'diet' ? (
            <motion.div
              key="diet"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="grid grid-cols-2 gap-2.5"
            >
              {DIET_TYPES.map((diet) => {
                const selected = dietType === diet
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => setDietType(diet)}
                    className={`rounded-2xl border px-4 py-4 text-left text-[15px] font-medium transition active:scale-[0.98] ${
                      selected
                        ? 'border-mufi-accent bg-mufi-accent text-white shadow-sm'
                        : 'border-mufi-border bg-white text-mufi-label shadow-card'
                    }`}
                  >
                    {diet}
                  </button>
                )
              })}
            </motion.div>
          ) : (
            <motion.div
              key="allergens"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="space-y-6"
            >
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
                        {checked ? (
                          <Check className="ml-auto h-4 w-4 text-mufi-accent" />
                        ) : null}
                      </label>
                    </li>
                  )
                })}
              </ul>

              <div>
                <label
                  htmlFor="other-allergens"
                  className="mb-2 block text-[13px] font-semibold uppercase tracking-wider text-mufi-secondary"
                >
                  Diğer
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="border-t border-mufi-divider bg-white/80 px-6 py-4 backdrop-blur-xl safe-bottom">
        {error ? (
          <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {error}
          </p>
        ) : null}

        <div className="flex gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center justify-center gap-1 rounded-2xl border border-mufi-border bg-white px-5 py-3.5 text-[15px] font-semibold text-mufi-label"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleNext}
            disabled={(currentStep === 'diet' && !dietType) || isSaving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-mufi-accent py-3.5 text-[16px] font-semibold text-white transition enabled:hover:bg-mufi-accent-hover disabled:opacity-40"
          >
            {isSaving
              ? 'Kaydediliyor…'
              : isLastStep
                ? 'Kaydet ve başla'
                : 'Devam et'}
            {!isSaving && !isLastStep ? (
              <ArrowRight className="h-4 w-4" />
            ) : null}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
