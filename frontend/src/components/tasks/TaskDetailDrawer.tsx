import React from 'react'
import {
  Box,
  Chip,
  CircularProgress,
  Drawer,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useApiClient } from '../../lib/apiClient'
import {
  PRIORITY_CHIP_COLORS,
  PRIORITY_DOT_COLORS,
  PRIORITY_LABELS,
  STATUS_OPTIONS,
} from './taskConstants'
import { SubtaskList } from './SubtaskList'
import type { Task, TaskStatus, TeamMember } from '../../types'

export type TaskDetail = Task

type Props = {
  taskId: number | null
  projectId: number
  open: boolean
  onClose: () => void
}

type ProjectMini = { id: number; team: number }

export const TaskDetailDrawer: React.FC<Props> = ({
  taskId,
  projectId,
  open,
  onClose,
}) => {
  const api = useApiClient()
  const queryClient = useQueryClient()

  const { data: task, isLoading } = useQuery<TaskDetail>({
    queryKey: ['task', taskId],
    enabled: open && !!taskId,
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}/`)
      return res.data
    },
  })

  const { data: project } = useQuery<ProjectMini>({
    queryKey: ['project', projectId],
    enabled: open,
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}/`)
      return res.data
    },
  })

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ['team-members', project?.team],
    enabled: open && !!project?.team,
    queryFn: async () => {
      const res = await api.get('/team-memberships/', {
        params: { team: project?.team },
      })
      return res.data.results ?? res.data ?? []
    },
  })

  const updateStatus = useMutation({
    mutationFn: async (status: TaskStatus) => {
      await api.patch(`/tasks/${taskId}/`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  const deleteTask = useMutation({
    mutationFn: async () => {
      await api.delete(`/tasks/${taskId}/`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      onClose()
    },
  })

  const updateAssignee = useMutation({
    mutationFn: async (assigneeId: number | null) => {
      await api.patch(`/tasks/${taskId}/`, { assignee_id: assigneeId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    },
  })

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          border: 'none',
          bgcolor: 'var(--bg-deep)',
          backgroundImage: 'none',
          boxShadow: 'var(--shadow-dialog)',
          backdropFilter: 'none',
        },
      }}
    >
      <Box
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'var(--bg-deep)' }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
            タスク詳細
          </Typography>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Tooltip title="Pending に戻す">
              <IconButton
                size="small"
                onClick={() => updateStatus.mutate('pending')}
                disabled={updateStatus.isPending || !taskId}
                sx={{
                  color: 'var(--text-muted)',
                  '&:hover': { color: 'var(--warning)', bgcolor: 'rgba(251, 191, 36, 0.08)' },
                }}
              >
                <ReplayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="タスクを削除">
              <IconButton
                size="small"
                onClick={() => deleteTask.mutate()}
                disabled={deleteTask.isPending || !taskId}
                sx={{
                  color: 'var(--text-muted)',
                  '&:hover': { color: 'var(--error)', bgcolor: 'rgba(248, 113, 113, 0.08)' },
                }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: 'var(--text-muted)', '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.08)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {isLoading && (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress size={28} />
            </Box>
          )}

          {!isLoading && task && (
            <>
              {/* Task title & description */}
              <Box
                sx={{
                  px: 2.5,
                  py: 2.5,
                  bgcolor: 'var(--bg-surface)',
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <Box display="flex" alignItems="flex-start" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      mt: 1,
                      flexShrink: 0,
                      bgcolor: PRIORITY_DOT_COLORS[task.priority] ?? '#64748B',
                    }}
                  />
                  <Typography
                    sx={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}
                  >
                    {task.title}
                  </Typography>
                </Box>
                {task.description && (
                  <Typography
                    sx={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, pl: 2.5 }}
                  >
                    {task.description}
                  </Typography>
                )}
              </Box>

              {/* Meta chips */}
              <Box
                sx={{
                  px: 2.5,
                  py: 2,
                  bgcolor: 'var(--bg-surface)',
                  borderBottom: '1px solid var(--border-faint)',
                }}
              >
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    size="small"
                    label={PRIORITY_LABELS[task.priority] ?? task.priority}
                    color={PRIORITY_CHIP_COLORS[task.priority] ?? 'default'}
                  />
                  {task.due_date && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<CalendarTodayIcon sx={{ fontSize: '13px !important', color: 'var(--text-secondary)' }} />}
                      label={task.due_date}
                      sx={{ borderColor: 'var(--border-input)', color: 'var(--text-secondary)' }}
                    />
                  )}
                  {task.estimate_minutes != null && (
                    <Chip
                      size="small"
                      variant="outlined"
                      icon={<AccessTimeIcon sx={{ fontSize: '13px !important', color: 'var(--text-secondary)' }} />}
                      label={`${Math.ceil(task.estimate_minutes / (60 * 8))}日`}
                      sx={{ borderColor: 'var(--border-input)', color: 'var(--text-secondary)' }}
                    />
                  )}
                </Box>
              </Box>

              {/* Fields */}
              <Box sx={{ p: 2.5 }}>
                <Stack spacing={2.5}>
                  {/* Status */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        mb: 0.75,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      ステータス
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={task.status}
                        onChange={(e) =>
                          updateStatus.mutate(e.target.value as TaskStatus)
                        }
                        disabled={updateStatus.isPending}
                        renderValue={(v) => {
                          const opt = STATUS_OPTIONS.find((s) => s.value === v)
                          return (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: opt?.color,
                                }}
                              />
                              <Typography sx={{ fontSize: 13, color: 'var(--text-heading)' }}>
                                {opt?.label}
                              </Typography>
                            </Box>
                          )
                        }}
                        sx={{
                          bgcolor: 'var(--bg-input)',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--border-input)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--border-hover)',
                          },
                        }}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: opt.color,
                                }}
                              />
                              <Typography sx={{ fontSize: 13, color: 'var(--text-heading)' }}>
                                {opt.label}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Assignee */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        mb: 0.75,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      担当者
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={task.assignee?.id ?? ''}
                        onChange={(e) =>
                          updateAssignee.mutate(
                            e.target.value === '' ? null : Number(e.target.value)
                          )
                        }
                        displayEmpty
                        sx={{
                          bgcolor: 'var(--bg-input)',
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--border-input)',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'var(--border-hover)',
                          },
                        }}
                      >
                        <MenuItem value="">
                          <Typography
                            sx={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}
                          >
                            未設定
                          </Typography>
                        </MenuItem>
                        {members.map((m) => (
                          <MenuItem key={m.id} value={m.user.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '50%',
                                  background: 'var(--avatar-bg)',
                                  border: '1px solid var(--avatar-border)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: 'var(--accent-primary)',
                                }}
                              >
                                {(m.user.display_name || m.user.username)[0]?.toUpperCase()}
                              </Box>
                              <Typography sx={{ fontSize: 13, color: 'var(--text-heading)' }}>
                                {m.user.display_name || m.user.username}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Subtasks */}
                  <SubtaskList
                    taskId={task.id}
                    projectId={projectId}
                    members={members}
                    defaultPriority={task.priority}
                  />
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
