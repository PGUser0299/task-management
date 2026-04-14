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
import { createApiClient } from '../lib/apiClient'
import { useAuth } from '../state/auth'
import { BrandingPanel } from '../components/auth/BrandingPanel'

type RegisterErrorData = {
  username?: string[]
  email?: string[]
  password?: string[]
  non_field_errors?: string[]
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { setTokens } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const api = createApiClient()
    try {
      await api.post('/auth/register/', {
        username,
        email: email || undefined,
        display_name: displayName || undefined,
        password,
      })
      const res = await api.post('/auth/login/', { username, password })
      setTokens({ access: res.data.access, refresh: res.data.refresh })
      navigate('/')
    } catch (err) {
      const axiosErr = err as AxiosError<RegisterErrorData>
      const data = axiosErr.response?.data
      const msg =
        data?.username?.[0] ??
        data?.email?.[0] ??
        data?.password?.[0] ??
        data?.non_field_errors?.[0] ??
        '登録に失敗しました。'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      <BrandingPanel
        headline={
          <>
            今日から始める
            <br />
            <Box component="span" sx={{ color: '#818CF8' }}>スマート</Box>な管理
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
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
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
            アカウント作成
          </Typography>
          <Typography sx={{ color: '#64748B', mb: 4, fontSize: 15 }}>
            新しいアカウントで始めましょう
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
              <Stack spacing={2}>
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.75 }}
                  >
                    ユーザー名{' '}
                    <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="username"
                    required
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
                    メールアドレス
                    <Box
                      component="span"
                      sx={{ color: '#94A3B8', fontWeight: 400, ml: 0.5 }}
                    >
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.75 }}
                  >
                    表示名
                    <Box
                      component="span"
                      sx={{ color: '#94A3B8', fontWeight: 400, ml: 0.5 }}
                    >
                      （任意）
                    </Box>
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="山田 太郎"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: '#374151', mb: 0.75 }}
                  >
                    パスワード{' '}
                    <Box component="span" sx={{ color: 'error.main' }}>*</Box>
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
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                  />
                </Box>
              </Stack>

              {error && (
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
                    {error}
                  </Typography>
                </Box>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
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
                {loading ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  'アカウントを作成'
                )}
              </Button>
            </Box>
          </Paper>

          <Typography sx={{ mt: 3, textAlign: 'center', color: '#64748B', fontSize: 14 }}>
            すでにアカウントをお持ちの方は{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                fontWeight: 700,
                color: '#4F46E5',
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
