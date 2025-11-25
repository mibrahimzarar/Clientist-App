import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    Alert,
    KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import DateTimePicker from '@react-native-community/datetimepicker'
import { ClientTask, TaskPriority, CreateTaskDTO } from '../../types/tasks'
import { supabase } from '../../lib/supabase'

interface TaskModalProps {
    visible: boolean
    onClose: () => void
    onSubmit: (task: CreateTaskDTO) => void
    initialData?: ClientTask
    preSelectedClientId?: string
}

export const TaskModal: React.FC<TaskModalProps> = ({
    visible,
    onClose,
    onSubmit,
    initialData,
    preSelectedClientId,
}) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [priority, setPriority] = useState<TaskPriority>('medium')
    const [clientId, setClientId] = useState(preSelectedClientId || '')
    const [clients, setClients] = useState<Array<{ id: string; full_name: string }>>([])
    const [showClientList, setShowClientList] = useState(false)
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
    const [showDatePicker, setShowDatePicker] = useState(false)

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setTitle(initialData.title)
                setDescription(initialData.description || '')
                setPriority(initialData.priority)
                setClientId(initialData.client_id)
                setDueDate(initialData.due_date ? new Date(initialData.due_date) : undefined)
            } else {
                setTitle('')
                setDescription('')
                setPriority('medium')
                setClientId(preSelectedClientId || '')
                setDueDate(undefined)
            }
            fetchClients()
        }
    }, [visible, initialData, preSelectedClientId])

    const fetchClients = async () => {
        try {
            console.log('TaskModal: Fetching clients...')
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                console.log('TaskModal: No user found')
                return
            }

            console.log('TaskModal: User ID:', user.id)
            const { data, error } = await supabase
                .from('clients')
                .select('id, full_name')
                .eq('created_by', user.id)
                .order('full_name')

            if (error) {
                console.error('TaskModal: Error fetching clients:', error)
                return
            }

            console.log('TaskModal: Fetched clients:', data?.length || 0)
            if (data) setClients(data)
        } catch (error) {
            console.error('TaskModal: Exception in fetchClients:', error)
        }
    }

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a task title')
            return
        }
        if (!clientId) {
            Alert.alert('Error', 'Please select a client')
            return
        }

        onSubmit({
            client_id: clientId,
            title: title.trim(),
            description: description.trim(),
            priority,
            status: initialData?.status || 'pending',
            due_date: dueDate?.toISOString(),
        })
        onClose()
    }

    const priorities: TaskPriority[] = ['low', 'medium', 'high', 'urgent']

    const getPriorityColor = (p: TaskPriority) => {
        switch (p) {
            case 'urgent': return '#EF4444'
            case 'high': return '#F59E0B'
            case 'medium': return '#3B82F6'
            case 'low': return '#10B981'
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            {initialData ? 'Edit Task' : 'New Task'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {!preSelectedClientId && (
                            <View style={styles.field}>
                                <Text style={styles.label}>Client</Text>
                                <TouchableOpacity
                                    style={styles.selectButton}
                                    onPress={() => setShowClientList(!showClientList)}
                                >
                                    <Text style={[styles.selectText, !clientId && styles.placeholderText]}>
                                        {clients.find(c => c.id === clientId)?.full_name || 'Select Client'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                                </TouchableOpacity>
                                {showClientList && (
                                    <View style={styles.dropdown}>
                                        {clients.length === 0 ? (
                                            <View style={styles.dropdownItem}>
                                                <Text style={styles.dropdownText}>No clients found</Text>
                                            </View>
                                        ) : (
                                            clients.map(client => (
                                                <TouchableOpacity
                                                    key={client.id}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setClientId(client.id)
                                                        setShowClientList(false)
                                                    }}
                                                >
                                                    <Text style={styles.dropdownText}>{client.full_name}</Text>
                                                    {clientId === client.id && (
                                                        <Ionicons name="checkmark" size={20} color="#14B8A6" />
                                                    )}
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        <View style={styles.field}>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Task title"
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Priority</Text>
                            <View style={styles.priorityContainer}>
                                {priorities.map(p => (
                                    <TouchableOpacity
                                        key={p}
                                        style={[
                                            styles.priorityButton,
                                            priority === p && { backgroundColor: getPriorityColor(p) + '20', borderColor: getPriorityColor(p) }
                                        ]}
                                        onPress={() => setPriority(p)}
                                    >
                                        <Text style={[
                                            styles.priorityText,
                                            priority === p && { color: getPriorityColor(p), fontWeight: '600' }
                                        ]}>
                                            {p}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Deadline (Optional)</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                                <Text style={[styles.dateText, !dueDate && styles.placeholderText]}>
                                    {dueDate ? dueDate.toLocaleDateString() : 'Set deadline'}
                                </Text>
                                {dueDate && (
                                    <TouchableOpacity
                                        onPress={() => setDueDate(undefined)}
                                        style={styles.clearButton}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>Description</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Add details..."
                                multiline
                                numberOfLines={3}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        {/* Extra padding to ensure content is visible above keyboard */}
                        <View style={{ height: 100 }} />
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                            <LinearGradient
                                colors={['#14B8A6', '#0D9488']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitText}>
                                    {initialData ? 'Save Changes' : 'Create Task'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            // Always close the picker after interaction
                            setShowDatePicker(false)
                            // Only update the date if user confirmed (not cancelled)
                            if (event.type === 'set' && selectedDate) {
                                setDueDate(selectedDate)
                            }
                        }}
                        minimumDate={new Date()}
                    />
                )}
            </KeyboardAvoidingView>
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
        maxHeight: '90%',
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
    content: {
        padding: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    selectButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    selectText: {
        fontSize: 16,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    priorityButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    priorityText: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    clearButton: {
        padding: 4,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4B5563',
    },
    submitButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        padding: 16,
        alignItems: 'center',
    },
    submitText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
})
