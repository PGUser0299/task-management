import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

type ThemeMode = 'light' | 'dark'

type ThemeModeContextType = {
  mode: ThemeMode
  toggle: () => void
}

const ThemeModeContext = createContext<ThemeModeContextType>({
  mode: 'dark',
  toggle: () => {},
})

const STORAGE_KEY = 'taskapp_theme_mode'

function getInitialMode(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {}
  return 'dark'
}

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode)

  const toggle = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem(STORAGE_KEY, next) } catch {}
      return next
    })
  }, [])

  const value = useMemo(() => ({ mode, toggle }), [mode, toggle])

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  )
}

export const useThemeMode = () => useContext(ThemeModeContext)
