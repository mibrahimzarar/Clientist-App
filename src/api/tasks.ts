import { supabase } from '../lib/supabase'
import { ClientTask, CreateTaskDTO, UpdateTaskDTO } from '../types/tasks'

export async function getTasks(filters?: { clientId?: string, status?: string }) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = supabase
      .from('client_tasks')
      .select(`
                *,
                client:clients(id, full_name)
            `)
      .eq('created_by', user.id)
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false })

    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error

    return { data: data as (ClientTask & { client: { full_name: string, id: string } })[], error: null }
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return { data: null, error }
  }
}

export async function createTask(task: CreateTaskDTO) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('client_tasks')
      .insert({
        ...task,
        created_by: user.id
      })
      .select()
      .single()

    if (error) throw error

    return { data: data as ClientTask, error: null }
  } catch (error) {
    console.error('Error creating task:', error)
    return { data: null, error }
  }
}

export async function updateTask(id: string, updates: UpdateTaskDTO) {
  try {
    const { data, error } = await supabase
      .from('client_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { data: data as ClientTask, error: null }
  } catch (error) {
    console.error('Error updating task:', error)
    return { data: null, error }
  }
}

export async function deleteTask(id: string) {
  try {
    const { error } = await supabase
      .from('client_tasks')
      .delete()
      .eq('id', id)

    if (error) throw error

    return { error: null }
  } catch (error) {
    console.error('Error deleting task:', error)
    return { error }
  }
}