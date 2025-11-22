export type ClientStatus = 'active' | 'pending' | 'completed' | 'archived'

export type Client = {
  id: string
  name: string
  phone?: string
  email?: string
  tags: string[]
  category?: string
  priority?: number
  status: ClientStatus
  notes?: string
  attachments?: string[]
  reminders?: string[]
  custom_fields?: Record<string, string>
  last_activity_at?: string
  created_at?: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Task = {
  id: string
  client_id: string
  title: string
  due_date?: string
  status: TaskStatus
  checklist?: { id: string; text: string; done: boolean }[]
  reminder_at?: string
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly'
  created_at?: string
}

export type Note = {
  id: string
  client_id: string
  content: string
  created_at?: string
}

export type Reminder = {
  id: string
  client_id: string
  title: string
  at: string
  created_at?: string
}