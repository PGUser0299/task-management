import React, { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'
import { PRIORITY_OPTIONS } from './taskConstants'

type AiSubtask = {
  title: string
  estimate_minutes: number | null
  enabled: boolean
}

type Props = {
  projectId: number
  open: boolean
  onClose: () => void
}

export const TaskCreateDialog: React.FC<Props> = ({ projectId, open, onClose }) => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [estimateDays, setEstimateDays] = useState<number | ''>('')
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSubtasks, setAiSubtasks] = useState<AiSubtask[]>([])
  const [aiWarning, setAiWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createTask = useMutation({
    mutationFn: async () => {
      // 1. Create the parent task
      const parentRes = await api.post('/tasks/', {
        project: projectId,
        title,
        description,
        priority,
        estimate_minutes: estimateDays ? estimateDays * 8 * 60 : null,
      })
      const parentTask = parentRes.data as { id: number }

      // 2. Create enabled subtasks in parallel
      const enabledSubtasks = aiSubtasks.filter((s) => s.enabled)
      if (enabledSubtasks.length > 0) {
        await Promise.all(
          enabledSubtasks.map((sub) =>
            api.post('/tasks/', {
              project: projectId,
              title: sub.title,
              priority,
              estimate_minutes: sub.estimate_minutes,
              parent_id: parentTask.id,
            }),
          ),
        )
      }

      return parentTask
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
    setAiSubtasks([])
    setAiWarning(null)
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
        is_ai: boolean
        ai_error: string | null
      }
      setTitle(data.title)
      setDescription(data.description)
      if (data.estimate_minutes) {
        setEstimateDays(Math.max(1, Math.ceil(data.estimate_minutes / (60 * 8))))
      }
      if (data.priority) {
        setPriority(data.priority)
      }
      setAiSubtasks(
        (data.subtasks ?? []).map((s) => ({
          title: s.title,
          estimate_minutes: s.estimate_minutes,
          enabled: true,
        })),
      )
      setAiWarning(data.ai_error ?? null)
    } catch (e) {
      console.error(e)
      setError('AI によるタスク分解に失敗しました。')
    } finally {
      setAiLoading(false)
    }
  }

  const toggleSubtask = (index: number) => {
    setAiSubtasks((prev) =>
      prev.map((s, i) => (i === index ? { ...s, enabled: !s.enabled } : s)),
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createTask.mutate()
  }

  const formatMinutes = (minutes: number | null) => {
    if (!minutes) return null
    if (minutes < 60) return `${minutes}分`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}時間${m}分` : `${h}時間`
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

          {/* AI Warning */}
          {aiWarning && (
            <Box
              sx={{
                mb: 2,
                px: 1.5,
                py: 1,
                borderRadius: 1.5,
                bgcolor: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
              }}
            >
              <Typography sx={{ fontSize: 12, color: '#B45309' }}>
                {aiWarning}
              </Typography>
            </Box>
          )}

          {/* AI Subtasks Preview */}
          {aiSubtasks.length > 0 && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha('#10B981', 0.04),
                border: `1px solid ${alpha('#10B981', 0.15)}`,
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#059669' }}>
                  AI が提案するサブタスク ({aiSubtasks.filter((s) => s.enabled).length}/{aiSubtasks.length})
                </Typography>
                <Chip
                  size="small"
                  icon={<AccessTimeIcon sx={{ fontSize: 12 }} />}
                  label={formatMinutes(
                    aiSubtasks
                      .filter((s) => s.enabled)
                      .reduce((sum, s) => sum + (s.estimate_minutes ?? 0), 0),
                  ) ?? '—'}
                  sx={{ height: 22, fontSize: 11, bgcolor: alpha('#10B981', 0.1), color: '#059669' }}
                />
              </Stack>
              <Stack spacing={0.5}>
                {aiSubtasks.map((sub, idx) => (
                  <Stack
                    key={idx}
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{
                      py: 0.5,
                      px: 1,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': { bgcolor: alpha('#10B981', 0.06) },
                      opacity: sub.enabled ? 1 : 0.45,
                    }}
                    onClick={() => toggleSubtask(idx)}
                  >
                    <Checkbox
                      checked={sub.enabled}
                      size="small"
                      sx={{
                        p: 0.25,
                        color: '#94A3B8',
                        '&.Mui-checked': { color: '#10B981' },
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: '#1E293B',
                        flex: 1,
                        textDecoration: sub.enabled ? 'none' : 'line-through',
                      }}
                    >
                      {sub.title}
                    </Typography>
                    {sub.estimate_minutes != null && (
                      <Typography sx={{ fontSize: 11, color: '#94A3B8', flexShrink: 0 }}>
                        {formatMinutes(sub.estimate_minutes)}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

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
                  {PRIORITY_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.longLabel}
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
              {createTask.isPending
                ? '作成中...'
                : aiSubtasks.filter((s) => s.enabled).length > 0
                  ? `タスクを作成 (+ サブタスク ${aiSubtasks.filter((s) => s.enabled).length}件)`
                  : 'タスクを作成'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
