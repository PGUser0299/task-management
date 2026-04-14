import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import AppRouter from './router'
import { AuthProvider } from './state/auth'

const isDev = import.meta.env.DEV
const queryClient = new QueryClient()

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#3730A3',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0EA5E9',
      light: '#38BDF8',
      dark: '#0284C7',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
    },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, color: '#64748B' },
    body1: { lineHeight: 1.6 },
    body2: { lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(15, 23, 42, 0.05)',
    '0 1px 3px rgba(15, 23, 42, 0.08)',
    '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
    '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.06)',
    '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
    '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        },
        elevation1: {
          boxShadow: '0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)',
        },
        elevation2: {
          boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.06)',
        },
        elevation3: {
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#fff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4F46E5',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: '#4F46E5',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.35)',
          '&:hover': {
            boxShadow: '0 20px 35px -5px rgba(79, 70, 229, 0.4)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(79, 70, 229, 0.18)',
            },
          },
        },
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
)
