import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    Linking,
    Modal,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { getAllDocuments, deleteClientDocument, getLocalDocuments, deleteLocalDocument } from '../../../../src/api/documents'
import { supabase } from '../../../../src/lib/supabase'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { ClientDocument } from '../../../../src/types/documents'
import { UploadModal } from '../../../../src/components/documents/UploadModal'

interface DocumentWithClient extends ClientDocument {
    client?: {
        full_name: string
        id: string
    }
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentWithClient[]>([])
    const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithClient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const { clientId, type } = useLocalSearchParams<{ clientId: string, type: string }>()

    // Add Document State
    const [showClientModal, setShowClientModal] = useState(false)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([])
    const [selectedClientId, setSelectedClientId] = useState<string>('')

    useEffect(() => {
        fetchDocuments()
        fetchClients()
    }, [])

    useEffect(() => {
        filterDocuments()
    }, [documents, searchQuery, clientId, type])

    const fetchDocuments = async () => {
        try {
            // Use local storage instead of database for travel agent
            const { data, error } = await getLocalDocuments()
            if (error) throw error
            setDocuments(data || [])
        } catch (error) {
            console.error('Error fetching documents:', error)
            Alert.alert('Error', 'Failed to load documents')
        } finally {
            setLoading(false)
        }
    }

    const fetchClients = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('clients')
                .select('id, full_name')
                .eq('created_by', user.id)
                .order('full_name')

            if (error) throw error
            setClients(data || [])
        } catch (error) {
            console.error('Error fetching clients:', error)
        }
    }

    const filterDocuments = () => {
        let filtered = documents

        // Filter by Client ID if present in params
        if (clientId) {
            filtered = filtered.filter(doc => doc.client?.id === clientId)
        }

        // Filter by Type if present in params
        if (type) {
            filtered = filtered.filter(doc => doc.file_type === type || doc.type === type)
        }

        if (searchQuery) {
            filtered = filtered.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.type.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        setFilteredDocuments(filtered)
    }

    const handleDeleteDocument = async (doc: DocumentWithClient) => {
        Alert.alert(
            'Delete Document',
            `Are you sure you want to delete "${doc.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Use local storage delete
                            await deleteLocalDocument(doc.id)
                            await fetchDocuments()
                        } catch (error) {
                            console.error('Error deleting document:', error)
                            Alert.alert('Error', 'Failed to delete document')
                        }
                    }
                }
            ]
        )
    }

    const handleOpenDocument = (url?: string) => {
        if (url) {
            Linking.openURL(url)
        } else {
            Alert.alert('Error', 'Could not open document')
        }
    }

    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId)
        setShowClientModal(false)
        setShowUploadModal(true)
    }

    const handleUploadComplete = () => {
        setShowUploadModal(false)
        setSelectedClientId('')
        fetchDocuments()
    }

    const getIcon = (doc: ClientDocument) => {
        if (doc.file_type.startsWith('image/')) return 'image'
        if (doc.file_type.includes('pdf')) return 'document-text'
        return 'document'
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#8B5CF6" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>
                            {type === 'payment_receipt' ? 'Payment Receipts' : 'Documents'}
                        </Text>
                        <Text style={styles.headerSubtitle}>
                            {clientId && filteredDocuments.length > 0 && filteredDocuments[0].client
                                ? `${filteredDocuments[0].client.full_name} • `
                                : ''}
                            {filteredDocuments.length} files
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowClientModal(true)}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#6B7280" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search documents..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </LinearGradient>

            {/* Documents List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredDocuments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No documents found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try adjusting your search' : 'Upload documents to get started'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => setShowClientModal(true)}
                            >
                                <LinearGradient
                                    colors={['#8B5CF6', '#7C3AED']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.emptyButtonGradient}
                                >
                                    <Ionicons name="cloud-upload" size={20} color="#fff" />
                                    <Text style={styles.emptyButtonText}>Upload Document</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <>
                        {filteredDocuments.map((doc) => (
                            <TouchableOpacity
                                key={doc.id}
                                style={styles.docCard}
                                onPress={() => handleOpenDocument(doc.url)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.docIconContainer}>
                                    {doc.file_type.startsWith('image/') && doc.url ? (
                                        <Image source={{ uri: doc.url }} style={styles.docPreview} />
                                    ) : (
                                        <Ionicons name={getIcon(doc)} size={24} color="#8B5CF6" />
                                    )}
                                </View>

                                <View style={styles.docContent}>
                                    <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                                    <Text style={styles.docClient}>{doc.client?.full_name || 'Unknown Client'}</Text>
                                    <View style={styles.docMeta}>
                                        <View style={styles.docTypeBadge}>
                                            <Text style={styles.docTypeText}>{doc.type.replace('_', ' ')}</Text>
                                        </View>
                                        <Text style={styles.docDate}>
                                            {new Date(doc.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteDocument(doc)}
                                >
                                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}

                        {/* Storage Info Note */}
                        <View style={styles.storageNote}>
                            <Ionicons name="information-circle" size={20} color="#6B7280" />
                            <Text style={styles.storageNoteText}>
                                Documents are stored locally on your device to minimize storage usage. They will be available only on this device.
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>

            {/* Client Selection Modal */}
            <Modal
                visible={showClientModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowClientModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Client</Text>
                            <TouchableOpacity onPress={() => setShowClientModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.clientList}>
                            {clients.map((client) => (
                                <TouchableOpacity
                                    key={client.id}
                                    style={styles.clientItem}
                                    onPress={() => handleClientSelect(client.id)}
                                >
                                    <View style={styles.clientAvatar}>
                                        <Text style={styles.clientInitials}>
                                            {client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </Text>
                                    </View>
                                    <Text style={styles.clientName}>{client.full_name}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Upload Modal */}
            <UploadModal
                visible={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                clientId={selectedClientId}
                onUploadComplete={handleUploadComplete}
                useLocalStorage={true}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
    },
    searchContainer: {
        marginBottom: 8,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    docCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    docIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    docPreview: {
        width: '100%',
        height: '100%',
    },
    docContent: {
        flex: 1,
        marginRight: 12,
    },
    docName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    docClient: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 6,
    },
    docMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    docTypeBadge: {
        backgroundColor: '#F3F4F6',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    docTypeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    docDate: {
        fontSize: 10,
        color: '#9CA3AF',
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#111827',
        marginTop: 24,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    emptyButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    clientList: {
        maxHeight: 400,
    },
    clientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginBottom: 8,
    },
    clientAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    clientInitials: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    clientName: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    storageNote: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        marginBottom: 8,
        gap: 12,
    },
    storageNoteText: {
        flex: 1,
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
})
