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
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import PersonIcon from '@mui/icons-material/Person'
import AddIcon from '@mui/icons-material/Add'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import { useMe } from '../lib/queries'
import { MemberAddDialog } from '../components/members/MemberAddDialog'
import type { Team, TeamMember } from '../types'

type MemberUser = {
  id: number
  username: string
  display_name: string
  email?: string
  is_superuser?: boolean
}

type MemberEntry = TeamMember & { user: MemberUser }

const avatarGradients = [
  'linear-gradient(135deg, #06B6D4, #3B82F6)',
  'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #34D399, #06B6D4)',
  'linear-gradient(135deg, #FBBF24, #F97316)',
  'linear-gradient(135deg, #F87171, #EC4899)',
  'linear-gradient(135deg, #A78BFA, #6366F1)',
  'linear-gradient(135deg, #2DD4BF, #34D399)',
  'linear-gradient(135deg, #FB923C, #FBBF24)',
  'linear-gradient(135deg, #818CF8, #8B5CF6)',
  'linear-gradient(135deg, #22D3EE, #06B6D4)',
]

const getAvatarGradient = (name: string) =>
  avatarGradients[name.charCodeAt(0) % avatarGradients.length]

export const MembersPage: React.FC = () => {
  const api = useApiClient()
  const [selectedTeamId, setSelectedTeamId] = React.useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { data: me } = useMe()
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
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          py: 3,
          borderBottom: '1px solid var(--border-faint)',
          bgcolor: 'var(--bg-header)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={2}
          sx={{ animation: 'fadeInUp 0.4s ease both' }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
            >
              メンバー
            </Typography>
            <Typography sx={{ color: 'var(--text-muted)', fontSize: 14, mt: 0.25 }}>
              チームに所属しているメンバー一覧
            </Typography>
          </Box>
          {isAdmin && selectedTeamId && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              メンバー追加
            </Button>
          )}
        </Stack>

        {teamList.length > 0 && (
          <Tabs
            value={selectedTeamId ?? false}
            onChange={(_, v) => setSelectedTeamId(v as number)}
            sx={{ mt: 2 }}
          >
            {teamList.map((team) => (
              <Tab key={team.id} label={team.name} value={team.id} />
            ))}
          </Tabs>
        )}
        {!teamsLoading && teamList.length === 0 && (
          <Typography sx={{ color: 'var(--text-faint)', fontSize: 14, mt: 1.5 }}>
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
              borderRadius: 2.5,
              bgcolor: 'rgba(248, 113, 113, 0.05)',
              border: '1px solid rgba(248, 113, 113, 0.15)',
            }}
          >
            <Typography sx={{ color: 'var(--error)', fontSize: 14 }}>
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
                  animation: 'fadeInUp 0.4s ease both',
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: 'rgba(6, 182, 212, 0.08)',
                    border: '1px solid rgba(6, 182, 212, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PersonIcon sx={{ color: 'var(--accent-primary)', fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  メンバーがまだ登録されていません
                </Typography>
              </Box>
            ) : (
              <>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    mb: 2,
                    animation: 'fadeInUp 0.3s ease both',
                  }}
                >
                  {members.length} 名のメンバー
                </Typography>
                <Grid container spacing={2}>
                  {members.map((m, i) => {
                    const name = m.user.display_name || m.user.username
                    const gradient = getAvatarGradient(name)
                    return (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={m.id}
                        sx={{ animation: `fadeInUp 0.4s ease ${i * 0.04}s both` }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2.5,
                            borderRadius: 3,
                            transition: 'all 0.25s ease',
                            '&:hover': {
                              borderColor: 'rgba(6, 182, 212, 0.15)',
                              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                              transform: 'translateY(-2px)',
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
                                background: gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 20,
                                fontWeight: 800,
                                color: 'white',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                              }}
                            >
                              {name[0]?.toUpperCase()}
                            </Box>

                            <Box>
                              <Typography
                                sx={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}
                                noWrap
                              >
                                {name}
                              </Typography>
                              {m.user.display_name && (
                                <Typography sx={{ fontSize: 11, color: 'var(--text-muted)', mt: 0.25 }}>
                                  @{m.user.username}
                                </Typography>
                              )}
                              <Typography
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: m.role === 'owner' ? 'var(--accent-primary)' : 'var(--text-muted)',
                                  mt: 0.5,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
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
                                  borderRadius: 2,
                                  bgcolor: 'var(--bg-inset)',
                                  border: '1px solid var(--border-faint)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.75,
                                }}
                              >
                                <EmailIcon sx={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }} />
                                <Typography sx={{ fontSize: 11, color: 'var(--text-secondary)' }} noWrap>
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
