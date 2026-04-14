export type Team = {
  id: number
  name: string
}

export type Project = {
  id: number
  name: string
  description: string
  team: number
}

export type UserMini = {
  id: number
  username: string
  display_name: string
}

export type Me = UserMini & {
  email: string
  is_admin: boolean
}

export type TeamMember = {
  id: number
  user: UserMini
  role: string
}

export type TaskStatus = 'pending' | 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type Task = {
  id: number
  project: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  estimate_minutes: number | null
  due_date: string | null
  assignee: UserMini | null
  parent: number | null
  created_at: string
  updated_at: string
}

export type SuggestedItem = {
  id: number
  project_id: number
  title: string
  status: string
  priority: string
  due_date: string | null
  reason: string
}

export type SuggestTodayResponse = {
  summary: string
  items: SuggestedItem[]
}
