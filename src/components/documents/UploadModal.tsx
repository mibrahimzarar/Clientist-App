import React, { useState } from 'react'
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import { DocumentType } from '../../types/documents'
import { useUploadDocument } from '../../hooks/useDocuments'
import { BouncingBallsLoader } from '../ui/BouncingBallsLoader'
import { uploadLocalDocument } from '../../api/documents'
import { supabase } from '../../lib/supabase'

interface UploadModalProps {
    visible: boolean
    onClose: () => void
    clientId: string
    onUploadComplete?: () => void
    useLocalStorage?: boolean
}

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: any }[] = [
    { type: 'passport', label: 'Passport Scan', icon: 'card-outline' },
    { type: 'visa', label: 'Visa Scan', icon: 'globe-outline' },
    { type: 'payment_receipt', label: 'Payment Receipt', icon: 'receipt-outline' },
    { type: 'ticket', label: 'Ticket PDF', icon: 'airplane-outline' },
    { type: 'hotel_confirmation', label: 'Hotel Confirmation', icon: 'bed-outline' },
    { type: 'cnic', label: 'CNIC Scan', icon: 'id-card-outline' },
    { type: 'other', label: 'Other Document', icon: 'document-outline' },
]

export const UploadModal: React.FC<UploadModalProps> = ({ 
    visible, 
    onClose, 
    clientId, 
    onUploadComplete,
    useLocalStorage = false 
}) => {
    const [selectedType, setSelectedType] = useState<DocumentType | null>(null)
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([])
    const uploadMutation = useUploadDocument()

    // Fetch client name for local storage
    React.useEffect(() => {
        if (useLocalStorage && clientId) {
            fetchClientName()
        }
    }, [clientId, useLocalStorage])

    const fetchClientName = async () => {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('id, full_name')
                .eq('id', clientId)
                .single()

            if (error) throw error
            setClients(data ? [data] : [])
        } catch (error) {
            console.error('Error fetching client:', error)
        }
    }

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/*', 'application/pdf'],
                copyToCacheDirectory: true,
            })

            if (result.canceled) return

            setSelectedFile(result.assets[0])
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document')
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !selectedType) return

        try {
            setIsUploading(true)

            if (useLocalStorage) {
                // Use local storage
                const clientName = clients.find(c => c.id === clientId)?.full_name || 'Unknown Client'
                const result = await uploadLocalDocument(
                    clientId,
                    selectedFile.uri,
                    selectedFile.name,
                    selectedFile.mimeType || 'application/octet-stream',
                    selectedType,
                    clientName
                )
                
                if (result.error) {
                    throw new Error(typeof result.error === 'string' ? result.error : 'Failed to upload document')
                }
            } else {
                // Use database storage
                await uploadMutation.mutateAsync({
                    clientId,
                    fileUri: selectedFile.uri,
                    fileName: selectedFile.name,
                    fileType: selectedFile.mimeType || 'application/octet-stream',
                    docType: selectedType,
                })
            }

            // Reset and close
            setSelectedFile(null)
            setSelectedType(null)
            Alert.alert('Success', 'Document uploaded successfully')
            
            if (onUploadComplete) {
                onUploadComplete()
            }
            onClose()
        } catch (error: any) {
            console.error('Upload error:', error)
            const errorMessage = error?.message || 'Failed to upload document'
            Alert.alert('Upload Error', errorMessage)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Upload Document</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Step 1: Select Type */}
                        <Text style={styles.sectionTitle}>1. Select Document Type</Text>
                        <View style={styles.typeGrid}>
                            {DOCUMENT_TYPES.map((item) => (
                                <TouchableOpacity
                                    key={item.type}
                                    style={[
                                        styles.typeCard,
                                        selectedType === item.type && styles.typeCardSelected,
                                    ]}
                                    onPress={() => setSelectedType(item.type)}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={24}
                                        color={selectedType === item.type ? '#4F46E5' : '#6B7280'}
                                    />
                                    <Text
                                        style={[
                                            styles.typeLabel,
                                            selectedType === item.type && styles.typeLabelSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Step 2: Select File */}
                        <Text style={styles.sectionTitle}>2. Select File</Text>
                        <TouchableOpacity
                            style={[styles.uploadBox, selectedFile && styles.uploadBoxSelected]}
                            onPress={handlePickDocument}
                        >
                            {selectedFile ? (
                                <>
                                    <Ionicons name="document-text" size={32} color="#4F46E5" />
                                    <Text style={styles.fileName} numberOfLines={1}>
                                        {selectedFile.name}
                                    </Text>
                                    <Text style={styles.fileSize}>
                                        {(selectedFile.size ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} MB
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload-outline" size={32} color="#9CA3AF" />
                                    <Text style={styles.uploadText}>Tap to select file</Text>
                                    <Text style={styles.uploadSubtext}>
                                        {useLocalStorage ? 'PDF, JPG, PNG up to 5MB' : 'PDF, JPG, PNG up to 10MB'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[
                                styles.uploadButton,
                                (!selectedType || !selectedFile || isUploading) &&
                                styles.uploadButtonDisabled,
                            ]}
                            onPress={handleUpload}
                            disabled={!selectedType || !selectedFile || isUploading}
                        >
                            {isUploading ? (
                                <BouncingBallsLoader color="#fff" size={8} />
                            ) : (
                                <Text style={styles.uploadButtonText}>Upload Document</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
        marginTop: 8,
    },
    typeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    typeCard: {
        width: '48%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        gap: 8,
    },
    typeCardSelected: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    typeLabel: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        textAlign: 'center',
    },
    typeLabelSelected: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        gap: 8,
        marginBottom: 24,
    },
    uploadBoxSelected: {
        borderColor: '#4F46E5',
        backgroundColor: '#EEF2FF',
        borderStyle: 'solid',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    uploadSubtext: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    fileName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    fileSize: {
        fontSize: 12,
        color: '#6B7280',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingBottom: 40,
    },
    uploadButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
    },
    uploadButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})
