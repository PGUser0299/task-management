import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import BadgeIcon from '@mui/icons-material/Badge'
import { useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'
import { extractApiError } from '../../lib/apiError'

export const DisplayNameForm: React.FC = () => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setLoading(true)
    try {
      await api.patch('/auth/me/display-name/', {
        display_name: displayName,
        password,
      })
      setSuccess('表示名を変更しました。')
      setDisplayName('')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['me'] })
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <BadgeIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          表示名の変更
        </Typography>
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="新しい表示名"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          fullWidth
          required
          size="small"
          sx={{ mb: 2 }}
        />
        <TextField
          label="現在のパスワード（確認）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          size="small"
          sx={{ mb: 2 }}
        />
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !displayName || !password}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          表示名を変更する
        </Button>
      </Box>
    </Paper>
  )
}
