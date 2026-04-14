import React from 'react'
import { Box, Typography } from '@mui/material'
import { DisplayNameForm } from '../components/profile/DisplayNameForm'
import { PasswordForm } from '../components/profile/PasswordForm'

export const ProfilePage: React.FC = () => (
  <Box sx={{ maxWidth: 560, mx: 'auto', px: 3, py: 5 }}>
    <Typography variant="h5" fontWeight={700} mb={4}>
      アカウント設定
    </Typography>
    <DisplayNameForm />
    <PasswordForm />
  </Box>
)
