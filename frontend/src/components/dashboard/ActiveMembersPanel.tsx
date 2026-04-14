import React from 'react'
import { Box, Button, Chip, Paper, Stack, Typography, alpha } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { TeamMember } from '../../types'

type Props = {
  members: TeamMember[]
  onViewAll: () => void
}

export const ActiveMembersPanel: React.FC<Props> = ({ members, onViewAll }) => (
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
      <Typography sx={{ fontWeight: 700, fontSize: 15 }}>メンバー</Typography>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        onClick={onViewAll}
        sx={{ fontSize: 12, py: 0.25, px: 1 }}
      >
        すべて見る
      </Button>
    </Box>
    <Box sx={{ p: 2 }}>
      <Stack spacing={0.75}>
        {members.slice(0, 6).map((m) => (
          <Box
            key={m.id}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                bgcolor: alpha('#4F46E5', 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#4F46E5',
                flexShrink: 0,
              }}
            >
              {(m.user.display_name || m.user.username)[0]?.toUpperCase()}
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontSize: 13, fontWeight: 500 }} noWrap>
                {m.user.display_name || m.user.username}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={m.role === 'owner' ? 'オーナー' : 'メンバー'}
              variant="outlined"
              sx={{ height: 20, fontSize: 10 }}
            />
          </Box>
        ))}
        {members.length === 0 && (
          <Typography sx={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', py: 2 }}>
            対応中のメンバーはいません。
          </Typography>
        )}
      </Stack>
    </Box>
  </Paper>
)
