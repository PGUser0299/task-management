import React, { useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CloseIcon from '@mui/icons-material/Close'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'

type Props = {
  projectId: number
  open: boolean
  onClose: () => void
}

const priorityOptions = [
  { value: 'low', label: '低 (Low)' },
  { value: 'medium', label: '中 (Medium)' },
  { value: 'high', label: '高 (High)' },
  { value: 'urgent', label: '緊急 (Urgent)' },
]

export const TaskCreateDialog: React.FC<Props> = ({ projectId, open, onClose }) => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [estimateDays, setEstimateDays] = useState<number | ''>('')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTask = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks/', {
        project: projectId,
        title,
        description,
        priority,
        estimate_minutes: estimateDays ? estimateDays * 8 * 60 : null,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      handleClose()
    },
    onError: () => {
      setError('タスクの作成に失敗しました。')
    },
  })

  const handleClose = () => {
    setTitle('')
    setDescription('')
    setPriority('medium')
    setEstimateDays('')
    setAiInput('')
    setError(null)
    onClose()
  }

  const handleAiParse = async () => {
    setAiLoading(true)
    setError(null)
    try {
      const res = await api.post('/ai/parse-task/', { text: aiInput })
      const data = res.data as {
        title: string
        description: string
        estimate_minutes: number | null
        priority: string
        subtasks: { title: string; estimate_minutes: number | null }[]
      }
      setTitle(data.title)
      setDescription(data.description)
      if (data.estimate_minutes) {
        setEstimateDays(Math.max(1, Math.ceil(data.estimate_minutes / (60 * 8))))
      }
      if (data.priority) {
        setPriority(data.priority)
      }
    } catch (e) {
      console.error(e)
      setError('AI によるタスク分解に失敗しました。')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTask.mutate()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px rgba(15,23,42,0.2)',
        },
      }}
    >
      {/* Header */}
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
          新規タスクを作成
        </Typography>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          {/* AI Section */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha('#4F46E5', 0.05),
              border: `1px solid ${alpha('#4F46E5', 0.15)}`,
              mb: 3,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #818CF8, #4F46E5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoAwesomeIcon sx={{ fontSize: 13, color: 'white' }} />
              </Box>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#4F46E5' }}>
                AI でタスクを自動生成
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                multiline
                minRows={2}
                fullWidth
                size="small"
                placeholder="例: 来週のリリース準備（テスト、ドキュメント作成など）"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'white',
                    borderRadius: 1.5,
                    fontSize: 13,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleAiParse}
                disabled={aiLoading || !aiInput.trim()}
                size="small"
                sx={{
                  minWidth: 88,
                  background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                  boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                  flexShrink: 0,
                  alignSelf: 'flex-end',
                }}
              >
                {aiLoading ? '解析中...' : 'AI 分解'}
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 11, color: '#CBD5E1', px: 1 }}>タスク詳細</Typography>
          </Divider>

          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                タイトル <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="タスクのタイトルを入力"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                placeholder="タスクの詳細説明（任意）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Stack direction="row" spacing={2}>
              <Box flex={1}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                  優先度
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                >
                  {priorityOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box flex={1}>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#374151', mb: 0.75 }}>
                  見積 (日)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="0"
                  value={estimateDays}
                  onChange={(e) => setEstimateDays(e.target.value ? Number(e.target.value) : '')}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Box>
            </Stack>
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

          {/* Actions */}
          <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button
              onClick={handleClose}
              sx={{ color: '#64748B', '&:hover': { bgcolor: 'rgba(100,116,139,0.08)' } }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={createTask.isPending || !title.trim()}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                px: 3,
              }}
            >
              {createTask.isPending ? '作成中...' : 'タスクを作成'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
