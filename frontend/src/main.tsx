import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CssBaseline, ThemeProvider } from '@mui/material'
import AppRouter from './router'
import { AuthProvider } from './state/auth'
import { ThemeModeProvider, useThemeMode } from './state/themeMode'
import { darkTheme, lightTheme } from './theme'

const isDev = import.meta.env.DEV
const queryClient = new QueryClient()

const ThemedApp: React.FC = () => {
  const { mode } = useThemeMode()
  const theme = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeModeProvider>
          <ThemedApp />
        </ThemeModeProvider>
      </AuthProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
)
