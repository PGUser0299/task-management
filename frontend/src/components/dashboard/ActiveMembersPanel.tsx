import React from 'react'
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { TeamMember } from '../../types'

type Props = {
  members: TeamMember[]
  onViewAll: () => void
}

export const ActiveMembersPanel: React.FC<Props> = ({ members, onViewAll }) => (
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
        メンバー
      </Typography>
      <Button
        size="small"
        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
        onClick={onViewAll}
        sx={{ fontSize: 12, py: 0.25, px: 1, color: 'var(--text-secondary)' }}
      >
        すべて見る
      </Button>
    </Box>
    <Box sx={{ p: 2 }}>
      <Stack spacing={0.5}>
        {members.slice(0, 6).map((m) => (
          <Box
            key={m.id}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              transition: 'background 0.2s ease',
              '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.04)' },
            }}
          >
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'var(--avatar-bg)',
                border: '1px solid var(--avatar-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--accent-primary)',
                flexShrink: 0,
              }}
            >
              {(m.user.display_name || m.user.username)[0]?.toUpperCase()}
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'var(--text-heading)' }} noWrap>
                {m.user.display_name || m.user.username}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={m.role === 'owner' ? 'オーナー' : 'メンバー'}
              variant="outlined"
              sx={{
                height: 20,
                fontSize: 10,
                borderColor: m.role === 'owner' ? 'rgba(6, 182, 212, 0.25)' : 'var(--border-input)',
                color: m.role === 'owner' ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            />
          </Box>
        ))}
        {members.length === 0 && (
          <Typography sx={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', py: 2 }}>
            対応中のメンバーはいません。
          </Typography>
        )}
      </Stack>
    </Box>
  </Paper>
)
