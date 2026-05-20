import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { MOCK_AI_INSIGHT, MOCK_INVENTORY } from '../constants/inventory'

const STORAGE_KEY = 'mufi_inventory'

function loadInventory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // localStorage okunamazsa mock ile devam
  }
  return MOCK_INVENTORY
}

const MufiContext = createContext(null)

export function MufiProvider({ children, profile: initialProfile = null }) {
  const [inventory, setInventory] = useState(loadInventory)
  const [shoppingList, setShoppingList] = useState([])
  const [aiInsight, setAiInsight] = useState(MOCK_AI_INSIGHT)
  const [currentProfile, setCurrentProfile] = useState(initialProfile)
  const prevProfileRef = useRef(initialProfile)

  if (prevProfileRef.current !== initialProfile) {
    prevProfileRef.current = initialProfile
    setCurrentProfile(initialProfile)
  }

  const updateProfile = useCallback((updated) => {
    setCurrentProfile(updated)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
  }, [inventory])

  const consumeItem = useCallback((itemId) => {
    let item = null
    setInventory((prev) => {
      item = prev.find((i) => i.id === itemId) ?? null
      return prev.filter((i) => i.id !== itemId)
    })
    if (item) {
      setShoppingList((prev) => [...prev, { ...item, consumedAt: Date.now() }])
    }
  }, [])

  const addManualItem = useCallback((newItem) => {
    const id = crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2)
    setInventory((prev) => [
      { id, ...newItem },
      ...prev,
    ])
  }, [])

  const otonomShoppingList = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const criticalFromFridge = inventory.filter((item) => {
      const expiry = new Date(item.expiryDate)
      expiry.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft >= 0 && daysLeft <= 3
    })

    const seen = new Set(shoppingList.map((i) => i.name.toLowerCase()))
    return [
      ...shoppingList,
      ...criticalFromFridge.filter((i) => !seen.has(i.name.toLowerCase())),
    ]
  }, [inventory, shoppingList])

  const value = useMemo(
    () => ({
      profile: currentProfile,
      inventory,
      setInventory,
      shoppingList,
      setShoppingList,
      otonomShoppingList,
      aiInsight,
      setAiInsight,
      consumeItem,
      addManualItem,
      updateProfile,
    }),
    [currentProfile, inventory, shoppingList, otonomShoppingList, aiInsight, consumeItem, addManualItem, updateProfile],
  )

  return <MufiContext.Provider value={value}>{children}</MufiContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMufi() {
  const context = useContext(MufiContext)
  if (!context) {
    throw new Error('useMufi yalnızca MufiProvider içinde kullanılabilir.')
  }
  return context
}
