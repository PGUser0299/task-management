import type { TaskPriority } from '../../types'

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: '#94A3B8' },
  { value: 'todo', label: 'To Do', color: '#64748B' },
  { value: 'in_progress', label: 'In Progress', color: '#4F46E5' },
  { value: 'done', label: 'Done', color: '#10B981' },
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
  low: '#94A3B8',
  medium: '#10B981',
  high: '#F59E0B',
  urgent: '#EF4444',
}
