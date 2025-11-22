import { supabase } from '../lib/supabase'
import { Client } from '../types'
import { load, save } from '../lib/storage'
import { nanoid } from 'nanoid/non-secure'

const KEY = 'clientist_clients'

export async function listClients(userId: string): Promise<Client[]> {
  try {
    const { data, error } = await supabase.from('clients').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Client[]
  } catch {
    return load<Client[]>(KEY, [])
  }
}

export async function createClient(userId: string, partial: Partial<Client>): Promise<Client> {
  const client: Client = {
    id: nanoid(),
    name: partial.name || '',
    phone: partial.phone,
    email: partial.email,
    tags: partial.tags || [],
    category: partial.category,
    priority: partial.priority || 0,
    status: partial.status || 'active',
    notes: partial.notes,
    attachments: partial.attachments || [],
    reminders: [],
    custom_fields: partial.custom_fields || {},
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
  try {
    const { error } = await supabase.from('clients').insert({ ...client, user_id: userId })
    if (error) throw error
  } catch {
    const all = await load<Client[]>(KEY, [])
    const next = [client, ...all]
    await save(KEY, next)
  }
  return client
}

export async function upsertCustomField(clientId: string, key: string, value: string): Promise<void> {
  try {
    const { data, error } = await supabase.from('clients').select('custom_fields').eq('id', clientId).single()
    if (error) throw error
    const cf = (data?.custom_fields || {}) as Record<string, string>
    cf[key] = value
    const { error: upErr } = await supabase.from('clients').update({ custom_fields: cf }).eq('id', clientId)
    if (upErr) throw upErr
  } catch {
    const all = await load<Client[]>(KEY, [])
    const next = all.map(c => (c.id === clientId ? { ...c, custom_fields: { ...(c.custom_fields || {}), [key]: value } } : c))
    await save(KEY, next)
  }
}
