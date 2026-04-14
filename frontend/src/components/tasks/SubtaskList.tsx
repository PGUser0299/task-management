import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  List,
  ListItem,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'
import { STATUS_OPTIONS } from './taskConstants'
import type { Task, TaskPriority, TaskStatus, TeamMember } from '../../types'

type Props = {
  taskId: number
  projectId: number
  members: TeamMember[]
  defaultPriority: TaskPriority
}

export const SubtaskList: React.FC<Props> = ({
  taskId,
  projectId,
  members,
  defaultPriority,
}) => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  const [subtaskTitle, setSubtaskTitle] = useState('')

  const { data: subtasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks', projectId, 'parent', taskId],
    queryFn: async () => {
      const res = await api.get('/tasks/', { params: { project: projectId, parent: taskId } })
      return res.data.results ?? res.data ?? []
    },
  })

  const addSubtask = useMutation({
    mutationFn: async () => {
      await api.post('/tasks/', {
        project: projectId,
        parent_id: taskId,
        title: subtaskTitle,
        description: '',
        status: 'todo',
        priority: defaultPriority,
      })
    },
    onSuccess: () => {
      setSubtaskTitle('')
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, 'parent', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const updateSubtaskStatus = useMutation({
    mutationFn: async ({ subtaskId, status }: { subtaskId: number; status: TaskStatus }) => {
      await api.patch(`/tasks/${subtaskId}/`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, 'parent', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const updateSubtaskAssignee = useMutation({
    mutationFn: async ({
      subtaskId,
      assigneeId,
    }: {
      subtaskId: number
      assigneeId: number | null
    }) => {
      await api.patch(`/tasks/${subtaskId}/`, { assignee_id: assigneeId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId, 'parent', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const subtaskList = Array.isArray(subtasks) ? subtasks : []

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subtaskTitle.trim()) return
    addSubtask.mutate()
  }

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: '#94A3B8',
          mb: 1,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        サブタスク ({subtaskList.length})
      </Typography>

      {subtaskList.length > 0 && (
        <Box
          sx={{
            mb: 1.5,
            border: '1px solid rgba(15,23,42,0.07)',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          <List dense disablePadding>
            {subtaskList.map((st, idx) => {
              const stStatus = STATUS_OPTIONS.find((s) => s.value === st.status)
              return (
                <ListItem
                  key={st.id}
                  disablePadding
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderBottom:
                      idx < subtaskList.length - 1
                        ? '1px solid rgba(15,23,42,0.05)'
                        : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: stStatus?.color ?? '#94A3B8',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0 }}
                    noWrap
                  >
                    {st.title}
                  </Typography>

                  {/* Status select */}
                  <FormControl size="small" sx={{ flexShrink: 0 }}>
                    <Select
                      value={st.status}
                      onChange={(e) =>
                        updateSubtaskStatus.mutate({
                          subtaskId: st.id,
                          status: e.target.value as TaskStatus,
                        })
                      }
                      renderValue={(v) => {
                        const opt = STATUS_OPTIONS.find((s) => s.value === v)
                        return (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: opt?.color ?? '#94A3B8',
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                              {opt?.label}
                            </Typography>
                          </Box>
                        )
                      }}
                      sx={{
                        fontSize: 11,
                        height: 28,
                        minWidth: 100,
                        bgcolor: 'rgba(15,23,42,0.03)',
                        borderRadius: 1.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(15,23,42,0.1)',
                        },
                        '& .MuiSelect-select': { py: 0.5, px: 1 },
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                bgcolor: opt.color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ fontSize: 13 }}>{opt.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Assignee select */}
                  <FormControl size="small" sx={{ flexShrink: 0 }}>
                    <Select
                      value={st.assignee?.id != null ? String(st.assignee.id) : ''}
                      onChange={(e) =>
                        updateSubtaskAssignee.mutate({
                          subtaskId: st.id,
                          assigneeId:
                            e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      displayEmpty
                      renderValue={(v) => {
                        if (v === '') {
                          return (
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: 'rgba(15,23,42,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                color: '#94A3B8',
                                fontWeight: 700,
                              }}
                            >
                              —
                            </Box>
                          )
                        }
                        const m = members.find((m) => String(m.user.id) === v)
                        const name = m ? m.user.display_name || m.user.username : '?'
                        return (
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              bgcolor: alpha('#4F46E5', 0.15),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              color: '#4F46E5',
                              fontWeight: 700,
                            }}
                          >
                            {name[0]?.toUpperCase()}
                          </Box>
                        )
                      }}
                      sx={{
                        height: 28,
                        width: 44,
                        bgcolor: 'rgba(15,23,42,0.03)',
                        borderRadius: 1.5,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(15,23,42,0.1)',
                        },
                        '& .MuiSelect-select': {
                          py: 0,
                          px: 0.75,
                          display: 'flex',
                          alignItems: 'center',
                        },
                        '& .MuiSelect-icon': { right: 2, fontSize: 14 },
                      }}
                    >
                      <MenuItem value="">
                        <Typography
                          sx={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}
                        >
                          未設定
                        </Typography>
                      </MenuItem>
                      {members.map((m) => (
                        <MenuItem key={m.id} value={String(m.user.id)}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                bgcolor: alpha('#4F46E5', 0.12),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 10,
                                fontWeight: 700,
                                color: '#4F46E5',
                                flexShrink: 0,
                              }}
                            >
                              {(m.user.display_name || m.user.username)[0]?.toUpperCase()}
                            </Box>
                            <Typography sx={{ fontSize: 13 }}>
                              {m.user.display_name || m.user.username}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}

      {/* Add subtask form */}
      <Box
        component="form"
        onSubmit={handleAddSubtask}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'white',
          border: '1px dashed rgba(15,23,42,0.12)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            size="small"
            fullWidth
            placeholder="サブタスクを追加..."
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13 } }}
          />
          <Button
            type="submit"
            size="small"
            variant="contained"
            startIcon={<AddIcon sx={{ fontSize: '14px !important' }} />}
            disabled={!subtaskTitle.trim() || addSubtask.isPending}
            sx={{
              flexShrink: 0,
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              boxShadow: 'none',
              fontSize: 12,
            }}
          >
            追加
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
