import React from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import { useMe } from '../lib/queries'
import { useNavigate } from 'react-router-dom'
import { ProjectCreateDialog } from '../components/projects/ProjectCreateDialog'
import type { Project } from '../types'

export const ProjectsListPage: React.FC = () => {
  const api = useApiClient()
  const navigate = useNavigate()
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const { data, isLoading, isError } = useQuery<Project[]>({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const res = await api.get('/projects/')
      return res.data.results ?? res.data ?? []
    },
  })

  const { data: me } = useMe()
  const isAdmin = !!me?.is_admin

  const projects = Array.isArray(data) ? data : []

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
              プロジェクト
            </Typography>
            <Typography sx={{ color: 'var(--text-muted)', fontSize: 14, mt: 0.25 }}>
              すべてのプロジェクトを管理
            </Typography>
          </Box>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDialogOpen(true)}
              sx={{ flexShrink: 0 }}
            >
              プロジェクト作成
            </Button>
          )}
        </Stack>
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
              プロジェクトの読み込みに失敗しました。
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && (
          <>
            {projects.length === 0 ? (
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
                    bgcolor: 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderOpenIcon sx={{ color: 'var(--accent-secondary)', fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  プロジェクトがまだありません
                </Typography>
                <Typography sx={{ fontSize: 13, color: 'var(--text-faint)' }}>
                  ダッシュボードのプロジェクトセクションから作成できます
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {projects.map((p, i) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={p.id}
                    sx={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}
                  >
                    <Paper
                      elevation={0}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      sx={{
                        p: 0,
                        borderRadius: 3,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.25s ease',
                        '&:hover': {
                          borderColor: 'rgba(6, 182, 212, 0.2)',
                          boxShadow: '0 8px 32px rgba(6, 182, 212, 0.1)',
                          transform: 'translateY(-3px)',
                        },
                      }}
                    >
                      {/* Top accent bar */}
                      <Box
                        sx={{
                          height: 3,
                          background: 'var(--gradient-bar)',
                        }}
                      />
                      <Box sx={{ p: 2.5 }}>
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              bgcolor: 'rgba(139, 92, 246, 0.1)',
                              border: '1px solid rgba(139, 92, 246, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                            }}
                          >
                            <FolderOpenIcon sx={{ color: 'var(--accent-secondary)', fontSize: 18 }} />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: 'var(--text-heading)',
                                mb: 0.5,
                              }}
                            >
                              {p.name}
                            </Typography>
                            {p.description ? (
                              <Typography
                                sx={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}
                                noWrap
                              >
                                {p.description}
                              </Typography>
                            ) : (
                              <Typography
                                sx={{ fontSize: 12, color: 'var(--text-faint)', fontStyle: 'italic' }}
                              >
                                説明なし
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        <Box
                          sx={{
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid var(--border-faint)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <Button
                            size="small"
                            endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/projects/${p.id}`)
                            }}
                            sx={{
                              fontSize: 12,
                              color: 'var(--accent-primary)',
                              py: 0.25,
                              px: 1,
                              '&:hover': { bgcolor: 'rgba(6, 182, 212, 0.06)' },
                            }}
                          >
                            タスクボードを開く
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>

      <ProjectCreateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  )
}
