import { supabase } from '../lib/supabase'
import { ClientDocument, DocumentType } from '../types/documents'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'

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

// ============ LOCAL STORAGE FUNCTIONS FOR TRAVEL AGENT ============

const TRAVEL_AGENT_DOCS_KEY = 'travel_agent_documents'

export async function getLocalDocuments() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const storedData = await AsyncStorage.getItem(TRAVEL_AGENT_DOCS_KEY)
        if (!storedData) return { data: [], error: null }

        const allDocs = JSON.parse(storedData) as ClientDocument[]
        // Filter by current user
        const userDocs = allDocs.filter(doc => doc.created_by === user.id)

        return { data: userDocs, error: null }
    } catch (error) {
        console.error('Error fetching local documents:', error)
        return { data: null, error }
    }
}

export async function uploadLocalDocument(
    clientId: string,
    fileUri: string,
    fileName: string,
    fileType: string,
    docType: DocumentType,
    clientName: string
) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Check file size first
        const fileInfo = await FileSystem.getInfoAsync(fileUri)
        if (!fileInfo.exists) {
            throw new Error('File does not exist')
        }

        // Limit file size to 5MB for local storage to prevent app freezing
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (fileInfo.size && fileInfo.size > maxSize) {
            throw new Error('File size exceeds 5MB limit for local storage')
        }

        // Read file as base64 (this can take time for large files)
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'base64',
        })

        // Create document object
        const newDoc: ClientDocument & { client?: { full_name: string; id: string } } = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            client_id: clientId,
            name: fileName,
            type: docType,
            file_path: `data:${fileType};base64,${base64}`,
            file_type: fileType,
            size: fileInfo.size || base64.length,
            created_at: new Date().toISOString(),
            created_by: user.id,
            url: `data:${fileType};base64,${base64}`,
            client: {
                full_name: clientName,
                id: clientId,
            },
        }

        // Get existing documents
        const storedData = await AsyncStorage.getItem(TRAVEL_AGENT_DOCS_KEY)
        const existingDocs = storedData ? JSON.parse(storedData) : []

        // Add new document
        existingDocs.push(newDoc)

        // Save back to AsyncStorage (this can also take time for large data)
        await AsyncStorage.setItem(TRAVEL_AGENT_DOCS_KEY, JSON.stringify(existingDocs))

        return { data: newDoc, error: null }
    } catch (error: any) {
        console.error('Error uploading local document:', error)
        return { data: null, error: error?.message || error }
    }
}

export async function deleteLocalDocument(id: string) {
    try {
        // Get existing documents
        const storedData = await AsyncStorage.getItem(TRAVEL_AGENT_DOCS_KEY)
        if (!storedData) return { error: null }

        const existingDocs = JSON.parse(storedData) as ClientDocument[]

        // Filter out the document to delete
        const updatedDocs = existingDocs.filter(doc => doc.id !== id)

        // Save back to AsyncStorage
        await AsyncStorage.setItem(TRAVEL_AGENT_DOCS_KEY, JSON.stringify(updatedDocs))

        return { error: null }
    } catch (error) {
        console.error('Error deleting local document:', error)
        return { error }
    }
}
