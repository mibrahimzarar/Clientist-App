import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { ClientNote } from '../../types/travelAgent'
import { getClientNotes, createClientNote, deleteClientNote, toggleNotePin } from '../../api/notes'
import { BouncingBallsLoader } from '../ui/BouncingBallsLoader'

interface NotesTimelineProps {
    clientId: string
}

export const NotesTimeline: React.FC<NotesTimelineProps> = ({ clientId }) => {
    const [notes, setNotes] = useState<ClientNote[]>([])
    const [loading, setLoading] = useState(true)
    const [newNote, setNewNote] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchNotes()
    }, [clientId])

    const fetchNotes = async () => {
        try {
            const data = await getClientNotes(clientId)
            setNotes(data)
        } catch (error) {
            console.error('Error fetching notes:', error)
            Alert.alert('Error', 'Failed to load notes')
        } finally {
            setLoading(false)
        }
    }

    const handleAddNote = async () => {
        if (!newNote.trim()) return

        setSubmitting(true)
        try {
            const note = await createClientNote(clientId, newNote.trim())
            setNotes([note, ...notes])
            setNewNote('')
        } catch (error) {
            console.error('Error adding note:', error)
            Alert.alert('Error', 'Failed to add note')
        } finally {
            setSubmitting(false)
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
                            setNotes(notes.filter(n => n.id !== noteId))
                        } catch (error) {
                            console.error('Error deleting note:', error)
                            Alert.alert('Error', 'Failed to delete note')
                        }
                    }
                }
            ]
        )
    }

    const handleTogglePin = async (note: ClientNote) => {
        try {
            const updatedNote = await toggleNotePin(note.id, !note.is_pinned)
            setNotes(notes.map(n => n.id === note.id ? updatedNote : n).sort((a, b) => {
                if (a.is_pinned === b.is_pinned) {
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                }
                return a.is_pinned ? -1 : 1
            }))
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
            case 'status_change': return '#F59E0B'
            case 'creation': return '#10B981'
            case 'follow_up': return '#8B5CF6'
            case 'system': return '#6B7280'
            default: return '#4F46E5'
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={8} color="#4F46E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Timeline & Notes</Text>

            {/* Add Note Input */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a note..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={newNote}
                    onChangeText={setNewNote}
                />
                <TouchableOpacity
                    style={[styles.addButton, !newNote.trim() && styles.addButtonDisabled]}
                    onPress={handleAddNote}
                    disabled={!newNote.trim() || submitting}
                >
                    {submitting ? (
                        <BouncingBallsLoader color="#fff" size={8} />
                    ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
                {notes.length === 0 ? (
                    <Text style={styles.emptyText}>No notes yet. Start by adding one!</Text>
                ) : (
                    notes.map((note, index) => (
                        <View key={note.id} style={styles.timelineItem}>
                            {/* Timeline Line */}
                            {index !== notes.length - 1 && <View style={styles.timelineLine} />}

                            {/* Icon */}
                            <View style={[styles.iconContainer, { backgroundColor: getColorForType(note.type) }]}>
                                <Ionicons name={getIconForType(note.type)} size={16} color="#fff" />
                            </View>

                            {/* Content */}
                            <View style={styles.contentContainer}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.date}>
                                        {new Date(note.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                    <View style={styles.actions}>
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
                                <Text style={styles.noteContent}>{note.content}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
        minHeight: 40,
        maxHeight: 120,
        paddingTop: 8,
        paddingBottom: 8,
    },
    addButton: {
        backgroundColor: '#4F46E5',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    addButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    timeline: {
        paddingBottom: 20,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        left: 16,
        top: 32,
        bottom: -24,
        width: 2,
        backgroundColor: '#E5E7EB',
        zIndex: -1,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    deleteButton: {
        opacity: 0.8,
    },
    noteContent: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    emptyText: {
        textAlign: 'center',
        color: '#9CA3AF',
        fontStyle: 'italic',
        marginTop: 20,
    },
})
