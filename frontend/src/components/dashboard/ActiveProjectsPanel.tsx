import React from 'react'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { Project } from '../../types'

type Props = {
  projects: Project[]
  isAdmin: boolean
  onCreate: () => void
  onViewAll: () => void
  onSelect: (projectId: number) => void
}

export const ActiveProjectsPanel: React.FC<Props> = ({
  projects,
  isAdmin,
  onCreate,
  onViewAll,
  onSelect,
}) => (
  <Paper
    elevation={0}
    sx={{ borderRadius: 3, overflow: 'hidden' }}
  >
    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderBottom: '1px solid var(--border-faint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
        プロジェクト
      </Typography>
      <Stack direction="row" spacing={0.5}>
        {isAdmin && (
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 14 }} />}
            onClick={onCreate}
            sx={{ fontSize: 12, py: 0.25, px: 1, color: 'var(--accent-primary)' }}
          >
            作成
          </Button>
        )}
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          onClick={onViewAll}
          sx={{ fontSize: 12, py: 0.25, px: 1, color: 'var(--text-secondary)' }}
        >
          すべて見る
        </Button>
      </Stack>
    </Box>
    <Box sx={{ p: 2 }}>
      <Stack spacing={0.5}>
        {projects.slice(0, 5).map((project) => (
          <Box
            key={project.id}
            onClick={() => onSelect(project.id)}
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(6, 182, 212, 0.05)',
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'var(--accent-primary)',
                  flexShrink: 0,
                  boxShadow: '0 0 6px rgba(6, 182, 212, 0.4)',
                }}
              />
              <Box flex={1} minWidth={0}>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}
                  noWrap
                >
                  {project.name}
                </Typography>
                {project.description && (
                  <Typography sx={{ fontSize: 11, color: 'var(--text-muted)' }} noWrap>
                    {project.description}
                  </Typography>
                )}
              </Box>
              <ArrowForwardIcon sx={{ fontSize: 14, color: 'var(--text-faint)' }} />
            </Box>
          </Box>
        ))}
        {projects.length === 0 && (
          <Typography sx={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', py: 2 }}>
            対応中のプロジェクトはありません。
          </Typography>
        )}
      </Stack>
    </Box>
  </Paper>
)
