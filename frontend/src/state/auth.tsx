import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type Tokens = {
  access: string
  refresh: string
}

type AuthContextValue = {
  isAuthenticated: boolean
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const STORAGE_KEY = 'taskapp_tokens'

const readStoredTokens = (): Tokens | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Tokens
  } catch {
    return null
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tokens, setTokensState] = useState<Tokens | null>(() => readStoredTokens())

  const setTokens = useCallback((value: Tokens | null) => {
    setTokensState(value)
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const logout = useCallback(() => setTokens(null), [setTokens])

  useEffect(() => {
    const handleUnauthorized = () => setTokens(null)
    window.addEventListener('taskapp:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('taskapp:unauthorized', handleUnauthorized)
  }, [setTokens])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: !!tokens?.access,
      tokens,
      setTokens,
      logout,
    }),
    [tokens, setTokens, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
