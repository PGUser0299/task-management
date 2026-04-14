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
  alpha,
} from '@mui/material'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AddIcon from '@mui/icons-material/Add'
import { useQuery } from '@tanstack/react-query'
import { useApiClient } from '../lib/apiClient'
import { useNavigate } from 'react-router-dom'
import { ProjectCreateDialog } from '../components/projects/ProjectCreateDialog'
import type { Project, Me } from '../types'

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

  const { data: me } = useQuery<Me>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me/')
      return res.data
    },
    staleTime: 1000 * 60 * 5,
  })
  const isAdmin = !!me?.is_admin

  const projects = Array.isArray(data) ? data : []

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
              プロジェクト
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 14, mt: 0.25 }}>
              すべてのプロジェクトを管理
            </Typography>
          </Box>
          {isAdmin && (
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
              borderRadius: 2,
              bgcolor: 'rgba(239,68,68,0.05)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}
          >
            <Typography color="error" sx={{ fontSize: 14 }}>
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
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    bgcolor: alpha('#4F46E5', 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderOpenIcon sx={{ color: '#4F46E5', fontSize: 28 }} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#475569' }}>
                  プロジェクトがまだありません
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#94A3B8' }}>
                  ダッシュボードのプロジェクトセクションから作成できます
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2.5}>
                {projects.map((p) => (
                  <Grid item xs={12} sm={6} md={4} key={p.id}>
                    <Paper
                      elevation={0}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      sx={{
                        p: 0,
                        border: '1px solid rgba(15,23,42,0.07)',
                        borderRadius: 2.5,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: alpha('#4F46E5', 0.3),
                          boxShadow: `0 8px 24px ${alpha('#4F46E5', 0.1)}`,
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {/* Top accent bar */}
                      <Box
                        sx={{
                          height: 4,
                          background: 'linear-gradient(90deg, #4F46E5, #818CF8)',
                        }}
                      />
                      <Box sx={{ p: 2.5 }}>
                        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1.5,
                              bgcolor: alpha('#4F46E5', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.25,
                            }}
                          >
                            <FolderOpenIcon sx={{ color: '#4F46E5', fontSize: 18 }} />
                          </Box>
                          <Box flex={1} minWidth={0}>
                            <Typography
                              sx={{
                                fontWeight: 700,
                                fontSize: 14,
                                color: '#0F172A',
                                mb: 0.5,
                              }}
                            >
                              {p.name}
                            </Typography>
                            {p.description ? (
                              <Typography
                                sx={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5 }}
                                noWrap
                              >
                                {p.description}
                              </Typography>
                            ) : (
                              <Typography sx={{ fontSize: 12, color: '#CBD5E1', fontStyle: 'italic' }}>
                                説明なし
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        <Box
                          sx={{
                            mt: 2,
                            pt: 2,
                            borderTop: '1px solid rgba(15,23,42,0.06)',
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
                              color: '#4F46E5',
                              py: 0.25,
                              px: 1,
                              '&:hover': { bgcolor: alpha('#4F46E5', 0.06) },
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
