import { ref, onScopeDispose, getCurrentScope } from 'vue'

const THEME_KEY = 'inventory.theme'

// localStorage can throw (privacy mode, blocked storage); treat as "no saved choice".
const readSaved = () => {
  try {
    const v = localStorage.getItem(THEME_KEY)
    return v === 'dark' || v === 'light' ? v : null
  } catch (e) {
    return null
  }
}

const systemQuery = () => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)')
  } catch (e) {
    return null
  }
}

// Shared state (singleton pattern, like useFilters). Initialised from the class the inline
// script in index.html already put on <html>, so Vue and the first paint agree.
const isDark = ref(document.documentElement.classList.contains('dark'))
let hasChoice = readSaved() !== null
let listeners = 0
let mql = null

const apply = (dark) => {
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
}

// Follow the OS only while the user has not explicitly chosen.
const onSystemChange = (e) => {
  if (!hasChoice) apply(e.matches)
}

export function useTheme() {
  // Attach the live OS listener once per consumer and remove it when that scope unmounts.
  if (getCurrentScope()) {
    if (listeners === 0) {
      mql = systemQuery()
      if (mql) mql.addEventListener('change', onSystemChange)
      // Re-sync in case the saved value changed since module load.
      const saved = readSaved()
      hasChoice = saved !== null
      apply(saved ? saved === 'dark' : !!mql && mql.matches)
    }
    listeners++
    onScopeDispose(() => {
      listeners--
      if (listeners === 0 && mql) {
        mql.removeEventListener('change', onSystemChange)
        mql = null
      }
    })
  }

  // Explicit toggle: the only place the choice is persisted.
  const toggleTheme = () => {
    hasChoice = true
    apply(!isDark.value)
    try {
      localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
    } catch (e) {
      // Ignore: the choice simply won't persist.
    }
  }

  return { isDark, toggleTheme }
}
