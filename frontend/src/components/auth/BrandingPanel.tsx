import React from 'react'
import { Box, Stack, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const FEATURES = [
  'AI によるタスク自動分解・優先度提案',
  'チームでの進捗をリアルタイム共有',
  'カンバンボードで直感的に管理',
]

type Props = { headline: React.ReactNode; subtext: string }

export const BrandingPanel: React.FC<Props> = ({ headline, subtext }) => (
  <Box sx={{
    display: { xs: 'none', md: 'flex' },
    flex: '0 0 45%', flexDirection: 'column', justifyContent: 'center', px: 8,
    background: '#0B0F1A', position: 'relative', overflow: 'hidden',
  }}>
    <Box sx={{ position: 'absolute', top: '-20%', right: '-15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulseGlow 6s ease-in-out infinite' }} />
    <Box sx={{ position: 'absolute', bottom: '-25%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(60px)', animation: 'pulseGlow 8s ease-in-out infinite 2s' }} />
    <Box sx={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'linear-gradient(rgba(148,163,184,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 6, animation: 'fadeInUp 0.6s ease both' }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 2.5, background: 'var(--gradient-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(6,182,212,0.35)' }}>
          <AutoAwesomeIcon sx={{ color: 'white', fontSize: 22 }} />
        </Box>
        <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>TaskBoard AI</Typography>
      </Stack>

      <Typography variant="h3" sx={{ color: '#F1F5F9', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.03em', mb: 2, animation: 'fadeInUp 0.6s ease 0.1s both' }}>
        {headline}
      </Typography>
      <Typography sx={{ color: '#64748B', fontSize: 15, mb: 5, lineHeight: 1.7, animation: 'fadeInUp 0.6s ease 0.2s both' }}>
        {subtext}
      </Typography>

      <Stack spacing={1.5}>
        {FEATURES.map((f, i) => (
          <Stack key={f} direction="row" alignItems="center" spacing={1.5} sx={{ animation: `fadeInUp 0.5s ease ${0.3 + i * 0.08}s both` }}>
            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircleOutlineIcon sx={{ color: '#06B6D4', fontSize: 14 }} />
            </Box>
            <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>{f}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  </Box>
)
