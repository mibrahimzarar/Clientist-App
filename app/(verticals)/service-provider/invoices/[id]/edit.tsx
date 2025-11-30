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
import { useSPInvoice, useUpdateSPInvoice, useSPClients, useSPJobs } from '../../../../../src/hooks/useServiceProvider'
import { SPInvoiceItem, SPInvoiceStatus } from '../../../../../src/types/serviceProvider'
import { DatePickerInput } from '../../../../../src/components/ui/DatePickerInput'
import { BouncingBallsLoader } from '../../../../../src/components/ui/BouncingBallsLoader'

export default function EditInvoicePage() {
    const { id } = useLocalSearchParams()
    const invoiceId = id as string

    const { data: invoiceData, isLoading } = useSPInvoice(invoiceId)
    const updateInvoiceMutation = useUpdateSPInvoice()
    const { data: clientsData } = useSPClients()
    const { data: jobsData } = useSPJobs()

    const clients = clientsData?.data || []
    const jobs = jobsData?.data || []
    const invoice = invoiceData?.data

    const [formData, setFormData] = useState({
        client_id: '',
        job_id: '',
        invoice_number: '',
        invoice_date: '',
        due_date: '',
        status: 'unpaid' as SPInvoiceStatus,
        tax_amount: '',
        discount_amount: '',
        notes: '',
    })

    const [tasks, setTasks] = useState<Partial<SPInvoiceItem>[]>([])
    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showJobPicker, setShowJobPicker] = useState(false)

    const selectedClient = clients.find(c => c.id === formData.client_id)
    const selectedJob = jobs.find(j => j.id === formData.job_id)
    const clientJobs = jobs.filter(j => j.client_id === formData.client_id)

    useEffect(() => {
        if (invoice) {
            setFormData({
                client_id: invoice.client_id,
                job_id: invoice.job_id || '',
                invoice_number: invoice.invoice_number,
                invoice_date: invoice.invoice_date,
                due_date: invoice.due_date || '',
                status: invoice.status,
                tax_amount: invoice.tax_amount?.toString() || '',
                discount_amount: invoice.discount_amount?.toString() || '',
                notes: invoice.notes || '',
            })

            // Transform items (no quantity display per spec)
            const transformedTasks = invoice.items?.map(item => ({
                id: item.id,
                description: item.description,
                amount: item.amount
            })) || [{ description: '', amount: 0 }]
            
            setTasks(transformedTasks)
        }
    }, [invoice])

    const calculateSubtotal = () => {
        return tasks.reduce((sum, task) => sum + (task.amount || 0), 0)
    }

    const calculateTotal = () => {
        const subtotal = calculateSubtotal()
        const tax = parseFloat(formData.tax_amount) || 0
        const discount = parseFloat(formData.discount_amount) || 0
        return subtotal + tax - discount
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

        const result = await updateInvoiceMutation.mutateAsync({
            id: invoiceId,
            updates: {
                client_id: formData.client_id,
                job_id: formData.job_id || undefined,
                invoice_number: formData.invoice_number,
                invoice_date: formData.invoice_date,
                due_date: formData.due_date || undefined,
                status: formData.status,
                subtotal: calculateSubtotal(),
                tax_amount: parseFloat(formData.tax_amount) || 0,
                discount_amount: parseFloat(formData.discount_amount) || 0,
                total_amount: calculateTotal(),
                notes: formData.notes,
            },
            items: tasks.map(task => ({
                description: task.description!,
                quantity: 1,
                unit_price: task.amount!,
                amount: task.amount!,
            }))
        })

        if (result.data) {
            Alert.alert('Success', 'Invoice updated successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ])
        } else {
            Alert.alert('Error', 'Failed to update invoice')
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#10B981" />
            </View>
        )
    }

    if (!invoice) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
                <Text style={styles.errorText}>Invoice not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButtonError}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
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
                    <Text style={styles.headerTitle}>Edit Invoice</Text>
                    <Text style={styles.headerSubtitle}>#{invoice.invoice_number}</Text>
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

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {(['unpaid', 'paid', 'partially_paid', 'overdue', 'cancelled'] as SPInvoiceStatus[]).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusChip,
                                        formData.status === status && styles.statusChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, status })}
                                >
                                    <Text style={[
                                        styles.statusChipText,
                                        formData.status === status && styles.statusChipTextActive
                                    ]}>
                                        {status.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
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

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>₨{calculateSubtotal().toLocaleString()}</Text>
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Tax Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={formData.tax_amount}
                                onChangeText={(text) => setFormData({ ...formData, tax_amount: text })}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Discount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={formData.discount_amount}
                                onChangeText={(text) => setFormData({ ...formData, discount_amount: text })}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.totalCard}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₨{calculateTotal().toLocaleString()}</Text>
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Additional notes"
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateInvoiceMutation.isPending}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {updateInvoiceMutation.isPending ? 'Updating...' : 'Update Invoice'}
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
                                    <Text style={[
                                        styles.modalItemText,
                                        formData.job_id === item.id && styles.modalItemTextSelected
                                    ]}>
                                        {item.title}
                                    </Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
        marginTop: 16,
    },
    backButtonError: {
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#10B981',
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
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
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#111827',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    pickerText: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    placeholderText: {
        color: '#9CA3AF',
    },
    statusChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginRight: 8,
    },
    statusChipActive: {
        backgroundColor: '#10B981',
    },
    statusChipText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    statusChipTextActive: {
        color: '#fff',
    },
    taskCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskNumber: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#059669',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#059669',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitText: {
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
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
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
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalItemSelected: {
        backgroundColor: '#F0FDF4',
    },
    modalItemText: {
        fontSize: 16,
        color: '#111827',
    },
    modalItemTextSelected: {
        fontWeight: '600',
        color: '#059669',
    },
})
