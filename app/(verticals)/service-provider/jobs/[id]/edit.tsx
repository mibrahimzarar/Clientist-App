import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Modal,
    FlatList,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPJob, useUpdateSPJob, useSPClients, useSPJobCategories } from '../../../../../src/hooks/useServiceProvider'
import { SPJobStatus, SPJobPriority } from '../../../../../src/types/serviceProvider'
import { DatePickerInput } from '../../../../../src/components/ui/DatePickerInput'
import { BouncingBallsLoader } from '../../../../../src/components/ui/BouncingBallsLoader'

export default function EditJobPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: jobData, isLoading } = useSPJob(id)
    const updateJobMutation = useUpdateSPJob()
    const { data: clientsData } = useSPClients()
    const { data: categoriesData } = useSPJobCategories()

    const job = jobData?.data
    const clients = clientsData?.data || []
    const categories = categoriesData?.data || []

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        client_id: '',
        category_id: '',
        location_address: '',
        priority: 'normal' as SPJobPriority,
        job_price: '',
        parts_cost: '',
        labor_cost: '',
        scheduled_date: '',
        is_urgent: false,
    })

    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showCategoryPicker, setShowCategoryPicker] = useState(false)

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                description: job.description || '',
                client_id: job.client_id || '',
                category_id: job.category_id || '',
                location_address: job.location_address || '',
                priority: job.priority || 'normal',
                job_price: job.job_price?.toString() || '',
                parts_cost: job.parts_cost?.toString() || '',
                labor_cost: job.labor_cost?.toString() || '',
                scheduled_date: job.scheduled_date || '',
                is_urgent: job.is_urgent || false,
            })
        }
    }, [job])

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter job title')
            return
        }

        if (!formData.client_id) {
            Alert.alert('Error', 'Please select a client')
            return
        }

        const jobPrice = parseFloat(formData.job_price) || 0
        const partsCost = parseFloat(formData.parts_cost) || 0
        const laborCost = parseFloat(formData.labor_cost) || 0
        const totalCost = jobPrice || (partsCost + laborCost)

        const result = await updateJobMutation.mutateAsync({
            id,
            updates: {
                title: formData.title,
                description: formData.description,
                client_id: formData.client_id,
                category_id: formData.category_id || undefined,
                location_address: formData.location_address,
                priority: formData.priority,
                job_price: jobPrice || undefined,
                parts_cost: partsCost,
                labor_cost: laborCost,
                total_cost: totalCost,
                scheduled_date: formData.scheduled_date || undefined,
                is_urgent: formData.is_urgent,
            },
        })

        if (result.data) {
            Alert.alert('Success', 'Job updated successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ])
        } else {
            Alert.alert('Error', 'Failed to update job')
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#3B82F6" />
            </View>
        )
    }

    if (!job) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Job not found</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Edit Job</Text>
                    <Text style={styles.headerSubtitle}>Update work order</Text>
                </View>
                <View style={styles.placeholder} />
            </LinearGradient>

            {/* Form */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Job Information</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Job Title <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., AC Repair"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Client <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.pickerContainer}
                            onPress={() => setShowClientPicker(true)}
                        >
                            <Ionicons name="person" size={20} color="#6B7280" />
                            <Text style={[styles.pickerText, !formData.client_id && styles.placeholderText]}>
                                {clients.find(c => c.id === formData.client_id)?.full_name || 'Select Client'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Category</Text>
                        <TouchableOpacity
                            style={styles.pickerContainer}
                            onPress={() => setShowCategoryPicker(true)}
                        >
                            <Ionicons name="pricetag" size={20} color="#6B7280" />
                            <Text style={[styles.pickerText, !formData.category_id && styles.placeholderText]}>
                                {categories.find(c => c.id === formData.category_id)?.name || 'Select Category'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe the job details"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Location Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter job location"
                            value={formData.location_address}
                            onChangeText={(text) => setFormData({ ...formData, location_address: text })}
                            multiline
                            numberOfLines={2}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Scheduling</Text>

                    <View style={styles.formGroup}>
                        <DatePickerInput
                            label="Scheduled Date"
                            value={formData.scheduled_date}
                            onChange={(date) => setFormData({ ...formData, scheduled_date: date })}
                            placeholder="Select date"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Priority</Text>
                        <View style={styles.priorityButtons}>
                            {(['low', 'normal', 'high', 'urgent'] as SPJobPriority[]).map((priority) => (
                                <TouchableOpacity
                                    key={priority}
                                    style={[
                                        styles.priorityButton,
                                        formData.priority === priority && styles.priorityButtonActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, priority })}
                                >
                                    <Text style={[
                                        styles.priorityButtonText,
                                        formData.priority === priority && styles.priorityButtonTextActive
                                    ]}>
                                        {priority}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.urgentToggle}
                        onPress={() => setFormData({ ...formData, is_urgent: !formData.is_urgent })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.urgentToggleLeft}>
                            <Ionicons
                                name={formData.is_urgent ? 'alert-circle' : 'alert-circle-outline'}
                                size={24}
                                color={formData.is_urgent ? '#EF4444' : '#6B7280'}
                            />
                            <Text style={styles.urgentToggleText}>Mark as Urgent</Text>
                        </View>
                        <View style={[styles.toggle, formData.is_urgent && styles.toggleActive]}>
                            <View style={[styles.toggleThumb, formData.is_urgent && styles.toggleThumbActive]} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Job Price (Total)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0"
                            value={formData.job_price}
                            onChangeText={(text) => setFormData({ ...formData, job_price: text })}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Parts Cost</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={formData.parts_cost}
                                onChangeText={(text) => setFormData({ ...formData, parts_cost: text })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Labor Cost</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={formData.labor_cost}
                                onChangeText={(text) => setFormData({ ...formData, labor_cost: text })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateJobMutation.isPending}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {updateJobMutation.isPending ? 'Updating...' : 'Update Job'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

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
                                    style={[
                                        styles.modalItem,
                                        formData.client_id === item.id && styles.modalItemSelected
                                    ]}
                                    onPress={() => {
                                        setFormData({ ...formData, client_id: item.id })
                                        setShowClientPicker(false)
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        formData.client_id === item.id && styles.modalItemTextSelected
                                    ]}>
                                        {item.full_name}
                                    </Text>
                                    {formData.client_id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Category Picker Modal */}
            <Modal
                visible={showCategoryPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCategoryPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Category</Text>
                            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        formData.category_id === item.id && styles.modalItemSelected
                                    ]}
                                    onPress={() => {
                                        setFormData({ ...formData, category_id: item.id })
                                        setShowCategoryPicker(false)
                                    }}
                                >
                                    <Text style={[
                                        styles.modalItemText,
                                        formData.category_id === item.id && styles.modalItemTextSelected
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {formData.category_id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
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
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    pickerText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    priorityButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
    },
    priorityButtonActive: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    priorityButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    priorityButtonTextActive: {
        color: '#fff',
    },
    urgentToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    urgentToggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    urgentToggleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        padding: 2,
    },
    toggleActive: {
        backgroundColor: '#EF4444',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        transform: [{ translateX: 22 }],
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    submitGradient: {
        padding: 18,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
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
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalItemSelected: {
        backgroundColor: '#EFF6FF',
    },
    modalItemText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    modalItemTextSelected: {
        color: '#3B82F6',
        fontWeight: '600',
    },
})
