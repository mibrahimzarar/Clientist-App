import React, { useEffect, useState } from 'react'
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
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFreelancerProject, useUpdateProject, useFreelancerClients } from '../../../../../src/hooks/useFreelancer'
import { ProjectStatus, ProjectPriority } from '../../../../../src/types/freelancer'

export default function EditProjectPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: projectData, isLoading: isLoadingProject } = useFreelancerProject(id)
    const updateProjectMutation = useUpdateProject()
    const { data: clientsData } = useFreelancerClients()
    const clients = clientsData?.data?.data || []

    const [formData, setFormData] = useState({
        title: '',
        client_id: '',
        description: '',
        project_type: '',
        status: 'draft' as ProjectStatus,
        priority: 'medium' as ProjectPriority,
        budget: '',
        deadline: '',
    })
    const [showClientPicker, setShowClientPicker] = useState(false)
    const [selectedClientName, setSelectedClientName] = useState('')

    useEffect(() => {
        if (projectData?.data) {
            const project = projectData.data
            setFormData({
                title: project.title || '',
                client_id: project.client_id || '',
                description: project.description || '',
                project_type: project.project_type || '',
                status: project.status,
                priority: project.priority,
                budget: project.budget?.toString() || '',
                deadline: project.deadline || '',
            })
            if (project.client) {
                setSelectedClientName(project.client.full_name)
            }
        }
    }, [projectData])

    const handleSubmit = async () => {
        if (!formData.title) {
            Alert.alert('Error', 'Project Title is required')
            return
        }
        if (!formData.client_id) {
            Alert.alert('Error', 'Client is required')
            return
        }

        try {
            await updateProjectMutation.mutateAsync({
                id,
                updates: {
                    ...formData,
                    budget: formData.budget ? parseFloat(formData.budget) : undefined,
                }
            })
            Alert.alert('Success', 'Project updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to update project')
            console.error(error)
        }
    }

    if (isLoadingProject) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
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
                    <Text style={styles.headerTitle}>Edit Project</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Project Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="e.g. Website Redesign"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Client *</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowClientPicker(true)}
                        >
                            <Text style={[styles.selectButtonText, !selectedClientName && styles.placeholderText]}>
                                {selectedClientName || 'Select Client'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Project Type</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.project_type}
                            onChangeText={(text) => setFormData({ ...formData, project_type: text })}
                            placeholder="e.g. Web Development"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Budget</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.budget}
                                onChangeText={(text) => setFormData({ ...formData, budget: text })}
                                placeholder="0.00"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Deadline</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.deadline}
                                onChangeText={(text) => setFormData({ ...formData, deadline: text })}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusContainer}>
                            {(['draft', 'in_progress', 'pending_feedback', 'completed'] as ProjectStatus[]).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusChip,
                                        formData.status === status && styles.statusChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, status })}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        formData.status === status && styles.statusTextActive
                                    ]}>
                                        {status.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
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
                            placeholder="Project details..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateProjectMutation.isPending}
                >
                    {updateProjectMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Update Project</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Client Picker Modal */}
            <Modal
                visible={showClientPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowClientPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Client</Text>
                            <TouchableOpacity onPress={() => setShowClientPicker(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={clients}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.clientItem}
                                    onPress={() => {
                                        setFormData({ ...formData, client_id: item.id })
                                        setSelectedClientName(item.full_name)
                                        setShowClientPicker(false)
                                    }}
                                >
                                    <View>
                                        <Text style={styles.clientName}>{item.full_name}</Text>
                                        {item.company_name && (
                                            <Text style={styles.clientCompany}>{item.company_name}</Text>
                                        )}
                                    </View>
                                    {formData.client_id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#8B5CF6" />
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
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
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
        backgroundColor: '#8B5CF6',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        shadowColor: '#8B5CF6',
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
    clientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    clientCompany: {
        fontSize: 14,
        color: '#6B7280',
    },
})
