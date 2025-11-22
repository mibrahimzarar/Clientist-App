import { supabase } from '../lib/supabase'
import { Note } from '../types'
import { load, save } from '../lib/storage'
import { nanoid } from 'nanoid/non-secure'

const KEY = 'clientist_notes'

export async function listNotes(clientId: string): Promise<Note[]> {
  try {
    const { data, error } = await supabase.from('notes').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
    if (error) throw error
    return (data || []) as Note[]
  } catch {
    const all = await load<Note[]>(KEY, [])
    return all.filter(n => n.client_id === clientId)
  }
}

export async function createNote(clientId: string, content: string): Promise<Note> {
  const note: Note = { id: nanoid(), client_id: clientId, content, created_at: new Date().toISOString() }
  try {
    const { error } = await supabase.from('notes').insert(note)
    if (error) throw error
  } catch {
    const all = await load<Note[]>(KEY, [])
    const next = [note, ...all]
    await save(KEY, next)
  }
  return note
}