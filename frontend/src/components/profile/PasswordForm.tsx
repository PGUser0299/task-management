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
import LockIcon from '@mui/icons-material/Lock'
import { useApiClient } from '../../lib/apiClient'
import { extractApiError } from '../../lib/apiError'

export const PasswordForm: React.FC = () => {
  const api = useApiClient()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    if (newPassword !== newPasswordConfirm) {
      setError('新しいパスワードが一致しません。')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/me/password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      })
      setSuccess('パスワードを変更しました。')
      setOldPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    } catch (err) {
      setError(extractApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <LockIcon fontSize="small" color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          パスワードの変更
        </Typography>
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          label="現在のパスワード"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          fullWidth
          required
          size="small"
          sx={{ mb: 2 }}
        />
        <TextField
          label="新しいパスワード"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          required
          size="small"
          inputProps={{ minLength: 8 }}
          helperText="8文字以上"
          sx={{ mb: 2 }}
        />
        <TextField
          label="新しいパスワード（確認）"
          type="password"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
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
          disabled={loading || !oldPassword || !newPassword || !newPasswordConfirm}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          パスワードを変更する
        </Button>
      </Box>
    </Paper>
  )
}
