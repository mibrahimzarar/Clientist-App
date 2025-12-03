import React, { useState } from 'react'
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
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCreateSPInvoice, useSPClients, useSPJobs } from '../../../../src/hooks/useServiceProvider'
import { SPInvoiceItem } from '../../../../src/types/serviceProvider'
import { DatePickerInput } from '../../../../src/components/ui/DatePickerInput'

export default function NewInvoicePage() {
    const createInvoiceMutation = useCreateSPInvoice()
    const { data: clientsData } = useSPClients()
    const { data: jobsData } = useSPJobs()

    const clients = clientsData?.data || []
    const jobs = jobsData?.data || []

    const [formData, setFormData] = useState({
        client_id: '',
        job_id: '',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        invoice_date: new Date().toISOString(),
        due_date: '',
    })

    const [tasks, setTasks] = useState<Partial<SPInvoiceItem>[]>([
        { description: '', amount: 0 }
    ])

    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showJobPicker, setShowJobPicker] = useState(false)

    const selectedClient = clients.find(c => c.id === formData.client_id)
    const selectedJob = jobs.find(j => j.id === formData.job_id)
    const clientJobs = jobs.filter(j => j.client_id === formData.client_id)

    const calculateSubtotal = () => {
        return tasks.reduce((sum, task) => sum + (task.amount || 0), 0)
    }

    const calculateTotal = () => {
        return calculateSubtotal()
    }

    const addTask = () => {
        setTasks([...tasks, { description: '', amount: 0 }])
    }

    const removeTask = (index: number) => {
        if (tasks.length > 1) {
            setTasks(tasks.filter((_, i) => i !== index))
        }
    }

    const updateTask = (index: number, field: keyof SPInvoiceItem, value: any) => {
        const newTasks = [...tasks]
        newTasks[index] = { ...newTasks[index], [field]: value }
        setTasks(newTasks)
    }

    const handleSubmit = async () => {
        if (!formData.client_id) {
            Alert.alert('Error', 'Please select a client')
            return
        }

        if (!formData.invoice_number.trim()) {
            Alert.alert('Error', 'Please enter invoice number')
            return
        }

        if (tasks.some(task => !task.description?.trim())) {
            Alert.alert('Error', 'Please fill in all task descriptions')
            return
        }

        const result = await createInvoiceMutation.mutateAsync({
            invoice: {
                client_id: formData.client_id,
                job_id: formData.job_id || undefined,
                invoice_number: formData.invoice_number,
                invoice_date: formData.invoice_date,
                due_date: formData.due_date || undefined,
                status: 'unpaid',
                subtotal: calculateSubtotal(),
                tax_amount: 0,
                discount_amount: 0,
                total_amount: calculateTotal(),
                amount_paid: 0,
                notes: '',
            },
            items: tasks.map(task => ({
                description: task.description!,
                quantity: 1,
                unit_price: task.amount!,
                amount: task.amount!,
            }))
        })

        if (result.data) {
            Alert.alert('Success', 'Invoice created successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ])
        } else {
            Alert.alert('Error', 'Failed to create invoice')
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>New Invoice</Text>
                    <Text style={styles.headerSubtitle}>Create invoice</Text>
                </View>
                <View style={styles.placeholder} />
            </LinearGradient>

            {/* Form */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Invoice Information</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Invoice Number <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., INV-001"
                            value={formData.invoice_number}
                            onChangeText={(text) => setFormData({ ...formData, invoice_number: text })}
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
                                {selectedClient?.full_name || 'Select Client'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {formData.client_id && clientJobs.length > 0 && (
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Link to Job (Optional)</Text>
                            <TouchableOpacity
                                style={styles.pickerContainer}
                                onPress={() => setShowJobPicker(true)}
                            >
                                <Ionicons name="construct" size={20} color="#6B7280" />
                                <Text style={[styles.pickerText, !formData.job_id && styles.placeholderText]}>
                                    {selectedJob?.title || 'Select Job'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <DatePickerInput
                                label="Invoice Date"
                                value={formData.invoice_date}
                                onChange={(date) => setFormData({ ...formData, invoice_date: date })}
                                placeholder="Select date"
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <DatePickerInput
                                label="Due Date"
                                value={formData.due_date}
                                onChange={(date) => setFormData({ ...formData, due_date: date })}
                                placeholder="Select date"
                            />
                        </View>
                    </View>
                </View>

                {/* Tasks Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tasks</Text>
                        <TouchableOpacity style={styles.addTaskButton} onPress={addTask}>
                            <Ionicons name="add-circle" size={24} color="#10B981" />
                        </TouchableOpacity>
                    </View>

                    {tasks.map((task, index) => (
                        <View key={index} style={styles.taskCard}>
                            <View style={styles.taskHeader}>
                                <Text style={styles.taskNumber}>Task {index + 1}</Text>
                                {tasks.length > 1 && (
                                    <TouchableOpacity onPress={() => removeTask(index)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Description</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Task description"
                                    value={task.description}
                                    onChangeText={(text) => updateTask(index, 'description', text)}
                                    multiline
                                    numberOfLines={2}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Amount</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={task.amount?.toString() || ''}
                                    onChangeText={(text) => updateTask(index, 'amount', parseFloat(text) || 0)}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Pricing Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Pricing</Text>

                    <View style={styles.totalCard}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>{calculateTotal().toLocaleString()}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={createInvoiceMutation.isPending}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
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
                                        setFormData({ ...formData, client_id: item.id, job_id: '' })
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
                                        <Ionicons name="checkmark" size={20} color="#10B981" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* Job Picker Modal */}
            <Modal
                visible={showJobPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowJobPicker(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Job</Text>
                            <TouchableOpacity onPress={() => setShowJobPicker(false)}>
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={clientJobs}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalItem,
                                        formData.job_id === item.id && styles.modalItemSelected
                                    ]}
                                    onPress={() => {
                                        setFormData({ ...formData, job_id: item.id })
                                        setShowJobPicker(false)
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={[
                                            styles.modalItemText,
                                            formData.job_id === item.id && styles.modalItemTextSelected
                                        ]}>
                                            {item.title}
                                        </Text>
                                        {item.job_price && (
                                            <Text style={styles.modalItemSubtext}>
                                                {item.job_price.toLocaleString()}
                                            </Text>
                                        )}
                                    </View>
                                    {formData.job_id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#10B981" />
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#10B981',
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    addTaskButton: {
        padding: 4,
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
        minHeight: 80,
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
    taskCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 15,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    totalCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        borderRadius: 12,
        padding: 16,
        marginVertical: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#059669',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#059669',
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
        shadowColor: '#10B981',
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
        backgroundColor: '#D1FAE5',
    },
    modalItemText: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    modalItemTextSelected: {
        color: '#059669',
        fontWeight: '600',
    },
    modalItemSubtext: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
})
