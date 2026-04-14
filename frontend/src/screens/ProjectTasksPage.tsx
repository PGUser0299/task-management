import React from 'react'
import {
  Box,
  Button,
  Chip,
  Fab,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import { TaskCreateDialog } from '../components/tasks/TaskCreateDialog'
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer'
import {
  PRIORITY_CHIP_COLORS,
  PRIORITY_DOT_COLORS,
  PRIORITY_LABELS,
} from '../components/tasks/taskConstants'
import type { Task, TaskStatus } from '../types'

const statusColumns: { key: TaskStatus; label: string; accent: string; bg: string }[] = [
  { key: 'pending', label: 'Pending', accent: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
  { key: 'todo', label: 'To Do', accent: '#64748B', bg: 'rgba(100,116,139,0.08)' },
  { key: 'in_progress', label: 'In Progress', accent: '#4F46E5', bg: 'rgba(79,70,229,0.08)' },
  { key: 'done', label: 'Done', accent: '#10B981', bg: 'rgba(16,185,129,0.08)' },
]

export const ProjectTasksPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const projectIdNum = Number(projectId)
  const api = useApiClient()
  const navigate = useNavigate()
  const [openCreate, setOpenCreate] = React.useState(false)
  const [selectedTaskId, setSelectedTaskId] = React.useState<number | null>(null)

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', projectIdNum],
    enabled: Number.isFinite(projectIdNum),
    queryFn: async () => {
      const res = await api.get('/tasks/', { params: { project: projectIdNum } })
      const raw = res.data.results ?? res.data
      return Array.isArray(raw) ? raw : []
    },
  })

  const { subtaskMap, grouped } = React.useMemo(() => {
    const all = Array.isArray(tasks) ? tasks : []
    const mainTasks = all.filter((t) => !t.parent)
    const subtasks = all.filter((t) => !!t.parent)
    const subtaskMap = subtasks.reduce<Record<number, Task[]>>((acc, st) => {
      const parentId = st.parent as number
      if (!acc[parentId]) acc[parentId] = []
      acc[parentId].push(st)
      return acc
    }, {})
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      todo: [],
      in_progress: [],
      done: [],
    }
    mainTasks.forEach((t) => { grouped[t.status].push(t) })
    return { subtaskMap, grouped }
  }, [tasks])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {/* Page header */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate('/')}
          size="small"
          sx={{ color: '#64748B', '&:hover': { color: '#4F46E5', bgcolor: alpha('#4F46E5', 0.06) } }}
        >
          ダッシュボード
        </Button>
        <Box sx={{ width: 1, height: 16, bgcolor: 'rgba(15,23,42,0.1)' }} />
        <Typography sx={{ fontSize: 14, color: '#0F172A', fontWeight: 600 }}>
          タスクボード
        </Typography>
        <Box flex={1} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          size="small"
          sx={{
            background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
            boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
          }}
        >
          新規タスク
        </Button>
      </Box>

      {/* Kanban board */}
      <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <Typography color="text.secondary">読み込み中...</Typography>
          </Box>
        ) : (
          <Grid container spacing={2.5} sx={{ minWidth: 900, flexWrap: 'nowrap' }}>
            {statusColumns.map((col) => (
              <Grid item xs={3} key={col.key} sx={{ flex: '1 1 0', minWidth: 220 }}>
                {/* Column header */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: col.bg,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.accent, flexShrink: 0 }}
                  />
                  <Typography sx={{ fontWeight: 700, fontSize: 13, color: col.accent }}>
                    {col.label}
                  </Typography>
                  <Box
                    sx={{
                      ml: 'auto',
                      minWidth: 20,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: col.accent,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'white' }}>
                      {grouped[col.key].length}
                    </Typography>
                  </Box>
                </Box>

                {/* Task cards */}
                <Stack spacing={1.5}>
                  {grouped[col.key].map((task) => (
                    <Paper
                      key={task.id}
                      elevation={0}
                      onClick={() => setSelectedTaskId(task.id)}
                      sx={{
                        p: 2,
                        border: '1px solid rgba(15,23,42,0.07)',
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: alpha(col.accent, 0.4),
                          boxShadow: `0 4px 16px ${alpha(col.accent, 0.12)}`,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      {/* Priority dot */}
                      <Box display="flex" alignItems="flex-start" gap={1} mb={1}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            mt: 0.75,
                            bgcolor: PRIORITY_DOT_COLORS[task.priority] ?? '#94A3B8',
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{ fontWeight: 600, fontSize: 13, color: '#0F172A', lineHeight: 1.4 }}
                        >
                          {task.title}
                        </Typography>
                      </Box>

                      {/* Subtasks */}
                      {(subtaskMap[task.id] ?? []).length > 0 && (
                        <Box
                          sx={{
                            mb: 1,
                            pl: 2,
                            borderLeft: `2px solid rgba(15,23,42,0.08)`,
                          }}
                        >
                          {(subtaskMap[task.id] ?? []).map((sub) => (
                            <Typography
                              key={sub.id}
                              sx={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}
                            >
                              · {sub.title}
                            </Typography>
                          ))}
                        </Box>
                      )}

                      {/* Description */}
                      {task.description && (
                        <Typography
                          sx={{ fontSize: 12, color: '#94A3B8', mb: 1, lineHeight: 1.5 }}
                          noWrap
                        >
                          {task.description}
                        </Typography>
                      )}

                      {/* Footer */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={0.5}>
                        <Chip
                          size="small"
                          label={PRIORITY_LABELS[task.priority]}
                          color={PRIORITY_CHIP_COLORS[task.priority]}
                          sx={{ height: 18, fontSize: 10, '& .MuiChip-label': { px: 0.75 } }}
                        />
                        {task.due_date && (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <CalendarTodayIcon sx={{ fontSize: 10, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>
                              {task.due_date}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Assignee */}
                      {task.assignee && (
                        <Box
                          sx={{
                            mt: 1,
                            pt: 1,
                            borderTop: '1px solid rgba(15,23,42,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                          }}
                        >
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              bgcolor: alpha('#4F46E5', 0.12),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 9,
                              fontWeight: 700,
                              color: '#4F46E5',
                            }}
                          >
                            {(task.assignee.display_name || task.assignee.username)[0]?.toUpperCase()}
                          </Box>
                          <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                            {task.assignee.display_name || task.assignee.username}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}

                  {/* Empty state */}
                  {grouped[col.key].length === 0 && (
                    <Box
                      sx={{
                        py: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        border: '1px dashed rgba(15,23,42,0.1)',
                      }}
                    >
                      <Typography sx={{ fontSize: 12, color: '#CBD5E1' }}>タスクなし</Typography>
                    </Box>
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {Number.isFinite(projectIdNum) && (
        <>
          <TaskCreateDialog
            projectId={projectIdNum}
            open={openCreate}
            onClose={() => setOpenCreate(false)}
          />
          <TaskDetailDrawer
            taskId={selectedTaskId}
            projectId={projectIdNum}
            open={selectedTaskId != null}
            onClose={() => setSelectedTaskId(null)}
          />
          <Fab
            color="primary"
            aria-label="新規タスク"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
              boxShadow: '0 8px 20px rgba(79,70,229,0.4)',
            }}
            onClick={() => setOpenCreate(true)}
          >
            <AddIcon />
          </Fab>
        </>
      )}
    </Box>
  )
}
