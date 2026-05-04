import { createTheme } from '@mui/material'

/* ============================================================
   CSS custom-property tokens consumed by every component via
   var(--token).  Injected through MuiCssBaseline.
   ============================================================ */

const darkVars = {
  '--bg-deep': '#0B0F1A',
  '--bg-base': '#111827',
  '--bg-surface': 'rgba(17, 24, 39, 0.6)',
  '--bg-surface-solid': '#151C2C',
  '--bg-header': 'rgba(11, 15, 26, 0.6)',
  '--bg-inset': 'rgba(15, 23, 42, 0.4)',
  '--bg-input': 'rgba(15, 23, 42, 0.5)',
  '--border-subtle': 'rgba(148, 163, 184, 0.08)',
  '--border-faint': 'rgba(148, 163, 184, 0.06)',
  '--border-input': 'rgba(148, 163, 184, 0.12)',
  '--border-hover': 'rgba(6, 182, 212, 0.3)',
  '--text-primary': '#F1F5F9',
  '--text-heading': '#E2E8F0',
  '--text-secondary': '#94A3B8',
  '--text-muted': '#64748B',
  '--text-faint': '#475569',
  '--sidebar-bg': 'rgba(11, 15, 26, 0.95)',
  '--sidebar-border': 'rgba(148, 163, 184, 0.06)',
  '--shadow-card': '0 4px 24px rgba(0, 0, 0, 0.2)',
  '--shadow-dialog': '0 25px 60px rgba(0, 0, 0, 0.5)',
  '--shadow-glow': '0 4px 16px rgba(6, 182, 212, 0.2)',
  '--accent-primary': '#06B6D4',
  '--accent-primary-hover': '#22D3EE',
  '--accent-secondary': '#8B5CF6',
  '--accent-secondary-hover': '#A78BFA',
  '--gradient-accent': 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
  '--gradient-accent-hover': 'linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)',
  '--gradient-bar': 'linear-gradient(90deg, #06B6D4, #8B5CF6)',
  '--success': '#34D399',
  '--warning': '#FBBF24',
  '--error': '#F87171',
  '--avatar-bg': 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
  '--avatar-border': 'rgba(6, 182, 212, 0.2)',
} as const

const lightVars = {
  '--bg-deep': '#F1F5F9',
  '--bg-base': '#FFFFFF',
  '--bg-surface': 'rgba(255, 255, 255, 0.85)',
  '--bg-surface-solid': '#FFFFFF',
  '--bg-header': 'rgba(255, 255, 255, 0.85)',
  '--bg-inset': 'rgba(241, 245, 249, 0.7)',
  '--bg-input': '#FFFFFF',
  '--border-subtle': 'rgba(15, 23, 42, 0.07)',
  '--border-faint': 'rgba(15, 23, 42, 0.05)',
  '--border-input': 'rgba(15, 23, 42, 0.12)',
  '--border-hover': 'rgba(6, 182, 212, 0.35)',
  '--text-primary': '#0F172A',
  '--text-heading': '#1E293B',
  '--text-secondary': '#64748B',
  '--text-muted': '#94A3B8',
  '--text-faint': '#CBD5E1',
  '--sidebar-bg': '#0F172A',
  '--sidebar-border': 'rgba(255, 255, 255, 0.06)',
  '--shadow-card': '0 4px 24px rgba(15, 23, 42, 0.06)',
  '--shadow-dialog': '0 25px 60px rgba(15, 23, 42, 0.15)',
  '--shadow-glow': '0 4px 16px rgba(6, 182, 212, 0.15)',
  '--accent-primary': '#0891B2',
  '--accent-primary-hover': '#06B6D4',
  '--accent-secondary': '#7C3AED',
  '--accent-secondary-hover': '#8B5CF6',
  '--gradient-accent': 'linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)',
  '--gradient-accent-hover': 'linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%)',
  '--gradient-bar': 'linear-gradient(90deg, #06B6D4, #8B5CF6)',
  '--success': '#10B981',
  '--warning': '#F59E0B',
  '--error': '#EF4444',
  '--avatar-bg': 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1))',
  '--avatar-border': 'rgba(6, 182, 212, 0.25)',
} as const

/* ============================================================
   Shared component overrides (mode-agnostic, use CSS vars)
   ============================================================ */

const sharedComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '10px 22px',
        boxShadow: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        background: 'var(--gradient-accent)',
        color: '#FFFFFF',
        '&:hover': {
          background: 'var(--gradient-accent-hover)',
          boxShadow: 'var(--shadow-glow)',
        },
      },
      outlined: {
        borderColor: 'var(--border-input)',
        color: 'var(--text-secondary)',
        '&:hover': {
          borderColor: 'var(--accent-primary)',
          color: 'var(--accent-primary)',
          backgroundColor: 'transparent',
        },
      },
      text: {
        color: 'var(--text-secondary)',
        '&:hover': {
          backgroundColor: 'var(--bg-inset)',
          color: 'var(--text-primary)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        backgroundImage: 'none',
        backgroundColor: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      },
    },
  },
  MuiTextField: {
    defaultProps: { variant: 'outlined' as const, size: 'medium' as const },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
          backgroundColor: 'var(--bg-input)',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--border-input)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--border-hover)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: 'var(--accent-primary)',
            boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.1)',
          },
        },
        '& .MuiInputBase-input': {
          color: 'var(--text-primary)',
        },
        '& .MuiInputBase-input::placeholder': {
          color: 'var(--text-muted)',
          opacity: 1,
        },
        '& .MuiInputLabel-root': {
          color: 'var(--text-muted)',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        backgroundColor: 'var(--bg-header)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: 'none',
        borderBottom: '1px solid var(--border-faint)',
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        background: 'var(--gradient-accent)',
        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.3)',
        transition: 'all 0.25s ease',
        '&:hover': {
          background: 'var(--gradient-accent-hover)',
          boxShadow: '0 12px 32px rgba(6, 182, 212, 0.45)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 20,
        backgroundColor: 'var(--bg-surface-solid)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-dialog)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundImage: 'none',
        border: 'none',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        margin: '2px 8px',
        transition: 'all 0.2s ease',
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: 36 },
      indicator: {
        height: 2,
        borderRadius: 1,
        background: 'var(--gradient-bar)',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        minHeight: 36,
        textTransform: 'none' as const,
        fontWeight: 600,
        fontSize: 13,
        color: 'var(--text-muted)',
        '&.Mui-selected': { color: 'var(--text-primary)' },
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: { color: 'var(--accent-primary)' },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: { borderColor: 'var(--border-subtle)' },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: 'var(--bg-surface-solid)',
        backdropFilter: 'blur(8px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        fontSize: 12,
        color: 'var(--text-primary)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 8, fontWeight: 600, fontSize: 11 },
    },
  },
}

const typography = {
  fontFamily: '"Sora", "Noto Sans JP", sans-serif',
  h3: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15 },
  h4: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
  h5: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
  h6: { fontWeight: 600, letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 600 },
  subtitle2: { fontWeight: 600 },
  body1: { lineHeight: 1.6 },
  body2: { lineHeight: 1.5 },
  button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.01em' },
}

/* ============================================================
   Dark theme
   ============================================================ */
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#06B6D4', light: '#22D3EE', dark: '#0891B2', contrastText: '#0B0F1A' },
    secondary: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED' },
    background: { default: '#0B0F1A', paper: '#111827' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    success: { main: '#34D399', dark: '#059669' },
    warning: { main: '#FBBF24', dark: '#D97706' },
    error: { main: '#F87171', dark: '#DC2626' },
    divider: 'rgba(148, 163, 184, 0.08)',
  },
  typography,
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.3)','0 2px 6px rgba(0,0,0,0.35)',
    '0 4px 12px rgba(0,0,0,0.4)','0 8px 24px rgba(0,0,0,0.45)',
    '0 12px 32px rgba(0,0,0,0.5)',
    ...Array(19).fill('0 16px 48px rgba(0,0,0,0.5)'),
  ] as any,
  components: {
    ...sharedComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...darkVars,
          backgroundColor: '#0B0F1A',
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 10% 20%, rgba(6,182,212,0.04), transparent),
            radial-gradient(ellipse 60% 50% at 90% 80%, rgba(139,92,246,0.03), transparent)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: 11 },
        colorDefault: { backgroundColor: 'rgba(148,163,184,0.1)', color: '#94A3B8' },
        colorSuccess: { backgroundColor: 'rgba(52,211,153,0.12)', color: '#34D399' },
        colorWarning: { backgroundColor: 'rgba(251,191,36,0.12)', color: '#FBBF24' },
        colorError: { backgroundColor: 'rgba(248,113,113,0.12)', color: '#F87171' },
      },
    },
  },
})

/* ============================================================
   Light theme
   ============================================================ */
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0891B2', light: '#06B6D4', dark: '#0E7490', contrastText: '#fff' },
    secondary: { main: '#7C3AED', light: '#8B5CF6', dark: '#6D28D9' },
    background: { default: '#F1F5F9', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    divider: 'rgba(15, 23, 42, 0.07)',
  },
  typography,
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(15,23,42,0.05)','0 1px 3px rgba(15,23,42,0.08)',
    '0 4px 6px -1px rgba(15,23,42,0.08), 0 2px 4px -2px rgba(15,23,42,0.06)',
    '0 10px 15px -3px rgba(15,23,42,0.08), 0 4px 6px -4px rgba(15,23,42,0.06)',
    '0 20px 25px -5px rgba(15,23,42,0.08), 0 8px 10px -6px rgba(15,23,42,0.06)',
    ...Array(19).fill('0 25px 50px -12px rgba(15,23,42,0.15)'),
  ] as any,
  components: {
    ...sharedComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          ...lightVars,
          backgroundColor: '#F1F5F9',
          backgroundImage: `
            radial-gradient(ellipse 80% 60% at 10% 20%, rgba(6,182,212,0.03), transparent),
            radial-gradient(ellipse 60% 50% at 90% 80%, rgba(139,92,246,0.02), transparent)
          `,
          backgroundAttachment: 'fixed',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600, fontSize: 11 },
        colorDefault: { backgroundColor: 'rgba(100,116,139,0.1)', color: '#64748B' },
        colorSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', color: '#059669' },
        colorWarning: { backgroundColor: 'rgba(245,158,11,0.1)', color: '#B45309' },
        colorError: { backgroundColor: 'rgba(239,68,68,0.1)', color: '#DC2626' },
      },
    },
  },
})
