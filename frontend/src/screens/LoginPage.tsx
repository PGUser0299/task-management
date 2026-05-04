import React, { useState } from 'react'
import { Box, Button, CircularProgress, Link, Paper, Stack, TextField, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createApiClient } from '../lib/apiClient'
import { useAuth } from '../state/auth'
import { BrandingPanel } from '../components/auth/BrandingPanel'

type LoginInput = { username: string; password: string }
type LoginResponse = { access: string; refresh: string }

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const loginMutation = useMutation<LoginResponse, unknown, LoginInput>({
    mutationFn: async ({ username, password }) => {
      const api = createApiClient()
      const res = await api.post('/auth/login/', { username, password })
      return res.data
    },
    onSuccess: (data) => { setTokens({ access: data.access, refresh: data.refresh }); navigate('/') },
  })

  const errorMessage = loginMutation.error
    ? (loginMutation.error as { response?: { status?: number } })?.response?.status === 401
      ? 'ユーザー名またはパスワードが正しくありません。'
      : 'ログインに失敗しました。しばらくしてから再試行してください。'
    : null

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); loginMutation.mutate({ username, password }) }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'var(--bg-deep)' }}>
      <BrandingPanel
        headline={<>チームの生産性を<br /><Box component="span" sx={{ background: 'var(--gradient-bar)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</Box> で最大化</>}
        subtext={'タスク管理をよりスマートに。AI があなたのチームを\nサポートします。'}
      />
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 6, md: 8 }, py: 6, bgcolor: 'var(--bg-deep)', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '30%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.04), transparent)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <Box sx={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 5, display: { md: 'none' }, animation: 'fadeInUp 0.5s ease both' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AutoAwesomeIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>TaskBoard AI</Typography>
          </Stack>

          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', mb: 0.5, animation: 'fadeInUp 0.5s ease 0.05s both' }}>
            おかえりなさい
          </Typography>
          <Typography sx={{ color: 'var(--text-muted)', mb: 4, fontSize: 15, animation: 'fadeInUp 0.5s ease 0.1s both' }}>
            アカウントにサインイン
          </Typography>

          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, animation: 'fadeInUp 0.5s ease 0.15s both' }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>ユーザー名</Typography>
                  <TextField fullWidth size="small" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>パスワード</Typography>
                  <TextField fullWidth size="small" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </Box>
              </Stack>
              {errorMessage && (
                <Box sx={{ mt: 2, px: 1.5, py: 1, borderRadius: 1.5, bgcolor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                  <Typography color="error" variant="body2" sx={{ fontSize: 13 }}>{errorMessage}</Typography>
                </Box>
              )}
              <Button type="submit" variant="contained" fullWidth size="large" disabled={loginMutation.isPending}
                sx={{ mt: 3, py: 1.3, borderRadius: 2, fontSize: 14, fontWeight: 700 }}>
                {loginMutation.isPending ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'サインイン'}
              </Button>
            </Box>
          </Paper>

          <Typography sx={{ mt: 3, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, animation: 'fadeInUp 0.5s ease 0.2s both' }}>
            アカウントをお持ちでない方は{' '}
            <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: 'var(--accent-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>新規登録</Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
