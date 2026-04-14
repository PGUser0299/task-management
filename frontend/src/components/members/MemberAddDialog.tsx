import React, { useState, useMemo } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'
import { extractApiError } from '../../lib/apiError'
import type { TeamMember, UserMini } from '../../types'

type Props = {
  teamId: number
  open: boolean
  onClose: () => void
}

const roleOptions = [
  { value: 'member', label: 'メンバー' },
  { value: 'owner', label: 'オーナー' },
]

export const MemberAddDialog: React.FC<Props> = ({ teamId, open, onClose }) => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [userId, setUserId] = useState<number | ''>('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState<string | null>(null)

  const { data: users } = useQuery<UserMini[]>({
    queryKey: ['users'],
    enabled: open,
    queryFn: async () => {
      const res = await api.get('/users/')
      return res.data.results ?? res.data ?? []
    },
  })

  const { data: memberships } = useQuery<TeamMember[]>({
    queryKey: ['team-members', teamId],
    enabled: open && !!teamId,
    queryFn: async () => {
      const res = await api.get('/team-memberships/', { params: { team: teamId } })
      return res.data.results ?? res.data ?? []
    },
  })

  // superuser 及びすでにチームに所属しているメンバーは候補から除外
  const candidates = useMemo(() => {
    const list = Array.isArray(users) ? users : []
    const existingIds = new Set(
      (Array.isArray(memberships) ? memberships : []).map((m) => m.user.id)
    )
    return list.filter((u) => !u.is_superuser && !existingIds.has(u.id))
  }, [users, memberships])

  const addMember = useMutation({
    mutationFn: async () => {
      const res = await api.post('/team-memberships/', {
        team: teamId,
        user_id: userId,
        role,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', teamId] })
      handleClose()
    },
    onError: (err) => {
      setError(extractApiError(err))
    },
  })

  const handleClose = () => {
    setUserId('')
    setRole('member')
    setError(null)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    addMember.mutate()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 25px 50px rgba(15,23,42,0.2)' } }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0F172A' }}>
          メンバーを追加
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                ユーザー <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={userId}
                onChange={(e) => setUserId(Number(e.target.value))}
                required
                disabled={candidates.length === 0}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                {candidates.length === 0 && (
                  <MenuItem value="" disabled>
                    追加できるユーザーがいません
                  </MenuItem>
                )}
                {candidates.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.display_name || u.username}
                    {u.display_name && (
                      <Typography
                        component="span"
                        sx={{ fontSize: 11, color: '#94A3B8', ml: 1 }}
                      >
                        @{u.username}
                      </Typography>
                    )}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                ロール
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                {roleOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
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
              sx={{ color: '#64748B', '&:hover': { bgcolor: 'rgba(100,116,139,0.08)' } }}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addMember.isPending || !userId}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                px: 3,
              }}
            >
              {addMember.isPending ? '追加中...' : 'メンバーを追加'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
