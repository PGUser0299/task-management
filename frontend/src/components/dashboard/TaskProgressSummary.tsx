import React from 'react'
import { Box, Divider, Paper, Typography } from '@mui/material'
import type { Task } from '../../types'

const STATUS_COLORS: Record<string, string> = {
  pending: '#475569',
  todo: '#64748B',
  in_progress: '#06B6D4',
  done: '#34D399',
}

const STATUS_LEGEND = [
  { key: 'pending', label: 'Pending', color: '#475569' },
  { key: 'todo', label: 'To Do', color: '#64748B' },
  { key: 'in_progress', label: 'Doing', color: '#06B6D4' },
  { key: 'done', label: 'Done', color: '#34D399' },
] as const

type Props = {
  tasks: Task[]
}

export const TaskProgressSummary: React.FC<Props> = ({ tasks }) => {
  if (tasks.length === 0) return null

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 3, p: 2.5 }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', mb: 2 }}>
        タスク進捗
      </Typography>
      <Box
        sx={{
          display: 'flex',
          gap: '2px',
          borderRadius: 2,
          overflow: 'hidden',
          height: 8,
          bgcolor: 'var(--bg-inset)',
        }}
      >
        {Object.keys(STATUS_COLORS).map((s) => {
          const count = tasks.filter((t) => t.status === s).length
          const pct = tasks.length ? (count / tasks.length) * 100 : 0
          return pct > 0 ? (
            <Box
              key={s}
              sx={{
                flex: `0 0 ${pct}%`,
                bgcolor: STATUS_COLORS[s],
                transition: 'flex 0.6s ease',
                ...(s === 'in_progress' && {
                  boxShadow: '0 0 8px rgba(6, 182, 212, 0.4)',
                }),
                ...(s === 'done' && {
                  boxShadow: '0 0 8px rgba(52, 211, 153, 0.3)',
                }),
              }}
            />
          ) : null
        })}
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Box display="flex" flexWrap="wrap" gap={2.5}>
        {STATUS_LEGEND.map(({ key, label, color }) => {
          const count = tasks.filter((t) => t.status === key).length
          return (
            <Box key={key} display="flex" alignItems="center" gap={0.75}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: color,
                  ...(key === 'in_progress' && {
                    boxShadow: '0 0 6px rgba(6, 182, 212, 0.5)',
                  }),
                }}
              />
              <Typography sx={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {label}:{' '}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 700,
                    color: 'var(--text-heading)',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}
                >
                  {count}
                </Box>
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}
