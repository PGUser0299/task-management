import React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PersonIcon from '@mui/icons-material/Person'
import AddIcon from '@mui/icons-material/Add'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import { MemberAddDialog } from '../components/members/MemberAddDialog'
import type { Team, TeamMember, Me } from '../types'

type MemberUser = {
  id: number
  username: string
  display_name: string
  email?: string
  is_superuser?: boolean
}

type MemberEntry = TeamMember & { user: MemberUser }

const avatarColors = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
]

const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length]

export const MembersPage: React.FC = () => {
  const api = useApiClient()
  const [selectedTeamId, setSelectedTeamId] = React.useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { data: me } = useQuery<Me>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me/')
      return res.data
    },
    staleTime: 1000 * 60 * 5,
  })
  const isAdmin = !!me?.is_admin

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await api.get('/teams/')
      return res.data.results ?? res.data ?? []
    },
  })

  const { data: memberships, isLoading: membersLoading, isError } = useQuery<MemberEntry[]>({
    queryKey: ['team-members', selectedTeamId],
    enabled: !!selectedTeamId,
    queryFn: async () => {
      const res = await api.get('/team-memberships/', { params: { team: selectedTeamId } })
      return res.data.results ?? res.data ?? []
    },
  })

  React.useEffect(() => {
    const list = Array.isArray(teams) ? teams : []
    if (list.length > 0) {
      setSelectedTeamId((prev) => prev ?? list[0].id)
    }
  }, [teams])

  const teamList = Array.isArray(teams) ? teams : []

  // superuser を除外
  const members = (Array.isArray(memberships) ? memberships : []).filter(
    (m) => !m.user.is_superuser
  )

  const isLoading = teamsLoading || membersLoading

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          py: 3,
          bgcolor: 'white',
          borderBottom: '1px solid rgba(15,23,42,0.07)',
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              メンバー
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 14, mt: 0.25 }}>
              チームに所属しているメンバー一覧
            </Typography>
          </Box>
          {isAdmin && selectedTeamId && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
                flexShrink: 0,
              }}
            >
              メンバー追加
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
        {!teamsLoading && teamList.length === 0 && (
          <Typography sx={{ color: '#94A3B8', fontSize: 14, mt: 1.5 }}>
            所属チームがまだありません。
          </Typography>
        )}
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        {isLoading && (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <Typography color="error" sx={{ fontSize: 14 }}>
              メンバー情報の読み込みに失敗しました。
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && selectedTeamId && (
          <>
            {members.length === 0 ? (
              <Box
                sx={{
                  py: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: alpha('#0EA5E9', 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon sx={{ color: '#0EA5E9', fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#475569' }}>
                  メンバーがまだ登録されていません
                </Typography>
              </Box>
            ) : (
              <>
                <Typography sx={{ fontSize: 13, color: '#94A3B8', mb: 2 }}>
                  {members.length} 名のメンバー
                </Typography>
                <Grid container spacing={2}>
                  {members.map((m) => {
                    const name = m.user.display_name || m.user.username
                    const color = getAvatarColor(name)
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={m.id}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            border: '1px solid rgba(15,23,42,0.07)',
                            borderRadius: 2.5,
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              borderColor: alpha(color, 0.3),
                              boxShadow: `0 4px 16px ${alpha(color, 0.1)}`,
                            },
                          }}
                        >
                          <Stack alignItems="center" spacing={1.5} sx={{ textAlign: 'center' }}>
                            {/* Avatar */}
                            <Box
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                bgcolor: alpha(color, 0.12),
                                border: `2px solid ${alpha(color, 0.25)}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                fontWeight: 800,
                                color,
                              }}
                            >
                              {name[0]?.toUpperCase()}
                            </Box>

                            <Box>
                              <Typography
                                sx={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}
                                noWrap
                              >
                                {name}
                              </Typography>
                              {m.user.display_name && (
                                <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
                                  @{m.user.username}
                                </Typography>
                              )}
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: m.role === 'owner' ? '#4F46E5' : '#94A3B8',
                                  mt: 0.25,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                {m.role === 'owner' ? 'オーナー' : 'メンバー'}
                              </Typography>
                            </Box>

                            {m.user.email && (
                              <Box
                                sx={{
                                  width: '100%',
                                  px: 1.5,
                                  py: 0.75,
                                  borderRadius: 1.5,
                                  bgcolor: 'rgba(15,23,42,0.03)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                }}
                              >
                                <EmailIcon sx={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 11, color: '#64748B' }} noWrap>
                                  {m.user.email}
                                </Typography>
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      </Grid>
                    )
                  })}
                </Grid>
              </>
            )}
          </>
        )}
      </Container>

      {selectedTeamId && (
        <MemberAddDialog
          teamId={selectedTeamId}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </Box>
  )
}
