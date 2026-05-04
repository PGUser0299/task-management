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
import { AxiosError } from 'axios'
import { useMutation } from '@tanstack/react-query'
import { createApiClient } from '../lib/apiClient'
import { useAuth } from '../state/auth'
import { BrandingPanel } from '../components/auth/BrandingPanel'

type RegisterErrorData = {
  username?: string[]
  email?: string[]
  password?: string[]
  non_field_errors?: string[]
}

type RegisterInput = {
  username: string
  email: string
  displayName: string
  password: string
}

type LoginResponse = { access: string; refresh: string }

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')

  const registerMutation = useMutation<LoginResponse, AxiosError<RegisterErrorData>, RegisterInput>({
    mutationFn: async (input) => {
      const api = createApiClient()
      await api.post('/auth/register/', {
        username: input.username,
        email: input.email || undefined,
        display_name: input.displayName || undefined,
        password: input.password,
      })
      const res = await api.post('/auth/login/', {
        username: input.username,
        password: input.password,
      })
      return res.data
    },
    onSuccess: (data) => {
      setTokens({ access: data.access, refresh: data.refresh })
      navigate('/')
    },
  })

  const errorMessage = registerMutation.error
    ? (registerMutation.error.response?.data?.username?.[0] ??
        registerMutation.error.response?.data?.email?.[0] ??
        registerMutation.error.response?.data?.password?.[0] ??
        registerMutation.error.response?.data?.non_field_errors?.[0] ??
        '登録に失敗しました。')
    : null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    registerMutation.mutate({ username, email, displayName, password })
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'var(--bg-deep)' }}>
      <BrandingPanel
        headline={
          <>
            今日から始める
            <br />
            <Box
              component="span"
              sx={{
                background: 'var(--gradient-bar)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              スマート
            </Box>
            な管理
          </>
        }
        subtext={'チームの生産性を\nすぐに向上させましょう。'}
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
          bgcolor: 'var(--bg-deep)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '30%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.04), transparent)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 5, display: { md: 'none' }, animation: 'fadeInUp 0.5s ease both' }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeIcon sx={{ color: 'white', fontSize: 18 }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              TaskBoard AI
            </Typography>
          </Stack>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              mb: 0.5,
              animation: 'fadeInUp 0.5s ease 0.05s both',
            }}
          >
            アカウント作成
          </Typography>
          <Typography
            sx={{
              color: 'var(--text-muted)',
              mb: 4,
              fontSize: 15,
              animation: 'fadeInUp 0.5s ease 0.1s both',
            }}
          >
            新しいアカウントで始めましょう
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: 3,
              animation: 'fadeInUp 0.5s ease 0.15s both',
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>
                    ユーザー名{' '}
                    <Box component="span" sx={{ color: 'var(--error)' }}>*</Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>
                    メールアドレス
                    <Box component="span" sx={{ color: 'var(--text-faint)', fontWeight: 400, ml: 0.5 }}>
                      （任意）
                    </Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>
                    表示名
                    <Box component="span" sx={{ color: 'var(--text-faint)', fontWeight: 400, ml: 0.5 }}>
                      （任意）
                    </Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="山田 太郎"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>
                    パスワード{' '}
                    <Box component="span" sx={{ color: 'var(--error)' }}>*</Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
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
                    bgcolor: 'rgba(248, 113, 113, 0.08)',
                    border: '1px solid rgba(248, 113, 113, 0.2)',
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
                disabled={registerMutation.isPending}
                sx={{ mt: 3, py: 1.3, borderRadius: 2, fontSize: 14, fontWeight: 700 }}
              >
                {registerMutation.isPending ? (
                  <CircularProgress size={22} sx={{ color: 'white' }} />
                ) : (
                  'アカウントを作成'
                )}
              </Button>
            </Box>
          </Paper>

          <Typography
            sx={{
              mt: 3,
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
              animation: 'fadeInUp 0.5s ease 0.2s both',
            }}
          >
            すでにアカウントをお持ちの方は{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                fontWeight: 700,
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              ログイン
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
