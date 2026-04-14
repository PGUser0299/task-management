import React, { useState, useEffect } from 'react'
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
import type { Team } from '../../types'

type Props = {
  open: boolean
  onClose: () => void
  defaultTeamId?: number | null
}

export const ProjectCreateDialog: React.FC<Props> = ({ open, onClose, defaultTeamId }) => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [teamId, setTeamId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    enabled: open,
    queryFn: async () => {
      const res = await api.get('/teams/')
      return res.data.results ?? res.data ?? []
    },
  })

  const teamList = Array.isArray(teams) ? teams : []

  useEffect(() => {
    if (!open) return
    if (defaultTeamId) {
      setTeamId(defaultTeamId)
    } else if (teamList.length > 0 && teamId === '') {
      setTeamId(teamList[0].id)
    }
  }, [open, defaultTeamId, teamList, teamId])

  const createProject = useMutation({
    mutationFn: async () => {
      const res = await api.post('/projects/', {
        name,
        description,
        team_id: teamId,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['all-projects'] })
      handleClose()
    },
    onError: (err) => {
      setError(extractApiError(err))
    },
  })

  const handleClose = () => {
    setName('')
    setDescription('')
    setTeamId('')
    setError(null)
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    createProject.mutate()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
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
          新規プロジェクトを作成
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
                チーム <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={teamId}
                onChange={(e) => setTeamId(Number(e.target.value))}
                required
                disabled={teamList.length === 0}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                {teamList.length === 0 && (
                  <MenuItem value="" disabled>
                    所属チームがありません
                  </MenuItem>
                )}
                {teamList.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                プロジェクト名 <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="プロジェクト名を入力"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                説明
              </Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                placeholder="プロジェクトの説明（任意）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
              sx={{ color: '#64748B', '&:hover': { bgcolor: 'rgba(100,116,139,0.08)' } }}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createProject.isPending || !name.trim() || !teamId}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                px: 3,
              }}
            >
              {createProject.isPending ? '作成中...' : 'プロジェクトを作成'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
