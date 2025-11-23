import { supabase } from '../lib/supabase'
import { ClientNote } from '../types/travelAgent'

export async function getClientNotes(clientId: string) {
  const { data, error } = await supabase
    .from('client_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data as ClientNote[]
}

export async function createClientNote(
  clientId: string,
  content: string,
  type: ClientNote['type'] = 'note',
  isPinned: boolean = false
) {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('client_notes')
    .insert({
      client_id: clientId,
      content,
      type,
      is_pinned: isPinned,
      created_by: user.id
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ClientNote
}

export async function deleteClientNote(noteId: string) {
  const { error } = await supabase
    .from('client_notes')
    .delete()
    .eq('id', noteId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function toggleNotePin(noteId: string, isPinned: boolean) {
  const { data, error } = await supabase
    .from('client_notes')
    .update({ is_pinned: isPinned })
    .eq('id', noteId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as ClientNote
}