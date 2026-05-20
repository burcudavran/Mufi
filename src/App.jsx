import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import MainLayout from './components/layout/MainLayout'
import { MufiProvider } from './context/MufiContext'
import { fetchProfile } from './lib/profileService'
import { supabase } from './lib/supabase'

const Auth = lazy(() => import('./components/Auth'))
const Onboarding = lazy(() => import('./components/Onboarding'))
const Dashboard = lazy(() => import('./components/Dashboard'))
const ScanPage = lazy(() => import('./pages/ScanPage'))
const RecipesPage = lazy(() => import('./pages/RecipesPage'))
const MarketPage = lazy(() => import('./pages/MarketPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

const TAB_META = {
  kitchen: { title: 'Mutfak',   subtitle: 'Dolabını akıllıca yönet.' },
  scan:    { title: 'Tarama',   subtitle: 'Ürünleri hızlıca tanı.'   },
  recipes: { title: 'Tarifler', subtitle: 'Sana uygun öneriler.'     },
  market:  { title: 'Market',   subtitle: 'Alışveriş listen hazır.'  },
  settings: { title: 'Ayarlar', subtitle: 'Profil tercihlerin.'       },
}

function withTimeout(promise, ms = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`[Mufi] Supabase ${ms / 1000}s içinde yanıt vermedi.`)),
        ms,
      ),
    ),
  ])
}

function LoadingScreen() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md items-center justify-center bg-mufi-bg">
      <div className="h-8 w-8 animate-pulse rounded-full bg-mufi-accent/30" />
    </div>
  )
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-mufi-accent border-t-transparent" />
    </div>
  )
}

function MainApp({ profile }) {
  const [activeTab, setActiveTab] = useState('kitchen')
  const meta = TAB_META[activeTab]

  function renderScreen() {
    switch (activeTab) {
      case 'scan':    return <ScanPage />
      case 'recipes': return <RecipesPage />
      case 'market':  return <MarketPage />
      case 'settings': return <SettingsPage />
      default:        return <Dashboard />
    }
  }

  return (
    <MufiProvider profile={profile}>
      <MainLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        title={meta.title}
        subtitle={meta.subtitle}
      >
        <Suspense fallback={<PageFallback />}>
          {renderScreen()}
        </Suspense>
      </MainLayout>
    </MufiProvider>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(undefined)
  const [booting, setBooting] = useState(true)

  const initRan = useRef(false)

  useEffect(() => {
    if (initRan.current) return
    initRan.current = true

    let active = true

    async function loadProfile(userId) {
      if (!userId) {
        if (active) setProfile(null)
        return
      }
      try {
        const data = await withTimeout(fetchProfile(userId))
        if (active) setProfile(data)
      } catch (err) {
        console.warn('[App] fetchProfile hatası (profile=null olarak devam):', err.message)
        if (active) setProfile(null)
      }
    }

    async function init() {
      try {
        if (supabase) {
          const { data, error } = await withTimeout(supabase.auth.getSession())
          if (error) throw error
          if (!active) return

          const currentSession = data?.session ?? null
          setSession(currentSession)
          await loadProfile(currentSession?.user?.id ?? null)
        }
      } catch (err) {
        console.error('[App] init hatası:', err.message)
        if (active) {
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (active) setBooting(false)
      }
    }

    init()

    let subscription
    if (supabase) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(
        async (event, nextSession) => {
          if (event === 'INITIAL_SESSION') return
          if (!active) return

          try {
            setSession(nextSession)
            await loadProfile(nextSession?.user?.id ?? null)
          } catch (err) {
            console.warn('[App] onAuthStateChange hatası:', err.message)
            if (active) setProfile(null)
          } finally {
            if (active) setBooting(false)
          }
        },
      )
      subscription = sub
    }

    return () => {
      active = false
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  if (booting || (session?.user && profile === undefined)) {
    return <LoadingScreen />
  }

  if (!session?.user) return (
    <Suspense fallback={<LoadingScreen />}>
      <Auth />
    </Suspense>
  )

  if (!profile) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Onboarding
          user={session.user}
          onComplete={(savedProfile) => setProfile(savedProfile)}
        />
      </Suspense>
    )
  }

  return <MainApp profile={profile} />
}
