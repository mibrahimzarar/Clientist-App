import { supabase } from '../lib/supabase'
import { Task, TaskStatus } from '../types'
import { load, save } from '../lib/storage'
import { nanoid } from 'nanoid/non-secure'

const KEY = 'clientist_tasks'

export async function listTasks(clientId: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase.from('tasks').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Task[]
  } catch {
    const all = await load<Task[]>(KEY, [])
    return all.filter(t => t.client_id === clientId)
  }
}

export async function createTask(clientId: string, partial: Partial<Task>): Promise<Task> {
  const task: Task = {
    id: nanoid(),
    client_id: clientId,
    title: partial.title || '',
    due_date: partial.due_date,
    status: partial.status || 'todo',
    checklist: partial.checklist || [],
    reminder_at: partial.reminder_at,
    repeat: partial.repeat || 'none',
    created_at: new Date().toISOString()
  }
  try {
    const { error } = await supabase.from('tasks').insert(task)
    if (error) throw error
  } catch {
    const all = await load<Task[]>(KEY, [])
    const next = [task, ...all]
    await save(KEY, next)
  }
  return task
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
  try {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
    if (error) throw error
  } catch {
    const all = await load<Task[]>(KEY, [])
    const next = all.map(t => (t.id === taskId ? { ...t, status } : t))
    await save(KEY, next)
  }
}

export function nextDueDate(current?: string, repeat?: Task['repeat']): string | undefined {
  if (!current || !repeat || repeat === 'none') return undefined
  const d = new Date(current)
  if (repeat === 'daily') d.setDate(d.getDate() + 1)
  if (repeat === 'weekly') d.setDate(d.getDate() + 7)
  if (repeat === 'monthly') d.setMonth(d.getMonth() + 1)
  return d.toISOString()
}