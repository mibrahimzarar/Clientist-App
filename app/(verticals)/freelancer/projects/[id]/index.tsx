import React from 'react'
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native'
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BouncingBallsLoader } from '../../../../../src/components/ui/BouncingBallsLoader'
import { useFreelancerProject, useDeleteProject, useFreelancerTasks, useFreelancerInvoices } from '../../../../../src/hooks/useFreelancer'
import { FreelancerProjectStatus } from '../../../../../src/types/freelancer'

export default function FreelancerProjectDetails() {
    const { id } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const { data: projectData, isLoading: isLoadingProject, isError } = useFreelancerProject(id as string)
    const { data: tasksData } = useFreelancerTasks()
    const { data: invoicesData, refetch: refetchInvoices } = useFreelancerInvoices()
    const deleteProjectMutation = useDeleteProject()

    // Refetch invoices when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            console.log('Screen focused, refetching invoices')
            refetchInvoices().then((result) => {
                console.log('Invoices refetched:', result)
            })
        }, [refetchInvoices])
    )

    const project = projectData?.data

    // Calculate progress
    const projectTasks = tasksData?.data?.filter(t => t.project_id === id) || []
    const completedTasks = projectTasks.filter(t => t.status === 'done').length
    const totalTasks = projectTasks.length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Filter invoices for this project
    const projectInvoices = invoicesData?.data?.filter((inv: any) => {
        const matches = inv.project_id === id
        console.log(`Invoice ${inv.id}: project_id=${inv.project_id}, matches=${matches}`)
        return matches
    }) || []
    const totalInvoiceAmount = projectInvoices.reduce((sum: number, inv: any) => sum + (inv.total_amount || 0), 0)
    console.log(`Project ID: ${id}, Found ${projectInvoices.length} invoices`)

    if (isLoadingProject) {
        return (
            <View style={[styles.container, styles.center]}>
                <BouncingBallsLoader size={12} color="#8B5CF6" />
            </View>
        )
    }

    if (isError || !project) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Project not found</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
                    <Text style={styles.retryButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        )
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Project',
            'Are you sure you want to delete this project? This will also delete all associated tasks and documents. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProjectMutation.mutateAsync(id as string)
                            router.back()
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete project')
                        }
                    }
                }
            ]
        )
    }

    const getStatusColor = (status: FreelancerProjectStatus): [string, string] => {
        switch (status) {
            case 'in_progress': return ['#8B5CF6', '#7C3AED']
            case 'pending_feedback': return ['#F59E0B', '#D97706']
            case 'completed': return ['#10B981', '#059669']
            case 'draft': return ['#9CA3AF', '#6B7280']
            default: return ['#6B7280', '#4B5563']
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Background */}
                <LinearGradient
                    colors={getStatusColor(project.status)}
                    style={[styles.headerBackground, { paddingTop: insets.top }]}
                >
                    <View style={styles.headerNav}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={styles.headerActions}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => router.push(`/(verticals)/freelancer/projects/${id}/edit` as any)}
                            >
                                <Ionicons name="pencil" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDelete}
                            >
                                <Ionicons name="trash-outline" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.projectHeader}>
                        <Text style={styles.projectTitle}>{project.title}</Text>
                        <Text style={styles.clientName}>{project.client?.full_name}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{project.status.replace('_', ' ')}</Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressHeader}>
                            <Text style={styles.progressLabel}>Project Progress</Text>
                            <Text style={styles.progressValue}>{progress}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressStats}>{completedTasks}/{totalTasks} tasks completed</Text>
                    </View>
                </LinearGradient>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push(`/(verticals)/freelancer/projects/${id}/tasks` as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
                            <Ionicons name="checkbox" size={24} color="#4F46E5" />
                        </View>
                        <Text style={styles.quickActionText}>Tasks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push(`/(verticals)/freelancer/projects/${id}/documents` as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#ECFDF5' }]}>
                            <Ionicons name="document-text" size={24} color="#10B981" />
                        </View>
                        <Text style={styles.quickActionText}>Files</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.quickActionButton}
                        onPress={() => router.push(`/(verticals)/freelancer/projects/${id}/timer` as any)}
                    >
                        <View style={[styles.quickActionIcon, { backgroundColor: '#FFFBEB' }]}>
                            <Ionicons name="time" size={24} color="#F59E0B" />
                        </View>
                        <Text style={styles.quickActionText}>Time</Text>
                    </TouchableOpacity>
                </View>

                {/* Project Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Type</Text>
                                <Text style={styles.infoValue}>{project.project_type}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Deadline</Text>
                                <Text style={styles.infoValue}>{project.deadline || 'No deadline'}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Ionicons name="flag-outline" size={20} color="#6B7280" />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>Priority</Text>
                                <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{project.priority}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Payments Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payments</Text>
                    
                    {projectInvoices.length > 0 ? (
                        <View style={styles.paymentsCard}>
                            {projectInvoices.map((invoice, index) => (
                                <View key={invoice.id}>
                                    <TouchableOpacity 
                                        style={styles.invoiceRow}
                                        onPress={() => router.push(`/(verticals)/freelancer/invoices/${invoice.id}` as any)}
                                    >
                                        <View style={styles.invoiceInfo}>
                                            <Text style={styles.invoiceNumber}>Invoice #{invoice.invoice_number}</Text>
                                            <View style={styles.invoiceMeta}>
                                                <Text style={styles.invoiceDate}>
                                                    Due: {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                                <View style={[styles.statusBadgeSmall, { 
                                                    backgroundColor: getInvoiceStatusColor(invoice.status).bg 
                                                }]}>
                                                    <Text style={[styles.statusTextSmall, { 
                                                        color: getInvoiceStatusColor(invoice.status).text 
                                                    }]}>
                                                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <Text style={styles.invoiceAmount}>
                                            {invoice.currency} {invoice.total_amount.toFixed(2)}
                                        </Text>
                                    </TouchableOpacity>
                                    {index < projectInvoices.length - 1 && <View style={styles.divider} />}
                                </View>
                            ))}
                            
                            {/* Total */}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Total</Text>
                                <Text style={styles.totalAmount}>
                                    {projectInvoices[0]?.currency || 'USD'} {totalInvoiceAmount.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyPaymentsCard}>
                            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No invoices for this project</Text>
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    )
}

