import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPInvoices } from '../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { SPInvoice, SPInvoiceStatus } from '../../../../src/types/serviceProvider'

export default function InvoicesPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<SPInvoiceStatus | 'all'>('all')
    const { data: invoicesData, isLoading } = useSPInvoices()

    const invoices = invoicesData?.data || []

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: SPInvoiceStatus) => {
        switch (status) {
            case 'unpaid': return '#F59E0B'
            case 'paid': return '#10B981'
            case 'partially_paid': return '#3B82F6'
            case 'overdue': return '#EF4444'
            case 'cancelled': return '#6B7280'
            default: return '#6B7280'
        }
    }

    const getStatusIcon = (status: SPInvoiceStatus) => {
        switch (status) {
            case 'unpaid': return 'time'
            case 'paid': return 'checkmark-circle'
            case 'partially_paid': return 'pie-chart'
            case 'overdue': return 'alert-circle'
            case 'cancelled': return 'close-circle'
            default: return 'ellipse'
        }
    }

    const statusFilters: { label: string; value: SPInvoiceStatus | 'all' }[] = [
        { label: 'All', value: 'all' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
        { label: 'Partially Paid', value: 'partially_paid' },
        { label: 'Overdue', value: 'overdue' },
    ]

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#10B981" />
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
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Invoices</Text>
                        <Text style={styles.headerSubtitle}>{filteredInvoices.length} invoices</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(verticals)/service-provider/invoices/new')}
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
                            placeholder="Search invoices..."
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
            </LinearGradient>

            {/* Status Filters */}
            <View style={styles.filtersSection}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filtersContainer}
                >
                    {statusFilters.map((filter) => {
                        const count = filter.value === 'all' 
                            ? invoices.length 
                            : invoices.filter(inv => inv.status === filter.value).length
                        
                        return (
                            <TouchableOpacity
                                key={filter.value}
                                style={[
                                    styles.filterChip,
                                    filterStatus === filter.value && styles.filterChipActive
                                ]}
                                onPress={() => setFilterStatus(filter.value)}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    filterStatus === filter.value && styles.filterChipTextActive
                                ]}>
                                    {filter.label}
                                </Text>
                                {count > 0 && (
                                    <View style={[
                                        styles.filterBadge,
                                        filterStatus === filter.value && styles.filterBadgeActive
                                    ]}>
                                        <Text style={[
                                            styles.filterBadgeText,
                                            filterStatus === filter.value && styles.filterBadgeTextActive
                                        ]}>
                                            {count}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            {/* Invoices List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredInvoices.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No invoices found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try adjusting your search' : 'Create your first invoice to get started'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/(verticals)/service-provider/invoices/new')}
                            >
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.emptyButtonGradient}
                                >
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={styles.emptyButtonText}>Create Invoice</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredInvoices.map((invoice) => (
                        <TouchableOpacity
                            key={invoice.id}
                            style={styles.invoiceCard}
                            onPress={() => router.push(`/(verticals)/service-provider/invoices/${invoice.id}` as any)}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={[getStatusColor(invoice.status), getStatusColor(invoice.status) + 'CC']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={styles.invoiceStatusBar}
                            />
                            
                            <View style={styles.invoiceContent}>
                                <View style={styles.invoiceHeader}>
                                    <View style={styles.invoiceTitleRow}>
                                        <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
                                        <View style={[styles.statusChip, { backgroundColor: getStatusColor(invoice.status) + '20' }]}>
                                            <Ionicons name={getStatusIcon(invoice.status)} size={14} color={getStatusColor(invoice.status)} />
                                            <Text style={[styles.statusChipText, { color: getStatusColor(invoice.status) }]}>
                                                {invoice.status.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.invoiceClient} numberOfLines={1}>
                                        <Ionicons name="person-outline" size={14} color="#6B7280" />
                                        {' '}{invoice.client?.full_name}
                                    </Text>
                                </View>

                                <View style={styles.invoiceMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>
                                            {new Date(invoice.invoice_date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    
                                    {invoice.due_date && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="time-outline" size={14} color="#6B7280" />
                                            <Text style={styles.metaText}>
                                                Due: {new Date(invoice.due_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.invoiceAmount}>
                                    <View>
                                        <Text style={styles.amountLabel}>Total Amount</Text>
                                        <Text style={styles.amountValue}>₨{invoice.total_amount.toLocaleString()}</Text>
                                    </View>
                                    {invoice.amount_paid > 0 && (
                                        <View style={styles.paidBadge}>
                                            <Text style={styles.paidBadgeText}>
                                                Paid: ₨{invoice.amount_paid.toLocaleString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" style={styles.chevron} />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
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
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        shadowColor: '#10B981',
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
        marginBottom: 8,
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
    filtersSection: {
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    filtersContainer: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterChipActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    filterChipText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B5563',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    filterBadge: {
        backgroundColor: '#E5E7EB',
        borderRadius: 10,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeActive: {
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    filterBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#374151',
    },
    filterBadgeTextActive: {
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    invoiceCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    invoiceStatusBar: {
        width: 5,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    invoiceContent: {
        flex: 1,
        padding: 16,
    },
    invoiceHeader: {
        marginBottom: 12,
    },
    invoiceTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    invoiceNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    statusChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    invoiceClient: {
        fontSize: 14,
        color: '#6B7280',
    },
    invoiceMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    invoiceAmount: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    amountLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
    },
    paidBadge: {
        backgroundColor: '#D1FAE5',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    paidBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#059669',
    },
    chevron: {
        marginLeft: 8,
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
        marginBottom: 24,
    },
    emptyButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        gap: 8,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})
