import React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import GroupIcon from '@mui/icons-material/Group'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import { useMe } from '../lib/queries'
import { TeamCreateDialog } from '../components/teams/TeamCreateDialog'
import { ProjectCreateDialog } from '../components/projects/ProjectCreateDialog'
import { StatCard } from '../components/dashboard/StatCard'
import { AiSuggestPanel } from '../components/dashboard/AiSuggestPanel'
import { ActiveProjectsPanel } from '../components/dashboard/ActiveProjectsPanel'
import { ActiveMembersPanel } from '../components/dashboard/ActiveMembersPanel'
import { TaskProgressSummary } from '../components/dashboard/TaskProgressSummary'
import type { Team, Project, SuggestTodayResponse, TeamMember, Task } from '../types'

export const DashboardPage: React.FC = () => {
  const api = useApiClient()
  const navigate = useNavigate()
  const [selectedTeamId, setSelectedTeamId] = React.useState<number | null>(null)
  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = React.useState(false)

  const { data: me } = useMe()
  const isAdmin = !!me?.is_admin

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

  const teamList = React.useMemo(() => (Array.isArray(teams) ? teams : []), [teams])
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
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}
            >
              ダッシュボード
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 14, mt: 0.25 }}>
              チームのタスク進捗と一覧を確認
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setTeamDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                flexShrink: 0,
              }}
            >
              チーム作成
            </Button>
          )}
        </Stack>

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
              <Grid item xs={12} lg={7}>
                <AiSuggestPanel
                  loading={aiLoading}
                  suggest={aiSuggest}
                  projectNameMap={projectNameMap}
                  onItemClick={(projectId) => navigate(`/projects/${projectId}`)}
                />
              </Grid>

              <Grid item xs={12} lg={5}>
                <Stack spacing={3}>
                  <ActiveProjectsPanel
                    projects={activeProjectList}
                    isAdmin={isAdmin}
                    onCreate={() => setProjectDialogOpen(true)}
                    onViewAll={() => navigate('/projects')}
                    onSelect={(id) => navigate(`/projects/${id}`)}
                  />
                  <ActiveMembersPanel
                    members={activeMemberList}
                    onViewAll={() => navigate('/members')}
                  />
                </Stack>
              </Grid>
            </Grid>

            <TaskProgressSummary tasks={teamTaskList} />
          </Stack>
        )}
      </Container>

      <TeamCreateDialog
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        onCreated={(id) => setSelectedTeamId(id)}
      />
      <ProjectCreateDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        defaultTeamId={selectedTeamId}
      />
    </Box>
  )
}
