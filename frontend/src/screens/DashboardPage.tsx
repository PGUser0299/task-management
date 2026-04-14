import React from 'react'
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import GroupIcon from '@mui/icons-material/Group'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import type { Team, Project, SuggestTodayResponse, TeamMember, Task } from '../types'

const STATUS_COLORS: Record<string, string> = {
  pending: '#CBD5E1',
  todo: '#94A3B8',
  in_progress: '#4F46E5',
  done: '#10B981',
}

const STATUS_LEGEND = [
  { key: 'pending', label: 'Pending', color: '#CBD5E1' },
  { key: 'todo', label: 'To Do', color: '#94A3B8' },
  { key: 'in_progress', label: 'Doing', color: '#4F46E5' },
  { key: 'done', label: 'Done', color: '#10B981' },
] as const

type StatCardProps = {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bgColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      border: '1px solid rgba(15,23,42,0.07)',
      borderRadius: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        bgcolor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    </Box>
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.25 }}>{label}</Typography>
    </Box>
  </Paper>
)

const priorityLabel: Record<string, string> = {
  urgent: '緊急',
  high: '高',
  medium: '中',
  low: '低',
}

const priorityColor: Record<string, 'error' | 'warning' | 'success' | 'default'> = {
  urgent: 'error',
  high: 'warning',
  medium: 'success',
  low: 'default',
}

