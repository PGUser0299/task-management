import React from 'react'
import { Box, Chip, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { PRIORITY_CHIP_COLORS, PRIORITY_LABELS } from '../tasks/taskConstants'
import type { SuggestTodayResponse, TaskPriority } from '../../types'

type Props = {
  loading: boolean
  suggest: SuggestTodayResponse | undefined
  projectNameMap: Map<number, string>
  onItemClick: (projectId: number) => void
}

export const AiSuggestPanel: React.FC<Props> = ({
  loading,
  suggest,
  projectNameMap,
  onItemClick,
}) => {
  const items = suggest?.items ?? []

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 3, overflow: 'hidden' }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid var(--border-faint)',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06) 0%, rgba(139, 92, 246, 0.04) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
        }}
      >
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            background: 'var(--gradient-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6, 182, 212, 0.25)',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 15, color: 'white' }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
          本日の重要タスク
        </Typography>
      </Box>
      <Box sx={{ p: 2.5 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {suggest?.summary ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(6, 182, 212, 0.05)',
                  border: '1px solid rgba(6, 182, 212, 0.1)',
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {suggest.summary}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 13, color: 'var(--text-faint)', mb: 2 }}>
                チームを選択すると、フォーカスすべきタスクが提案されます。
              </Typography>
            )}
            <Stack spacing={1.5}>
              {items.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'var(--bg-inset)',
                    border: '1px solid var(--border-faint)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    animation: `fadeInUp 0.4s ease ${index * 0.05}s both`,
                    '&:hover': {
                      borderColor: 'rgba(6, 182, 212, 0.2)',
                      bgcolor: 'rgba(6, 182, 212, 0.04)',
                      boxShadow: '0 4px 16px rgba(6, 182, 212, 0.08)',
                    },
                  }}
                  onClick={() => onItemClick(item.project_id)}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    gap={1}
                  >
                    <Box flex={1} minWidth={0}>
                      {projectNameMap.has(item.project_id) && (
                        <Typography
                          sx={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600, mb: 0.25 }}
                          noWrap
                        >
                          {projectNameMap.get(item.project_id)}
                        </Typography>
                      )}
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: 'var(--text-heading)' }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: 'var(--text-muted)', mt: 0.5 }}>
                        {item.reason}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={0.75} flexShrink={0}>
                      <Chip
                        size="small"
                        label={
                          PRIORITY_LABELS[item.priority as TaskPriority] ?? item.priority
                        }
                        color={
                          PRIORITY_CHIP_COLORS[item.priority as TaskPriority] ?? 'default'
                        }
                        sx={{ height: 20, fontSize: 11 }}
                      />
                      {item.due_date && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={item.due_date}
                          sx={{
                            height: 20,
                            fontSize: 11,
                            borderColor: 'var(--border-input)',
                            color: 'var(--text-secondary)',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
              {items.length === 0 && suggest && (
                <Typography
                  sx={{ fontSize: 13, color: 'var(--text-faint)', textAlign: 'center', py: 2 }}
                >
                  提案するタスクはありません。
                </Typography>
              )}
            </Stack>
          </>
        )}
      </Box>
    </Paper>
  )
}
