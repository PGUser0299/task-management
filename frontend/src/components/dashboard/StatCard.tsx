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
      border: '1px solid rgba(15,23,42,0.07)',
      borderRadius: 2.5,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 2,
        bgcolor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
    </Box>
    <Box>
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.25 }}>{label}</Typography>
    </Box>
  </Paper>
)
