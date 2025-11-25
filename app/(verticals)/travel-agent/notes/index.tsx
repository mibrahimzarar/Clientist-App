import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../../../src/lib/supabase'
import { ClientNote } from '../../../../src/types/travelAgent'
import { createClientNote, deleteClientNote, toggleNotePin } from '../../../../src/api/notes'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'

interface NoteWithClient extends ClientNote {
    client?: {
        full_name: string
        id: string
    }
}

export default function NotesPage() {
    const [notes, setNotes] = useState<NoteWithClient[]>([])
    const [filteredNotes, setFilteredNotes] = useState<NoteWithClient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | ClientNote['type']>('all')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newNoteContent, setNewNoteContent] = useState('')
    const [selectedClientId, setSelectedClientId] = useState<string>('')
    const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([])

    useEffect(() => {
        fetchNotes()
        fetchClients()
    }, [])

    useEffect(() => {
        filterNotes()
    }, [notes, searchQuery, filterType])

    const fetchNotes = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('client_notes')
                .select(`
                    *,
                    client:clients(id, full_name)
                `)
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error

            setNotes(data || [])
        } catch (error) {
            console.error('Error fetching notes:', error)
            Alert.alert('Error', 'Failed to load notes')
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

    const filterNotes = () => {
        let filtered = notes

        if (filterType !== 'all') {
            filtered = filtered.filter(note => note.type === filterType)
        }

        if (searchQuery) {
            filtered = filtered.filter(note =>
                note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredNotes(filtered)
    }

    const handleAddNote = async () => {
        if (!newNoteContent.trim() || !selectedClientId) {
            Alert.alert('Error', 'Please select a client and enter note content')
            return
        }

        try {
            const note = await createClientNote(selectedClientId, newNoteContent.trim())
            await fetchNotes()
            setShowAddModal(false)
            setNewNoteContent('')
            setSelectedClientId('')
        } catch (error) {
            console.error('Error adding note:', error)
            Alert.alert('Error', 'Failed to add note')
        }
    }

    const handleDeleteNote = async (noteId: string) => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteClientNote(noteId)
                            await fetchNotes()
                        } catch (error) {
                            console.error('Error deleting note:', error)
                            Alert.alert('Error', 'Failed to delete note')
                        }
                    }
                }
            ]
        )
    }

    const handleTogglePin = async (note: NoteWithClient) => {
        try {
            await toggleNotePin(note.id, !note.is_pinned)
            await fetchNotes()
        } catch (error) {
            console.error('Error toggling pin:', error)
            Alert.alert('Error', 'Failed to update note')
        }
    }

    const getIconForType = (type: ClientNote['type']) => {
        switch (type) {
            case 'status_change': return 'git-commit-outline'
            case 'creation': return 'star-outline'
            case 'follow_up': return 'call-outline'
            case 'system': return 'information-circle-outline'
            default: return 'document-text-outline'
        }
    }

    const getColorForType = (type: ClientNote['type']) => {
        switch (type) {
            case 'status_change': return ['#F59E0B', '#D97706'] as const
            case 'creation': return ['#10B981', '#059669'] as const
            case 'follow_up': return ['#8B5CF6', '#7C3AED'] as const
            case 'system': return ['#6B7280', '#4B5563'] as const
            default: return ['#4F46E5', '#7C3AED'] as const
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#4F46E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Notes & Timeline</Text>
                        <Text style={styles.headerSubtitle}>{filteredNotes.length} notes</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
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
                            placeholder="Search notes..."
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

                {/* Filter Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                    {['all', 'note', 'status_change', 'follow_up', 'system'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[styles.filterTab, filterType === type && styles.filterTabActive]}
                            onPress={() => setFilterType(type as any)}
                        >
                            <Text style={[styles.filterTabText, filterType === type && styles.filterTabTextActive]}>
                                {type === 'all' ? 'All' : type.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>

            {/* Notes List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredNotes.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No notes found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery || filterType !== 'all' ? 'Try adjusting your filters' : 'Start by adding your first note'}
                        </Text>
                    </View>
                ) : (
                    filteredNotes.map((note) => (
                        <TouchableOpacity
                            key={note.id}
                            style={styles.noteCard}
                            onPress={() => note.client && router.push(`/(verticals)/travel-agent/clients/${note.client.id}`)}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={getColorForType(note.type)}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.noteIconContainer}
                            >
                                <Ionicons name={getIconForType(note.type)} size={20} color="#fff" />
                            </LinearGradient>

                            <View style={styles.noteContent}>
                                <View style={styles.noteHeader}>
                                    <Text style={styles.noteClient}>{note.client?.full_name || 'Unknown Client'}</Text>
                                    <View style={styles.noteActions}>
                                        <TouchableOpacity onPress={() => handleTogglePin(note)}>
                                            <Ionicons
                                                name={note.is_pinned ? "pin" : "pin-outline"}
                                                size={16}
                                                color={note.is_pinned ? "#F59E0B" : "#9CA3AF"}
                                            />
                                        </TouchableOpacity>
                                        {note.type === 'note' && (
                                            <TouchableOpacity onPress={() => handleDeleteNote(note.id)} style={styles.deleteButton}>
                                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                                <Text style={styles.noteText} numberOfLines={3}>{note.content}</Text>
                                <View style={styles.noteFooter}>
                                    <View style={styles.noteTypeBadge}>
                                        <Text style={styles.noteTypeText}>{note.type.replace('_', ' ')}</Text>
                                    </View>
                                    <Text style={styles.noteDate}>
                                        {new Date(note.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Add Note Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add New Note</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Select Client</Text>
                        <ScrollView style={styles.clientList} nestedScrollEnabled>
                            {clients.map((client) => (
                                <TouchableOpacity
                                    key={client.id}
                                    style={[styles.clientItem, selectedClientId === client.id && styles.clientItemSelected]}
                                    onPress={() => setSelectedClientId(client.id)}
                                >
                                    <Text style={[styles.clientItemText, selectedClientId === client.id && styles.clientItemTextSelected]}>
                                        {client.full_name}
                                    </Text>
                                    {selectedClientId === client.id && (
                                        <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={styles.label}>Note Content</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Enter your note..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            value={newNoteContent}
                            onChangeText={setNewNoteContent}
                        />

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddNote}
                        >
                            <LinearGradient
                                colors={['#4F46E5', '#7C3AED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitGradient}
                            >
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitText}>Add Note</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        shadowColor: '#4F46E5',
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
        marginBottom: 16,
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
    filterScroll: {
        marginTop: 8,
    },
    filterTab: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
    },
    filterTabActive: {
        backgroundColor: '#fff',
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'capitalize',
    },
    filterTabTextActive: {
        color: '#4F46E5',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    noteCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    noteIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    noteContent: {
        flex: 1,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    noteClient: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    noteActions: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteButton: {
        opacity: 0.8,
    },
    noteText: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    noteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteTypeBadge: {
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    noteTypeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    noteDate: {
        fontSize: 12,
        color: '#9CA3AF',
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
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    clientList: {
        maxHeight: 150,
        marginBottom: 16,
    },
    clientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#F9FAFB',
    },
    clientItemSelected: {
        backgroundColor: '#EEF2FF',
    },
    clientItemText: {
        fontSize: 16,
        color: '#374151',
    },
    clientItemTextSelected: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        minHeight: 100,
        textAlignVertical: 'top',
        marginBottom: 16,
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})
