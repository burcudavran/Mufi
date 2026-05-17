import { AnimatePresence, motion } from 'framer-motion'
import { BRAND } from '../../constants/brand'
import BottomNav from './BottomNav'

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-mufi-accent/5 blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-amber-300/8 blur-3xl"
        animate={{ x: [0, -40, 20, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-16 left-1/4 h-56 w-56 rounded-full bg-indigo-300/6 blur-3xl"
        animate={{ x: [0, 20, -30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export default function MainLayout({
  activeTab,
  setActiveTab,
  title,
  subtitle,
  children,
}) {
  return (
    <motion.div
      className="mx-auto flex min-h-svh w-full max-w-4xl flex-col bg-mufi-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <BackgroundBlobs />
      <header className="safe-top shrink-0 px-6 pb-3 pt-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mufi-secondary">
          {BRAND.name}
        </p>
        {title ? (
          <h1 className="mt-1 text-[30px] font-semibold leading-tight tracking-tight text-mufi-label">
            {title}
          </h1>
        ) : null}
        {subtitle ? (
          <p className="mt-1.5 text-[14px] text-mufi-secondary">{subtitle}</p>
        ) : null}
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.22 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </motion.div>
  )
}
