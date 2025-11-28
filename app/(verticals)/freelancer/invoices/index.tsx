import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    ScrollView
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useFreelancerInvoices } from '../../../../src/hooks/useFreelancer'
import { FreelancerInvoice, InvoiceStatus } from '../../../../src/types/freelancer'

export default function FreelancerInvoicesList() {
    const { data: invoicesData, isLoading, refetch, isRefetching } = useFreelancerInvoices()
    const invoices = invoicesData?.data || []
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all')

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.project?.title.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const getStatusColor = (status: InvoiceStatus) => {
        switch (status) {
            case 'paid': return '#10B981'
            case 'sent': return '#3B82F6'
            case 'overdue': return '#EF4444'
            case 'draft': return '#9CA3AF'
            case 'cancelled': return '#6B7280'
            default: return '#9CA3AF'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const renderInvoiceItem = ({ item }: { item: FreelancerInvoice }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(verticals)/freelancer/invoices/${item.id}`)}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.invoiceNumber}>#{item.invoice_number}</Text>
                    <Text style={styles.clientName}>{item.client?.full_name || 'Unknown Client'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.amount}>
                        {item.currency} {item.total_amount.toFixed(2)}
                    </Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Due Date</Text>
                    <Text style={[
                        styles.date,
                        item.status === 'overdue' && styles.overdueText
                    ]}>
                        {formatDate(item.due_date)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )

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
                    <Text style={styles.headerTitle}>Invoices</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(verticals)/freelancer/invoices/new')}
                    >
                        <Ionicons name="add" size={24} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search invoices..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {(['all', 'paid', 'sent', 'overdue', 'draft'] as const).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.filterChip,
                                    statusFilter === status && styles.filterChipActive
                                ]}
                                onPress={() => setStatusFilter(status)}
                            >
                                <Text style={[
                                    styles.filterChipText,
                                    statusFilter === status && styles.filterChipTextActive
                                ]}>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </LinearGradient>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
            ) : (
                <FlatList
                    data={filteredInvoices}
                    renderItem={renderInvoiceItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#8B5CF6" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No invoices found</Text>
                            <Text style={styles.emptySubtext}>Create your first invoice to get started</Text>
                        </View>
                    }
                />
            )}
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    addButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#fff',
    },
    filterChipText: {
        color: '#fff',
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#8B5CF6',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    invoiceNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    clientName: {
        fontSize: 14,
        color: '#6B7280',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        color: '#6B7280',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    date: {
        fontSize: 14,
        color: '#374151',
    },
    overdueText: {
        color: '#EF4444',
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#6B7280',
    },
})
