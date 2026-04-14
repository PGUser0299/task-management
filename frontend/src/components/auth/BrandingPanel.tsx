import React from 'react'
import { Box, Stack, Typography, alpha } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const FEATURES = [
  'AI によるタスク自動分解・優先度提案',
  'チームでの進捗をリアルタイム共有',
  'カンバンボードで直感的に管理',
]

type Props = {
  headline: React.ReactNode
  subtext: string
}

export const BrandingPanel: React.FC<Props> = ({ headline, subtext }) => (
  <Box
    sx={{
      display: { xs: 'none', md: 'flex' },
      flex: '0 0 45%',
      flexDirection: 'column',
      justifyContent: 'center',
      px: 8,
      background: 'linear-gradient(145deg, #0F172A 0%, #1E1B4B 60%, #312E81 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Background decorations */}
    <Box
      sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: alpha('#4F46E5', 0.15),
        filter: 'blur(80px)',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: -80,
        left: -80,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: alpha('#0EA5E9', 0.1),
        filter: 'blur(60px)',
      }}
    />

    <Box sx={{ position: 'relative', zIndex: 1 }}>
      {/* Logo */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 6 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #818CF8, #4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px rgba(79,70,229,0.5)',
          }}
        >
          <AutoAwesomeIcon sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Typography sx={{ color: 'white', fontWeight: 700, fontSize: 18 }}>
          TaskBoard AI
        </Typography>
      </Stack>

      <Typography
        variant="h3"
        sx={{
          color: 'white',
          fontWeight: 800,
          lineHeight: 1.2,
          letterSpacing: '-0.03em',
          mb: 2,
        }}
      >
        {headline}
      </Typography>
      <Typography
        sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, mb: 5, lineHeight: 1.7 }}
      >
        {subtext}
      </Typography>

      <Stack spacing={1.5}>
        {FEATURES.map((f) => (
          <Stack key={f} direction="row" alignItems="center" spacing={1.5}>
            <CheckCircleOutlineIcon
              sx={{ color: '#818CF8', fontSize: 18, flexShrink: 0 }}
            />
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
              {f}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  </Box>
)
