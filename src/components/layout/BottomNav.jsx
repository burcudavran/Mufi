import { motion } from 'framer-motion'
import { Camera, LayoutDashboard, ShoppingBag, Utensils } from 'lucide-react'
import { NAV_TABS } from '../../constants/preferences'

const ICONS = {
  LayoutDashboard,
  Camera,
  Utensils,
  ShoppingBag,
}

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-mufi-divider bg-white/90 shadow-nav backdrop-blur-xl safe-bottom"
      aria-label="Ana menü"
    >
      <ul className="flex items-stretch justify-around px-2 pb-1 pt-2">
        {NAV_TABS.map((tab) => {
          const Icon = ICONS[tab.icon]
          const isActive = activeTab === tab.id

          return (
            <li key={tab.id} className="flex-1">
              <motion.button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                className={`flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors ${
                  isActive
                    ? 'text-mufi-accent'
                    : 'text-mufi-secondary hover:text-mufi-label'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <motion.div
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                >
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                </motion.div>
                <motion.span
                  className="text-[10px] font-medium tracking-tight"
                  animate={isActive ? { y: 0, opacity: 1 } : { y: 1, opacity: 0.7 }}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
