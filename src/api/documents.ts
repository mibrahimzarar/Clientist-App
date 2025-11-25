import { supabase } from '../lib/supabase'
import { ClientDocument, DocumentType } from '../types/documents'

export async function getClientDocuments(clientId: string) {
    try {
        const { data, error } = await supabase
            .from('client_documents')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Generate signed URLs for all documents
        const documentsWithUrls = await Promise.all(
            (data as ClientDocument[]).map(async (doc) => {
                const { data: signedUrlData } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(doc.file_path, 3600) // 1 hour expiry

                return {
                    ...doc,
                    url: signedUrlData?.signedUrl,
                }
            })
        )

        return { data: documentsWithUrls, error: null }
    } catch (error) {
        console.error('Error fetching documents:', error)
        return { data: null, error }
    }
}

export async function getAllDocuments() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('client_documents')
            .select(`
        *,
        client:clients(id, full_name)
      `)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        // Generate signed URLs for all documents
        const documentsWithUrls = await Promise.all(
            (data as (ClientDocument & { client: { full_name: string, id: string } })[]).map(async (doc) => {
                const { data: signedUrlData } = await supabase.storage
                    .from('documents')
                    .createSignedUrl(doc.file_path, 3600) // 1 hour expiry

                return {
                    ...doc,
                    url: signedUrlData?.signedUrl,
                }
            })
        )

        return { data: documentsWithUrls, error: null }
    } catch (error) {
        console.error('Error fetching all documents:', error)
        return { data: null, error }
    }
}

export async function uploadClientDocument(
    clientId: string,
    fileUri: string,
    fileName: string,
    fileType: string,
    docType: DocumentType
) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // 1. Read file as ArrayBuffer using fetch
        const response = await fetch(fileUri)
        const arrayBuffer = await response.arrayBuffer()

        // 2. Upload to Supabase Storage
        const filePath = `${clientId}/${Date.now()}_${fileName}`
        const contentType = fileType || 'application/octet-stream'

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, arrayBuffer, {
                contentType,
                upsert: false,
            })

        if (uploadError) throw uploadError

        // 3. Create record in database
        const { data, error: dbError } = await supabase
            .from('client_documents')
            .insert({
                client_id: clientId,
                name: fileName,
                type: docType,
                file_path: filePath,
                file_type: contentType,
                size: 0, // We could get size from file info if needed
                created_by: user.id,
            })
            .select()
            .single()

        if (dbError) {
            // Cleanup storage if db insert fails
            await supabase.storage.from('documents').remove([filePath])
            throw dbError
        }

        return { data: data as ClientDocument, error: null }
    } catch (error) {
        console.error('Error uploading document:', error)
        return { data: null, error }
    }
}

export async function deleteClientDocument(id: string, filePath: string) {
    try {
        // 1. Delete from Storage
        const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([filePath])

        if (storageError) throw storageError

        // 2. Delete from Database
        const { error: dbError } = await supabase
            .from('client_documents')
            .delete()
            .eq('id', id)

        if (dbError) throw dbError

        return { error: null }
    } catch (error) {
        console.error('Error deleting document:', error)
        return { error }
    }
}
