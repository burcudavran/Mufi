import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, UserPlus } from 'lucide-react'
import { BRAND } from '../constants/brand'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  const isLogin = mode === 'login'

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage(null)

    if (!isLogin && password !== confirmPassword) {
      setMessage('Şifreler eşleşmiyor.')
      return
    }

    if (password.length < 6) {
      setMessage('Şifre en az 6 karakter olmalı.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) setMessage('E-posta veya şifre hatalı.')
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (error) {
          setMessage('Hesap oluşturulamadı. Bu e-posta kullanılıyor olabilir.')
          return
        }

        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
          if (signInError) setMessage('Kayıt tamamlandı, giriş yapılamadı.')
        }
      }
    } catch {
      setMessage('Bir sorun oluştu. Lütfen tekrar dene.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center bg-mufi-bg px-6 safe-top safe-bottom"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <header className="mb-10 text-center">
        <motion.div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-mufi-accent-soft shadow-card"
          initial={{ scale: 0.94 }}
          animate={{ scale: 1 }}
        >
          <span className="text-2xl font-semibold text-mufi-accent">M</span>
        </motion.div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-mufi-secondary">
          {BRAND.name}
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight text-mufi-label">
          {isLogin ? 'Giriş yap' : 'Hesap oluştur'}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mufi-secondary">
          {BRAND.slogan}
        </p>
      </header>

      <motion.div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-white p-1 shadow-card">
        <button
          type="button"
          onClick={() => {
            setMode('login')
            setMessage(null)
          }}
          className={`rounded-xl py-2.5 text-[14px] font-semibold transition ${
            isLogin
              ? 'bg-mufi-accent text-white'
              : 'text-mufi-secondary hover:text-mufi-label'
          }`}
        >
          Giriş yap
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register')
            setMessage(null)
            setConfirmPassword('')
          }}
          className={`rounded-xl py-2.5 text-[14px] font-semibold transition ${
            !isLogin
              ? 'bg-mufi-accent text-white'
              : 'text-mufi-secondary hover:text-mufi-label'
          }`}
        >
          Kayıt ol
        </button>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <motion.div>
          <label
            htmlFor="email"
            className="mb-2 block text-[13px] font-medium text-mufi-secondary"
          >
            E-posta
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-mufi-border bg-white px-4 py-3.5 text-[16px] shadow-card outline-none focus:border-mufi-accent focus:ring-2 focus:ring-mufi-accent/20"
          />
        </motion.div>

        <motion.div>
          <label
            htmlFor="password"
            className="mb-2 block text-[13px] font-medium text-mufi-secondary"
          >
            Şifre
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-mufi-border bg-white px-4 py-3.5 text-[16px] shadow-card outline-none focus:border-mufi-accent focus:ring-2 focus:ring-mufi-accent/20"
          />
        </motion.div>

        {!isLogin ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <label
              htmlFor="confirm"
              className="mb-2 block text-[13px] font-medium text-mufi-secondary"
            >
              Şifre tekrar
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-mufi-border bg-white px-4 py-3.5 text-[16px] shadow-card outline-none focus:border-mufi-accent focus:ring-2 focus:ring-mufi-accent/20"
            />
          </motion.div>
        ) : null}

        {message ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-[14px] text-red-600">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mufi-accent py-4 text-[17px] font-semibold text-white transition enabled:hover:bg-mufi-accent-hover disabled:opacity-50"
        >
          {isLogin ? (
            <>
              <LogIn className="h-5 w-5" />
              {isSubmitting ? 'Giriş yapılıyor…' : 'Mufi ile giriş yap'}
            </>
          ) : (
            <>
              <UserPlus className="h-5 w-5" />
              {isSubmitting ? 'Kaydediliyor…' : 'Mufi hesabı oluştur'}
            </>
          )}
        </button>
      </form>
    </motion.div>
  )
}
