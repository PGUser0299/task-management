import React, { useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
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
    onSuccess: (data) => {
      setTokens({ access: data.access, refresh: data.refresh })
      navigate('/')
    },
  })

  const errorMessage = loginMutation.error
    ? (loginMutation.error as { response?: { status?: number } })?.response?.status === 401
      ? 'ユーザー名またはパスワードが正しくありません。'
      : 'ログインに失敗しました。しばらくしてから再試行してください。'
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginMutation.mutate({ username, password })
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <BrandingPanel
        headline={
          <>
            チームの生産性を
            <br />
            <Box component="span" sx={{ color: '#818CF8' }}>AI</Box> で最大化
          </>
        }
        subtext={'タスク管理をよりスマートに。AI があなたのチームを\nサポートします。'}
      />

      {/* Right form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 8 },
          py: 6,
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 5, display: { md: 'none' } }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #818CF8, #4F46E5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>TaskBoard AI</Typography>
          </Stack>

          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A', mb: 0.5 }}
          >
            おかえりなさい
          </Typography>
          <Typography sx={{ color: '#64748B', mb: 4, fontSize: 15 }}>
            アカウントにサインイン
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              border: '1px solid rgba(15,23,42,0.08)',
              borderRadius: 3,
              bgcolor: 'white',
              boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.75 }}
                  >
                    ユーザー名
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.75 }}
                  >
                    パスワード
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
              </Stack>

              {errorMessage && (
                <Box
                  sx={{
                    mt: 2,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  <Typography color="error" variant="body2" sx={{ fontSize: 13 }}>
                    {errorMessage}
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loginMutation.isPending}
                sx={{
                  mt: 3,
                  py: 1.25,
                  borderRadius: 2,
                  fontSize: 14,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4F46E5, #4338CA)',
                    boxShadow: '0 6px 20px rgba(79,70,229,0.5)',
                  },
                }}
              >
                {loginMutation.isPending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'サインイン'
                )}
              </Button>
            </Box>
          </Paper>

          <Typography sx={{ mt: 3, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
            アカウントをお持ちでない方は{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                fontWeight: 700,
                color: '#4F46E5',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              新規登録
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
