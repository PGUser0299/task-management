import React from 'react'
import { Box, Paper, Typography } from '@mui/material'

type Props = {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  bgColor: string
}

export const StatCard: React.FC<Props> = ({ label, value, icon, color, bgColor }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'all 0.25s ease',
      '&:hover': {
        borderColor: `${color}33`,
        boxShadow: `0 4px 20px ${color}15`,
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box
      sx={{
        width: 46,
        height: 46,
        borderRadius: 2.5,
        bgcolor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        border: `1px solid ${color}20`,
      }}
    >
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          fontFamily: '"JetBrains Mono", "Sora", monospace',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  </Paper>
)
