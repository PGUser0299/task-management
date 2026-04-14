import React from 'react'
import { Box, Button, Paper, Stack, Typography, alpha } from '@mui/material'
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
      <Stack direction="row" spacing={0.5}>
        {isAdmin && (
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 14 }} />}
            onClick={onCreate}
            sx={{ fontSize: 12, py: 0.25, px: 1, color: '#4F46E5' }}
          >
            作成
          </Button>
        )}
        <Button
          size="small"
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          onClick={onViewAll}
          sx={{ fontSize: 12, py: 0.25, px: 1 }}
        >
          すべて見る
        </Button>
      </Stack>
    </Box>
    <Box sx={{ p: 2 }}>
      <Stack spacing={1}>
        {projects.slice(0, 5).map((project) => (
          <Box
            key={project.id}
            onClick={() => onSelect(project.id)}
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: 1.5,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: alpha('#4F46E5', 0.05) },
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
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}
                  noWrap
                >
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
        {projects.length === 0 && (
          <Typography sx={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', py: 2 }}>
            対応中のプロジェクトはありません。
          </Typography>
        )}
      </Stack>
    </Box>
  </Paper>
)
