import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPClients, useDeleteSPClient } from '../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { SPClient } from '../../../../src/types/serviceProvider'

export default function ClientsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const { data: clientsData, isLoading, refetch } = useSPClients()
    const deleteClientMutation = useDeleteSPClient()

    const clients = clientsData?.data || []

    const filteredClients = clients.filter(client =>
        client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDeleteClient = (client: SPClient) => {
        Alert.alert(
            'Delete Client',
            `Are you sure you want to delete ${client.full_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const result = await deleteClientMutation.mutateAsync(client.id)
                        if (!result.error) {
                            Alert.alert('Success', 'Client deleted successfully')
                        }
                    },
                },
            ]
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10B981'
            case 'inactive': return '#6B7280'
            case 'blocked': return '#EF4444'
            default: return '#6B7280'
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#3B82F6" />
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
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Clients</Text>
                        <Text style={styles.headerSubtitle}>{filteredClients.length} clients</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/(verticals)/service-provider/clients/new')}
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
                            placeholder="Search clients..."
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

            {/* Clients List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {filteredClients.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No clients found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try adjusting your search' : 'Add your first client to get started'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/(verticals)/service-provider/clients/new')}
                            >
                                <LinearGradient
                                    colors={['#3B82F6', '#2563EB']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.emptyButtonGradient}
                                >
                                    <Ionicons name="person-add" size={20} color="#fff" />
                                    <Text style={styles.emptyButtonText}>Add Client</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    filteredClients.map((client) => (
                        <TouchableOpacity
                            key={client.id}
                            style={styles.clientCard}
                            onPress={() => router.push(`/(verticals)/service-provider/clients/${client.id}`)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.clientAvatar}>
                                {client.profile_picture_url ? (
                                    <Image source={{ uri: client.profile_picture_url }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.clientInitials}>
                                        {client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </Text>
                                )}
                            </View>

                            <View style={styles.clientContent}>
                                <View style={styles.clientHeader}>
                                    <Text style={styles.clientName}>{client.full_name}</Text>
                                    {client.is_vip && (
                                        <View style={styles.vipBadge}>
                                            <Ionicons name="star" size={12} color="#F59E0B" />
                                            <Text style={styles.vipText}>VIP</Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.clientMeta}>
                                    {client.phone_number && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="call-outline" size={14} color="#6B7280" />
                                            <Text style={styles.metaText}>{client.phone_number}</Text>
                                        </View>
                                    )}
                                    <View style={styles.metaItem}>
                                        <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
                                        <Text style={styles.metaText}>{client.total_jobs_completed} jobs</Text>
                                    </View>
                                </View>

                                <View style={styles.clientFooter}>
                                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(client.status)}20` }]}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(client.status) }]} />
                                        <Text style={[styles.statusText, { color: getStatusColor(client.status) }]}>
                                            {client.status}
                                        </Text>
                                    </View>
                                    {client.outstanding_balance > 0 && (
                                        <Text style={styles.balanceText}>
                                            Outstanding: ₨{client.outstanding_balance.toLocaleString()}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.moreButton}
                                onPress={() => handleDeleteClient(client)}
                            >
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
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
        shadowColor: '#3B82F6',
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
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    clientCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    clientAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    avatarImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    clientInitials: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    clientContent: {
        flex: 1,
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    vipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        gap: 2,
    },
    vipText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#F59E0B',
    },
    clientMeta: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    clientFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    balanceText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },
    moreButton: {
        padding: 8,
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
        shadowColor: '#3B82F6',
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
