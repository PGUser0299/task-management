import React from 'react'
import { Box, Chip, CircularProgress, Paper, Stack, Typography, alpha } from '@mui/material'
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
      sx={{
        border: '1px solid rgba(15,23,42,0.07)',
        borderRadius: 2.5,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 1.75,
          borderBottom: '1px solid rgba(15,23,42,0.07)',
          background:
            'linear-gradient(135deg, rgba(79,70,229,0.06) 0%, rgba(129,140,248,0.03) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            background: 'linear-gradient(135deg, #818CF8, #4F46E5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>本日の重要タスク</Typography>
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
                  bgcolor: alpha('#4F46E5', 0.05),
                  border: '1px solid',
                  borderColor: alpha('#4F46E5', 0.12),
                  mb: 2,
                }}
              >
                <Typography sx={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                  {suggest.summary}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ fontSize: 13, color: '#94A3B8', mb: 2 }}>
                チームを選択すると、フォーカスすべきタスクが提案されます。
              </Typography>
            )}
            <Stack spacing={1.5}>
              {items.map((item) => (
                <Paper
                  key={item.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid rgba(15,23,42,0.07)',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: alpha('#4F46E5', 0.3),
                      boxShadow: `0 4px 12px ${alpha('#4F46E5', 0.08)}`,
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
                          sx={{ fontSize: 11, color: '#818CF8', fontWeight: 600, mb: 0.25 }}
                          noWrap
                        >
                          {projectNameMap.get(item.project_id)}
                        </Typography>
                      )}
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#0F172A' }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
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
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      )}
                    </Box>
                  </Box>
                </Paper>
              ))}
              {items.length === 0 && suggest && (
                <Typography
                  sx={{ fontSize: 13, color: '#94A3B8', textAlign: 'center', py: 2 }}
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
