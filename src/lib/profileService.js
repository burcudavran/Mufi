import { supabase } from './supabase'

/**
 * profiles şeması:
 * id uuid, diet_type text, allergens text[], custom_allergens text
 */
export async function getAuthenticatedUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user?.id) throw new Error('Giriş yapmış kullanıcı bulunamadı.')

  return user.id
}

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, diet_type, allergens, custom_allergens')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function saveProfile({ dietType, allergens, customAllergens }, userId) {
  if (!userId) {
    userId = await getAuthenticatedUserId()
  }

  const allergensArray = Array.isArray(allergens)
    ? allergens.filter((item) => typeof item === 'string' && item.trim())
    : []

  const payload = {
    id: userId,
    diet_type: dietType,
    allergens: allergensArray,
    custom_allergens: customAllergens?.trim() || null,
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('id, diet_type, allergens, custom_allergens')
    .single()

  if (error) throw error
  return data
}

export function formatSupabaseError(error) {
  if (!error) return 'Bilinmeyen hata'
  const parts = [
    error.message,
    error.details,
    error.hint,
    error.code ? `Kod: ${error.code}` : null,
  ].filter(Boolean)
  return parts.join(' — ')
}
