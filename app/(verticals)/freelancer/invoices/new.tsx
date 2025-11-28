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
    Modal,
    FlatList
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useCreateInvoice, useFreelancerClients, useFreelancerProjects } from '../../../../src/hooks/useFreelancer'
import { DatePickerInput } from '../../../../src/components/ui/DatePickerInput'
import { FreelancerInvoiceItem, InvoiceStatus } from '../../../../src/types/freelancer'

export default function NewInvoicePage() {
    const { projectId } = useLocalSearchParams()
    const { data: clientsData } = useFreelancerClients()
    const { data: projectsData } = useFreelancerProjects()
    const clients = clientsData?.data?.data || []
    const projects = projectsData?.data?.data || []
    const createInvoiceMutation = useCreateInvoice()

    const [formData, setFormData] = useState({
        client_id: '',
        project_id: projectId ? (projectId as string) : '',
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        status: 'draft' as InvoiceStatus,
        currency: 'USD',
        notes: '',
    })

    const [items, setItems] = useState<Partial<FreelancerInvoiceItem>[]>([
        { description: '', unit_price: 0, amount: 0 }
    ])

    const [showClientPicker, setShowClientPicker] = useState(false)
    const [showProjectPicker, setShowProjectPicker] = useState(false)
    const [selectedClientName, setSelectedClientName] = useState('')
    const [selectedProjectName, setSelectedProjectName] = useState('')

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0)
        return {
            subtotal,
            total: subtotal // Add tax/discount logic here if needed
        }
    }

    const updateItem = (index: number, field: keyof FreelancerInvoiceItem, value: string | number) => {
        const newItems = [...items]
        const item = { ...newItems[index] }

        if (field === 'unit_price') {
            const val = parseFloat(value.toString()) || 0
            item[field] = val
            // For tasks, we'll consider quantity as 1 by default
            item.amount = val // amount = quantity (1) * unit_price
        } else if (field === 'description') {
            item.description = value.toString()
        }

        newItems[index] = item
        setItems(newItems)
    }

    const addItem = () => {
        setItems([...items, { description: '', unit_price: 0, amount: 0 }])
    }

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async () => {
        if (!formData.client_id) {
            Alert.alert('Error', 'Please select a client')
            return
        }
        if (!formData.due_date) {
            Alert.alert('Error', 'Please select a due date')
            return
        }
        if (items.some(item => !item.description || !item.amount)) {
            Alert.alert('Error', 'Please fill in all item details')
            return
        }

        const totals = calculateTotals()

        try {
            // Build invoice object, only include project_id if it has a value
            const invoiceData: any = {
                client_id: formData.client_id,
                invoice_number: formData.invoice_number,
                issue_date: formData.issue_date,
                due_date: formData.due_date,
                status: formData.status,
                currency: formData.currency,
                notes: formData.notes,
                subtotal: totals.subtotal,
                total_amount: totals.total
            }
            
            // Only add project_id if it has a non-empty value
            if (formData.project_id && formData.project_id.trim()) {
                invoiceData.project_id = formData.project_id
            }
            
            console.log('Creating invoice with data:', invoiceData)
            
            await createInvoiceMutation.mutateAsync({
                invoice: invoiceData,
                items
            })
            Alert.alert('Success', 'Invoice created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to create invoice')
            console.error(error)
        }
    }

    const { subtotal, total } = calculateTotals()

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
                    <Text style={styles.headerTitle}>New Invoice</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
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
                        <Text style={styles.label}>Project (Optional)</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowProjectPicker(true)}
                        >
                            <Text style={[styles.selectButtonText, !selectedProjectName && styles.placeholderText]}>
                                {selectedProjectName || 'Select Project'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Invoice No.</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.invoice_number}
                                onChangeText={(text) => setFormData({ ...formData, invoice_number: text })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>Currency</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.currency}
                                onChangeText={(text) => setFormData({ ...formData, currency: text })}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <DatePickerInput
                                label="Issue Date"
                                value={formData.issue_date}
                                onChange={(date) => setFormData({ ...formData, issue_date: date })}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <DatePickerInput
                                label="Due Date"
                                value={formData.due_date}
                                onChange={(date) => setFormData({ ...formData, due_date: date })}
                                placeholder="Select date"
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Tasks</Text>
                    {items.map((task, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemNumber}>Task {index + 1}</Text>
                                {items.length > 1 && (
                                    <TouchableOpacity onPress={() => removeItem(index)}>
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Task Description"
                                        value={task.description}
                                        onChangeText={(text) => updateItem(index, 'description', text)}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Price"
                                        keyboardType="numeric"
                                        value={task.unit_price?.toString()}
                                        onChangeText={(text) => updateItem(index, 'unit_price', text)}
                                    />
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                                    <Text style={styles.itemTotal}>
                                        {formData.currency} {task.amount?.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                        <Ionicons name="add-circle-outline" size={20} color="#8B5CF6" />
                        <Text style={styles.addItemText}>Add Task</Text>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalAmount}>
                            {formData.currency} {total.toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            placeholder="Payment terms, thank you note, etc."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={createInvoiceMutation.isPending}
                >
                    {createInvoiceMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Invoice</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>

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
                                            <Text style={styles.companyName}>{item.company_name}</Text>
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
                                    style={styles.clientItem}
                                    onPress={() => {
                                        setFormData({ ...formData, project_id: item.id })
                                        setSelectedProjectName(item.title)
                                        setShowProjectPicker(false)
                                    }}
                                >
                                    <View>
                                        <Text style={styles.clientName}>{item.title}</Text>
                                        {item.client?.full_name && (
                                            <Text style={styles.companyName}>{item.client.full_name}</Text>
                                        )}
                                    </View>
                                    {formData.project_id === item.id && (
                                        <Ionicons name="checkmark" size={20} color="#8B5CF6" />
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyListContainer}>
                                    <Text style={styles.emptyListText}>No projects available</Text>
                                </View>
                            }
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginTop: 8,
        marginBottom: 16,
    },
    itemRow: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemNumber: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    addItemButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#8B5CF6',
        borderRadius: 12,
        borderStyle: 'dashed',
        marginBottom: 24,
    },
    addItemText: {
        marginLeft: 8,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B5CF6',
    },
    textArea: {
        minHeight: 100,
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
    companyName: {
        fontSize: 14,
        color: '#6B7280',
    },
    emptyListContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyListText: {
        fontSize: 16,
        color: '#6B7280',
    },
})
