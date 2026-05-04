import React from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import LogoutIcon from '@mui/icons-material/Logout'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/auth'
import { useMe } from '../../lib/queries'
import { useThemeMode } from '../../state/themeMode'

const SIDEBAR_WIDTH = 260

const navItems = [
  { label: 'ダッシュボード', icon: <DashboardIcon fontSize="small" />, path: '/' },
  { label: 'プロジェクト', icon: <FolderIcon fontSize="small" />, path: '/projects' },
  { label: 'メンバー', icon: <PeopleAltIcon fontSize="small" />, path: '/members' },
]

type Props = { children: React.ReactNode }

export const AppLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const { mode, toggle } = useThemeMode()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { data: me } = useMe()

  React.useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleLogout = () => { logout(); navigate('/login') }
  const handleNavigate = (path: string) => { navigate(path); setMobileOpen(false) }

  const displayName = me?.display_name || me?.username || '...'
  const initial = displayName[0]?.toUpperCase() ?? 'U'

  /* ---- sidebar uses its own dark palette in both modes ---- */
  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient accent */}
      <Box sx={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 120,
        background: 'linear-gradient(180deg, rgba(6,182,212,0.04) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <Box sx={{ px: 3, py: 3, borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2.5,
            background: 'var(--gradient-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 16px rgba(6,182,212,0.3)',
          }}>
            <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              TaskBoard
            </Typography>
            <Typography sx={{
              background: 'var(--gradient-bar)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              fontSize: 10, fontWeight: 600, lineHeight: 1, letterSpacing: '0.05em',
            }}>
              AI Powered
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Nav label */}
      <Box sx={{ px: 3, pt: 2.5, pb: 0.5 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          メニュー
        </Typography>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
        {navItems.map((item, index) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 2,
                color: isActive ? '#06B6D4' : 'rgba(255,255,255,0.45)',
                bgcolor: isActive ? 'rgba(6,182,212,0.08)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'rgba(6,182,212,0.15)' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#22D3EE' : 'rgba(255,255,255,0.8)',
                },
                py: 1.1, px: 2, mb: 0.25,
                transition: 'all 0.2s ease',
                animation: 'fadeInUp 0.4s ease both',
                animationDelay: `${index * 0.05}s`,
              }}
            >
              <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 600 : 400, fontSize: 13 }} />
              {isActive && (
                <Box sx={{
                  width: 4, height: 18, borderRadius: 2,
                  background: 'var(--gradient-bar)', ml: 0.5,
                  boxShadow: '0 0 8px rgba(6,182,212,0.4)',
                }} />
              )}
            </ListItemButton>
          )
        })}
      </List>

      {/* Footer: theme toggle + user */}
      <Box sx={{ px: 1.5, mb: 0.5 }}>
        <Tooltip title={mode === 'dark' ? 'ライトモードへ' : 'ダークモードへ'}>
          <IconButton
            onClick={toggle}
            sx={{
              width: '100%', borderRadius: 2, py: 1,
              color: 'rgba(255,255,255,0.5)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', color: '#FBBF24' },
              justifyContent: 'center', gap: 1,
            }}
          >
            {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 16 }} /> : <DarkModeIcon sx={{ fontSize: 16 }} />}
            <Typography sx={{ fontSize: 11, color: 'inherit', fontWeight: 500 }}>
              {mode === 'dark' ? 'Light' : 'Dark'}
            </Typography>
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{
        px: 1.5, py: 1.5, mx: 1.5, mb: 1.5, borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 1.25,
      }}>
        <Avatar sx={{
          width: 32, height: 32,
          background: 'var(--gradient-accent)',
          fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
        }}>
          {initial}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500 }} noWrap>
            {displayName}
          </Typography>
        </Box>
        <Tooltip title="アカウント設定">
          <IconButton
            size="small"
            onClick={() => handleNavigate('/profile')}
            sx={{
              color: location.pathname === '/profile' ? '#06B6D4' : 'rgba(255,255,255,0.35)',
              p: 0.5, '&:hover': { color: '#06B6D4', bgcolor: 'rgba(6,182,212,0.08)' },
            }}
          >
            <SettingsIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="ログアウト">
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: 'rgba(255,255,255,0.35)', p: 0.5,
              '&:hover': { color: '#F87171', bgcolor: 'rgba(248,113,113,0.08)' },
            }}
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile top bar */}
      <AppBar
        position="fixed" color="inherit" elevation={0}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2, gap: 1 }}>
          <IconButton edge="start" aria-label="メニューを開く" onClick={() => setMobileOpen(true)} sx={{ color: 'var(--text-secondary)' }}>
            <MenuIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1}>
            <Box sx={{
              width: 28, height: 28, borderRadius: 1.5,
              background: 'var(--gradient-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              TaskBoard
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer variant="permanent" sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none', bgcolor: 'transparent' },
        }} open>
          {sidebarContent}
        </Drawer>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none', bgcolor: 'transparent' },
          }}
        >
          {sidebarContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0, overflow: 'auto', pt: { xs: 7, md: 0 } }}>
        {children}
      </Box>
    </Box>
  )
}
