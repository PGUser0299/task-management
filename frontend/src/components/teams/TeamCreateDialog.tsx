import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'
import { extractApiError } from '../../lib/apiError'

type Props = {
  open: boolean
  onClose: () => void
  onCreated?: (teamId: number) => void
}

export const TeamCreateDialog: React.FC<Props> = ({ open, onClose, onCreated }) => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createTeam = useMutation({
    mutationFn: async () => {
      const res = await api.post('/teams/', { name })
      return res.data as { id: number; name: string }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] })
      onCreated?.(data.id)
      handleClose()
    },
    onError: (err) => {
      setError(extractApiError(err))
    },
  })

  const handleClose = () => {
    setName('')
    setError(null)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    createTeam.mutate()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
          新規チームを作成
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', mb: 0.75 }}>
                チーム名 <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="チーム名を入力"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
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
              <Typography color="error" sx={{ fontSize: 13 }}>
                {error}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              onClick={handleClose}
              sx={{ color: 'var(--text-muted)', '&:hover': { bgcolor: 'rgba(100,116,139,0.08)' } }}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createTeam.isPending || !name.trim()}
              sx={{ px: 3 }}
            >
              {createTeam.isPending ? '作成中...' : 'チームを作成'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
