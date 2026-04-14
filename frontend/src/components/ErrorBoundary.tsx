import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

type Props = {
  children: React.ReactNode
}

type State = {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : '予期しないエラーが発生しました。'
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="60vh"
          gap={2}
          px={3}
        >
          <ErrorOutlineIcon sx={{ fontSize: 48, color: '#EF4444' }} />
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            エラーが発生しました
          </Typography>
          <Typography
            sx={{ fontSize: 14, color: '#64748B', maxWidth: 400, textAlign: 'center' }}
          >
            {this.state.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => {
              this.setState({ hasError: false, message: '' })
              window.location.reload()
            }}
            sx={{ background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
          >
            ページを再読み込み
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}
