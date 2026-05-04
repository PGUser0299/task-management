import type { TaskPriority } from '../../types'

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#64748B' },
  { value: 'todo', label: 'To Do', color: '#94A3B8' },
  { value: 'in_progress', label: 'In Progress', color: '#06B6D4' },
  { value: 'done', label: 'Done', color: '#34D399' },
] as const

export const PRIORITY_OPTIONS: {
  value: TaskPriority
  label: string
  longLabel: string
}[] = [
  { value: 'low', label: '低', longLabel: '低 (Low)' },
  { value: 'medium', label: '中', longLabel: '中 (Medium)' },
  { value: 'high', label: '高', longLabel: '高 (High)' },
  { value: 'urgent', label: '緊急', longLabel: '緊急 (Urgent)' },
]

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
}

export const PRIORITY_CHIP_COLORS: Record<
  TaskPriority,
  'default' | 'success' | 'warning' | 'error'
> = {
  low: 'default',
  medium: 'success',
  high: 'warning',
  urgent: 'error',
}

export const PRIORITY_DOT_COLORS: Record<TaskPriority, string> = {
  low: '#64748B',
  medium: '#34D399',
  high: '#FBBF24',
  urgent: '#F87171',
}
