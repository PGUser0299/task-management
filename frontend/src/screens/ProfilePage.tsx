import React from 'react'
import { Box, Typography } from '@mui/material'
import { DisplayNameForm } from '../components/profile/DisplayNameForm'
import { PasswordForm } from '../components/profile/PasswordForm'

export const ProfilePage: React.FC = () => (
  <Box
    sx={{
      maxWidth: 560,
      mx: 'auto',
      px: 3,
      py: 5,
      animation: 'fadeInUp 0.4s ease both',
    }}
  >
    <Typography
      variant="h5"
      sx={{ fontWeight: 700, mb: 4, color: 'var(--text-primary)' }}
    >
      アカウント設定
    </Typography>
    <DisplayNameForm />
    <PasswordForm />
  </Box>
)
