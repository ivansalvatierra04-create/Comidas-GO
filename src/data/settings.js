const STORAGE_KEY = 'comidasgo-settings'

export const defaultSettings = {
  storeName1: 'Comidas',
  storeName2: 'GO',
  tagline: 'pedí y disfrutá',
  logo: '',
  backgroundImage: '',
  backgroundColor1: '#163a63',
  backgroundColor2: '#06162a',
  aboutPhoto: '',
  phone: '',
  address: '',
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw)
    return {
      ...defaultSettings,
      ...parsed,
      storeName1: parsed.storeName1 ?? defaultSettings.storeName1,
      storeName2: parsed.storeName2 ?? defaultSettings.storeName2,
      tagline: parsed.tagline ?? defaultSettings.tagline,
      logo: parsed.logo ?? '',
      backgroundImage: parsed.backgroundImage ?? '',
      backgroundColor1: parsed.backgroundColor1 || defaultSettings.backgroundColor1,
      backgroundColor2: parsed.backgroundColor2 || defaultSettings.backgroundColor2,
      aboutPhoto: parsed.aboutPhoto ?? '',
      phone: parsed.phone ?? '',
      address: parsed.address ?? '',
    }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}