export const DashboardPage: React.FC = () => {
  const api = useApiClient()
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = React.useState<number | null>(null)

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await api.get('/teams/')
      return res.data.results ?? res.data ?? []
    },
  })

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects', selectedTeamId],
    enabled: !!selectedTeamId,
    queryFn: async () => {
      const res = await api.get('/projects/', { params: { team: selectedTeamId } })
      return res.data.results ?? res.data ?? []
    },
  })

  const { data: aiSuggest, isLoading: aiLoading } = useQuery<SuggestTodayResponse>({
    queryKey: ['ai-suggest-today', selectedTeamId],
    enabled: !!selectedTeamId,
    queryFn: async () => {
      const res = await api.post('/ai/suggest-today/', { team_id: selectedTeamId })
      return res.data
    },
  })

  const { data: members } = useQuery<TeamMember[]>({
    queryKey: ['team-members', selectedTeamId],
    enabled: !!selectedTeamId,
    queryFn: async () => {
      const res = await api.get('/team-memberships/', { params: { team: selectedTeamId } })
      return res.data.results ?? res.data ?? []
    },
  })

  const { data: teamTasks } = useQuery<Task[]>({
    queryKey: ['team-tasks', selectedTeamId],
    enabled: !!selectedTeamId,
    queryFn: async () => {
      const res = await api.get('/tasks/', { params: { team: selectedTeamId } })
      const raw = res.data.results ?? res.data ?? []
      return (Array.isArray(raw) ? raw : []) as Task[]
    },
  })

  React.useEffect(() => {
    const list = Array.isArray(teams) ? teams : []
    if (list.length > 0) {
      setSelectedTeamId((prev) => prev ?? list[0].id)
    }
  }, [teams])

  const teamList = React.useMemo(
    () => (Array.isArray(teams) ? teams : []),
    [teams]
  )
  const projectList = React.useMemo(
    () => (Array.isArray(projects) ? projects : []),
    [projects]
  )
  const memberList = React.useMemo(
    () => (Array.isArray(members) ? members : []),
    [members]
  )
  const teamTaskList = React.useMemo(
    () => (Array.isArray(teamTasks) ? teamTasks : []),
    [teamTasks]
  )
  const suggestItems = React.useMemo(() => aiSuggest?.items ?? [], [aiSuggest])

  const { inProgressTasks, activeProjectList, activeMemberList, projectNameMap } =
    React.useMemo(() => {
      const inProgressProjectIds = new Set(
        teamTaskList.filter((t) => t.status === 'in_progress').map((t) => t.project)
      )
      const inProgressAssigneeIds = new Set(
        teamTaskList
          .filter((t) => t.status === 'in_progress' && t.assignee)
          .map((t) => t.assignee!.id)
      )
      return {
        inProgressTasks: teamTaskList.filter((t) => t.status === 'in_progress').length,
        activeProjectList: projectList.filter((p) => inProgressProjectIds.has(p.id)),
        activeMemberList: memberList.filter((m) => inProgressAssigneeIds.has(m.user.id)),
        projectNameMap: new Map(projectList.map((p) => [p.id, p.name])),
      }
    }, [teamTaskList, projectList, memberList])

  if (teamsLoading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Page header */}
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          py: 3,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          ダッシュボード
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: 14, mt: 0.25 }}>
          チームのタスク進捗と一覧を確認
        </Typography>

        {/* Team tabs */}
        {teamList.length > 0 && (
          <Tabs
            value={selectedTeamId ?? false}
            onChange={(_, v) => setSelectedTeamId(v as number)}
            sx={{
              mt: 2,
              minHeight: 36,
              '& .MuiTab-root': { minHeight: 36, py: 0.5, fontSize: 13, fontWeight: 600 },
              '& .MuiTabs-indicator': { height: 2 },
            }}
          >
            {teamList.map((team) => (
              <Tab key={team.id} label={team.name} value={team.id} />
            ))}
          </Tabs>
        )}
        {teamList.length === 0 && (
          <Typography sx={{ color: '#94A3B8', fontSize: 14, mt: 1.5 }}>
            所属チームがまだありません。
          </Typography>
        )}
      </Box>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {selectedTeamId && (
          <Stack spacing={3}>
            {/* Stats row */}
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <StatCard
                  label="プロジェクト数"
                  value={projectList.length}
                  icon={<FolderOpenIcon />}
                  color="#4F46E5"
                  bgColor={alpha('#4F46E5', 0.1)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  label="タスク総数"
                  value={teamTaskList.length}
                  icon={<PendingActionsIcon />}
                  color="#0EA5E9"
                  bgColor={alpha('#0EA5E9', 0.1)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  label="対応中"
                  value={inProgressTasks}
                  icon={<AssignmentTurnedInIcon />}
                  color="#F59E0B"
                  bgColor={alpha('#F59E0B', 0.1)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <StatCard
                  label="メンバー数"
                  value={memberList.length}
                  icon={<GroupIcon />}
                  color="#10B981"
                  bgColor={alpha('#10B981', 0.1)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3} alignItems="start">
              {/* AI Suggest */}
              <Grid item xs={12} lg={7}>
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid rgba(15,23,42,0.07)',
                    borderRadius: 2.5,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      borderBottom: '1px solid rgba(15,23,42,0.07)',
                      background: 'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(129,140,248,0.03) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        background: 'linear-gradient(135deg, #818CF8, #4F46E5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 15 }}>本日の重要タスク</Typography>
                  </Box>
                  <Box sx={{ p: 2.5 }}>
                    {aiLoading ? (
                      <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <>
                        {aiSuggest?.summary && (
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: alpha('#4F46E5', 0.05),
                              border: '1px solid',
                              borderColor: alpha('#4F46E5', 0.12),
                              mb: 2,
                            }}
                          >
                            <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                              {aiSuggest.summary}
                            </Typography>
                          </Box>
                        )}
                        {!aiSuggest?.summary && (
                          <Typography sx={{ fontSize: 13, color: '#94A3B8', mb: 2 }}>
                            チームを選択すると、フォーカスすべきタスクが提案されます。
                          </Typography>
                        )}
                        <Stack spacing={1.5}>
                          {suggestItems.map((item) => (
                            <Paper
                              key={item.id}
                              elevation={0}
                              sx={{
                                p: 2,
                                border: '1px solid rgba(15,23,42,0.07)',
                                borderRadius: 2,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                '&:hover': {
                                  borderColor: alpha('#4F46E5', 0.3),
                                  boxShadow: `0 4px 12px ${alpha('#4F46E5', 0.08)}`,
                                },
                              }}
                              onClick={() => navigate(`/projects/${item.project_id}`)}
                            >
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                                <Box flex={1} minWidth={0}>
                                  {projectNameMap.has(item.project_id) && (
                                    <Typography sx={{ fontSize: 11, color: '#818CF8', fontWeight: 600, mb: 0.25 }} noWrap>
                                      {projectNameMap.get(item.project_id)}
                                    </Typography>
                                  )}
                                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>
                                    {item.title}
                                  </Typography>
                                  <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
                                    {item.reason}
                                  </Typography>
                                </Box>
                                <Box display="flex" gap={0.75} flexShrink={0}>
                                  <Chip
                                    size="small"
                                    label={priorityLabel[item.priority] ?? item.priority}
                                    color={priorityColor[item.priority] ?? 'default'}
                                    sx={{ height: 20, fontSize: 11 }}
                                  />
                                  {item.due_date && (
                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      label={item.due_date}
                                      sx={{ height: 20, fontSize: 11 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                          {suggestItems.length === 0 && aiSuggest && (
                            <Typography sx={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', py: 2 }}>
                              提案するタスクはありません。
                            </Typography>
                          )}
                        </Stack>
                      </>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Right column: Projects + Members */}
              <Grid item xs={12} lg={5}>
                <Stack spacing={3}>
                  {/* Projects */}
                  <Paper
                    elevation={0}
                    sx={{ border: '1px solid rgba(15,23,42,0.07)', borderRadius: 2.5, overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        borderBottom: '1px solid rgba(15,23,42,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>プロジェクト</Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate('/projects')}
                        sx={{ fontSize: 12, py: 0.25, px: 1 }}
                      >
                        すべて見る
                      </Button>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1}>
                        {activeProjectList.slice(0, 5).map((project) => (
                          <Box
                            key={project.id}
                            onClick={() => navigate(`/projects/${project.id}`)}
                            sx={{
                              px: 1.5,
                              py: 1.25,
                              borderRadius: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              '&:hover': {
                                bgcolor: alpha('#4F46E5', 0.05),
                              },
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={1.5}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: '#4F46E5',
                                  flexShrink: 0,
                                }}
                              />
                              <Box flex={1} minWidth={0}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }} noWrap>
                                  {project.name}
                                </Typography>
                                {project.description && (
                                  <Typography sx={{ fontSize: 11, color: '#94A3B8' }} noWrap>
                                    {project.description}
                                  </Typography>
                                )}
                              </Box>
                              <ArrowForwardIcon sx={{ fontSize: 14, color: '#CBD5E1' }} />
                            </Box>
                          </Box>
                        ))}
                        {activeProjectList.length === 0 && (
                          <Typography sx={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', py: 2 }}>
                            対応中のプロジェクトはありません。
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Paper>

                  {/* Members */}
                  <Paper
                    elevation={0}
                    sx={{ border: '1px solid rgba(15,23,42,0.07)', borderRadius: 2.5, overflow: 'hidden' }}
                  >
                    <Box
                      sx={{
                        px: 2.5,
                        py: 1.75,
                        borderBottom: '1px solid rgba(15,23,42,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>メンバー</Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        onClick={() => navigate('/members')}
                        sx={{ fontSize: 12, py: 0.25, px: 1 }}
                      >
                        すべて見る
                      </Button>
                    </Box>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={0.75}>
                        {activeMemberList.slice(0, 6).map((m) => (
                          <Box
                            key={m.id}
                            sx={{
                              px: 1.5,
                              py: 1,
                              borderRadius: 1.5,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '50%',
                                bgcolor: alpha('#4F46E5', 0.12),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#4F46E5',
                                flexShrink: 0,
                              }}
                            >
                              {(m.user.display_name || m.user.username)[0]?.toUpperCase()}
                            </Box>
                            <Box flex={1} minWidth={0}>
                              <Typography sx={{ fontSize: 13, fontWeight: 500 }} noWrap>
                                {m.user.display_name || m.user.username}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={m.role === 'owner' ? 'オーナー' : 'メンバー'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: 10 }}
                            />
                          </Box>
                        ))}
                        {activeMemberList.length === 0 && (
                          <Typography sx={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', py: 2 }}>
                            対応中のメンバーはいません。
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Paper>
                </Stack>
              </Grid>
            </Grid>

            {/* Task progress summary */}
            {teamTaskList.length > 0 && (
              <Paper
                elevation={0}
                sx={{ border: '1px solid rgba(15,23,42,0.07)', borderRadius: 2.5, p: 2.5 }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>タスク進捗</Typography>
                <Box sx={{ display: 'flex', gap: 0, borderRadius: 1.5, overflow: 'hidden', height: 8 }}>
                  {Object.keys(STATUS_COLORS).map((s) => {
                    const count = teamTaskList.filter((t) => t.status === s).length
                    const pct = teamTaskList.length ? (count / teamTaskList.length) * 100 : 0
                    return pct > 0 ? (
                      <Box key={s} sx={{ flex: `0 0 ${pct}%`, bgcolor: STATUS_COLORS[s] }} />
                    ) : null
                  })}
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" flexWrap="wrap" gap={2}>
                  {STATUS_LEGEND.map(({ key, label, color }) => {
                    const count = teamTaskList.filter((t) => t.status === key).length
                    return (
                      <Box key={key} display="flex" alignItems="center" gap={0.75}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                        <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                          {label}: <strong>{count}</strong>
                        </Typography>
                      </Box>
                    )
                  })}
                </Box>
              </Paper>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  )
}
