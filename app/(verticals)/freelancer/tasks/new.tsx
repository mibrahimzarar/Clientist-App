import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    FlatList,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCreateTask, useFreelancerProjects } from '../../../../src/hooks/useFreelancer'
import { TaskStatus, ProjectPriority } from '../../../../src/types/freelancer'
import { DatePickerInput } from '../../../../src/components/ui/DatePickerInput'

export default function NewTaskPage() {
    const [formData, setFormData] = useState({
        title: '',
        project_id: '',
        description: '',
        status: 'todo' as TaskStatus,
        priority: 'medium' as ProjectPriority,
        due_date: '',
        estimated_hours: '',
    })
    const [showProjectPicker, setShowProjectPicker] = useState(false)
    const [selectedProjectTitle, setSelectedProjectTitle] = useState('')

    const createTaskMutation = useCreateTask()
    const { data: projectsData } = useFreelancerProjects()
    const projects = projectsData?.data?.data || []

    const handleSubmit = async () => {
        if (!formData.title) {
            Alert.alert('Error', 'Task Title is required')
            return
        }
        if (!formData.project_id) {
            Alert.alert('Error', 'Project is required')
            return
        }

        try {
            await createTaskMutation.mutateAsync({
                ...formData,
                estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
            })
            Alert.alert('Success', 'Task created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to create task')
            console.error(error)
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#EC4899', '#DB2777']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>New Task</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Task Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="e.g. Design Homepage"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Project *</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowProjectPicker(true)}
                        >
                            <Text style={[styles.selectButtonText, !selectedProjectTitle && styles.placeholderText]}>
                                {selectedProjectTitle || 'Select Project'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Est. Hours</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.estimated_hours}
                                onChangeText={(text) => setFormData({ ...formData, estimated_hours: text })}
                                placeholder="0"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <DatePickerInput
                                label="Due Date"
                                value={formData.due_date}
                                onChange={(date) => setFormData({ ...formData, due_date: date })}
                                placeholder="Select due date"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.statusContainer}>
                            {(['low', 'medium', 'high', 'urgent'] as ProjectPriority[]).map((priority) => (
                                <TouchableOpacity
                                    key={priority}
                                    style={[
                                        styles.statusChip,
                                        formData.priority === priority && styles.statusChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, priority })}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        formData.priority === priority && styles.statusTextActive
                                    ]}>
                                        {priority}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Task details..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={createTaskMutation.isPending}
                >
                    {createTaskMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Task</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Project Picker Modal */}
            <Modal
                visible={showProjectPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowProjectPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Project</Text>
                            <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={projects}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.projectItem}
                                    onPress={() => {
                                        setFormData({ ...formData, project_id: item.id })
                                        setSelectedProjectTitle(item.title)
                                        setShowProjectPicker(false)
                                    }}
                                >
                                    <View>
                                        <Text style={styles.projectName}>{item.title}</Text>
                                        {item.client && (
                                            <Text style={styles.clientName}>{item.client.full_name}</Text>
                                        )}
                                    </View>
                                    {formData.project_id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#EC4899" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
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
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    selectButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    selectButtonText: {
        fontSize: 16,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    textArea: {
        minHeight: 100,
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusChipActive: {
        backgroundColor: '#EC4899',
        borderColor: '#EC4899',
    },
    statusText: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    statusTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#EC4899',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
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
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    projectItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    projectName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    clientName: {
        fontSize: 14,
        color: '#6B7280',
    },
})
