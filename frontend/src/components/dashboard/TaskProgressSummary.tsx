import React from 'react'
import { Box, Divider, Paper, Typography } from '@mui/material'
import type { Task } from '../../types'

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

type Props = {
  tasks: Task[]
}

export const TaskProgressSummary: React.FC<Props> = ({ tasks }) => {
  if (tasks.length === 0) return null

  return (
    <Paper
      elevation={0}
      sx={{ border: '1px solid rgba(15,23,42,0.07)', borderRadius: 2.5, p: 2.5 }}
    >
      <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 2 }}>タスク進捗</Typography>
      <Box sx={{ display: 'flex', gap: 0, borderRadius: 1.5, overflow: 'hidden', height: 8 }}>
        {Object.keys(STATUS_COLORS).map((s) => {
          const count = tasks.filter((t) => t.status === s).length
          const pct = tasks.length ? (count / tasks.length) * 100 : 0
          return pct > 0 ? (
            <Box key={s} sx={{ flex: `0 0 ${pct}%`, bgcolor: STATUS_COLORS[s] }} />
          ) : null
        })}
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <Box display="flex" flexWrap="wrap" gap={2}>
        {STATUS_LEGEND.map(({ key, label, color }) => {
          const count = tasks.filter((t) => t.status === key).length
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
  )
}
