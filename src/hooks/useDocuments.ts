import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getClientDocuments, uploadClientDocument, deleteClientDocument } from '../api/documents'
import { DocumentType } from '../types/documents'

export function useClientDocuments(clientId: string) {
    return useQuery({
        queryKey: ['documents', clientId],
        queryFn: () => getClientDocuments(clientId),
        enabled: !!clientId,
    })
}

export function useUploadDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            clientId,
            fileUri,
            fileName,
            fileType,
            docType,
        }: {
            clientId: string
            fileUri: string
            fileName: string
            fileType: string
            docType: DocumentType
        }) => uploadClientDocument(clientId, fileUri, fileName, fileType, docType),
        onSuccess: (_, { clientId }) => {
            queryClient.invalidateQueries({ queryKey: ['documents', clientId] })
        },
    })
}

export function useDeleteDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, filePath }: { id: string; filePath: string }) =>
            deleteClientDocument(id, filePath),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] })
        },
    })
}
