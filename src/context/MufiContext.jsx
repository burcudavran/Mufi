import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { MOCK_INVENTORY } from '../constants/inventory'

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
  const [toast, setToast] = useState(null)
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
      const entry = { ...item, consumedAt: Date.now() }
      setShoppingList((prev) => [...prev, entry])
      setToast({ type: 'undo', message: `"${item.name}" tükenmiş olarak işaretlendi`, data: entry })
    }
  }, [])

  const undoConsume = useCallback((entry) => {
    setShoppingList((prev) => prev.filter((i) => i.consumedAt !== entry.consumedAt))
    setInventory((prev) => [{ ...entry, id: crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2) }, ...prev])
    setToast(null)
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

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

  const aiInsight = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expired = inventory.filter((item) => {
      const expiry = new Date(item.expiryDate)
      expiry.setHours(0, 0, 0, 0)
      return expiry.getTime() < today.getTime()
    })
    const urgent = inventory.filter((item) => {
      const expiry = new Date(item.expiryDate)
      expiry.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft >= 0 && daysLeft <= 2
    })
    const meatCount = inventory.filter((i) => i.category === 'meat').length

    if (expired.length > 0) {
      const names = expired.map((i) => i.name).slice(0, 3).join(', ')
      return `Dolabında süresi geçmiş ${expired.length} ürün bulunuyor (${names}${expired.length > 3 ? '...' : ''}). Hemen kontrol etmeni öneririm!`
    }
    if (urgent.length > 0) {
      return `Dolabında tarihi yaklaşan ${urgent.length} ürünün var, öncelikle onları tüketmeye ne dersin?`
    }
    if (meatCount > 3) {
      return `${meatCount} çeşit et/tavuk ürünün var. Haftanın yemek planını yapmaya hazırsın!`
    }
    if (inventory.length === 0) {
      return 'Dolabın bomboş görünüyor. Hadi bir alışveriş listesi oluşturalım!'
    }
    return 'Tüm ürünlerinin tarihleri gayet iyi durumda. Mufi senin için her şeyi kontrol altında tutuyor!'
  }, [inventory])

  const value = useMemo(
    () => ({
      profile: currentProfile,
      inventory,
      setInventory,
      shoppingList,
      setShoppingList,
      otonomShoppingList,
      aiInsight,
      toast,
      setToast,
      dismissToast,
      consumeItem,
      undoConsume,
      addManualItem,
      updateProfile,
    }),
    [currentProfile, inventory, shoppingList, otonomShoppingList, aiInsight, toast, consumeItem, undoConsume, addManualItem, updateProfile, dismissToast],
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