const getInvoiceStatusColor = (status: string) => {
    switch (status) {
        case 'paid': return { bg: '#D1FAE5', text: '#059669' }
        case 'sent': return { bg: '#DBEAFE', text: '#2563EB' }
        case 'overdue': return { bg: '#FEE2E2', text: '#DC2626' }
        case 'draft': return { bg: '#F3F4F6', text: '#6B7280' }
        case 'cancelled': return { bg: '#F3F4F6', text: '#6B7280' }
        default: return { bg: '#F3F4F6', text: '#6B7280' }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBackground: {
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(239,68,68,0.3)',
        borderRadius: 12,
    },
    projectHeader: {
        paddingHorizontal: 24,
        marginTop: 10,
    },
    projectTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 12,
    },
    statusBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    progressContainer: {
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        padding: 16,
        borderRadius: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        color: '#fff',
        fontWeight: '600',
    },
    progressValue: {
        color: '#fff',
        fontWeight: '700',
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    progressStats: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 20,
        marginTop: -35,
    },
    quickActionButton: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        width: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4B5563',
    },
    section: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    paymentsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    invoiceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    invoiceInfo: {
        flex: 1,
    },
    invoiceNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    invoiceMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    invoiceDate: {
        fontSize: 12,
        color: '#6B7280',
    },
    invoiceAmount: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
        marginLeft: 12,
    },
    statusBadgeSmall: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusTextSmall: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '800',
        color: '#8B5CF6',
    },
    emptyPaymentsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 12,
        marginBottom: 16,
        fontWeight: '500',
    },
    addInvoiceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    addInvoiceText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    infoContent: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 8,
    },
    errorText: {
        fontSize: 18,
        color: '#6B7280',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
    }
})
