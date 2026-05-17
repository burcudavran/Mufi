export function getExpiryStatus(expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)

  const diffMs = expiry.getTime() - today.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) {
    return { level: 'expired', daysLeft, label: 'Süresi doldu' }
  }

  if (daysLeft <= 2) {
    return {
      level: 'urgent',
      daysLeft,
      label: daysLeft === 1 ? '1 gün kaldı' : `${daysLeft} gün kaldı`,
    }
  }

  return {
    level: 'ok',
    daysLeft,
    label: formatShortDate(expiry),
  }
}

function formatShortDate(date) {
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  })
}

export function formatExpiryDate(expiryDate) {
  return new Date(expiryDate).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
