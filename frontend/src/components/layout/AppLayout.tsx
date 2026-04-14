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
  alpha,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import LogoutIcon from '@mui/icons-material/Logout'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../state/auth'
import { useMe } from '../../lib/queries'

const SIDEBAR_WIDTH = 240

const navItems = [
  { label: 'ダッシュボード', icon: <DashboardIcon fontSize="small" />, path: '/' },
  { label: 'プロジェクト', icon: <FolderIcon fontSize="small" />, path: '/projects' },
  { label: 'メンバー', icon: <PeopleAltIcon fontSize="small" />, path: '/members' },
]

type Props = {
  children: React.ReactNode
}

export const AppLayout: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const { data: me } = useMe()

  React.useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    setMobileOpen(false)
  }

  const displayName = me?.display_name || me?.username || '...'
  const initial = displayName[0]?.toUpperCase() ?? 'U'

  const sidebarContent = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#0F172A',
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: 17, color: 'white' }} />
          </Box>
          <Box>
            <Typography
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              TaskBoard
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, lineHeight: 1 }}>
              AI Powered
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Nav section label */}
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          メニュー
        </Typography>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, px: 1.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 0 }}>
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              sx={{
                borderRadius: 1.5,
                color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.06)',
                  color: 'white',
                },
                py: 1,
                px: 1.5,
                mb: 0.25,
              }}
            >
              <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 600 : 400 }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 3,
                    height: 16,
                    borderRadius: 1,
                    bgcolor: '#818CF8',
                    ml: 0.5,
                  }}
                />
              )}
            </ListItemButton>
          )
        })}
      </List>

      {/* User info + settings + logout */}
      <Box
        sx={{
          px: 1.5,
          py: 1.5,
          mx: 1.5,
          mb: 1.5,
          borderRadius: 2,
          bgcolor: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Avatar
          sx={{
            width: 30,
            height: 30,
            bgcolor: alpha('#818CF8', 0.3),
            fontSize: 12,
            fontWeight: 700,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {initial}
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography
            sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 500, display: 'block' }}
            noWrap
          >
            {displayName}
          </Typography>
        </Box>
        <Tooltip title="アカウント設定">
          <IconButton
            size="small"
            onClick={() => handleNavigate('/profile')}
            sx={{
              color: location.pathname === '/profile' ? 'white' : 'rgba(255,255,255,0.4)',
              p: 0.5,
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <SettingsIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="ログアウト">
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{
              color: 'rgba(255,255,255,0.4)',
              p: 0.5,
              '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <LogoutIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile top bar */}
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: 'white',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2, gap: 1 }}>
          <IconButton
            edge="start"
            aria-label="メニューを開く"
            onClick={() => setMobileOpen(true)}
            sx={{ color: '#0F172A' }}
          >
            <MenuIcon />
          </IconButton>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1.5,
                background: 'linear-gradient(135deg, #818CF8, #4F46E5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>
              TaskBoard
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar navigation */}
      <Box
        component="nav"
        sx={{
          width: { md: SIDEBAR_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
          open
        >
          {sidebarContent}
        </Drawer>

        {/* Mobile temporary drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: SIDEBAR_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          pt: { xs: 7, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
