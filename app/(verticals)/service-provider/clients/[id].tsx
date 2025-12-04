import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Image } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPClient } from '../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'

export default function ClientDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: clientData, isLoading } = useSPClient(id)

    const client = clientData?.data

    const handleCall = () => {
        if (client?.phone_number) {
            Linking.openURL(`tel:${client.phone_number}`)
        }
    }

    const handleWhatsApp = () => {
        if (client?.whatsapp) {
            Linking.openURL(`whatsapp://send?phone=${client.whatsapp}`)
        }
    }

    const handleEmail = () => {
        if (client?.email) {
            Linking.openURL(`mailto:${client.email}`)
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#3B82F6" />
            </View>
        )
    }

    if (!client) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Client not found</Text>
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
                    <Text style={styles.headerTitle}>Client Details</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push(`/(verticals)/service-provider/clients/${id}/edit`)}
                    style={styles.editButton}
                >
                    <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Client Info Card */}
                <View style={styles.card}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            {client.profile_picture_url ? (
                                <Image source={{ uri: client.profile_picture_url }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {client.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </Text>
                            )}
                        </View>
                        {client.is_vip && (
                            <View style={styles.vipBadge}>
                                <Ionicons name="star" size={16} color="#F59E0B" />
                                <Text style={styles.vipText}>VIP</Text>
                            </View>
                        )}
                    </View>

                    <Text style={styles.clientName}>{client.full_name}</Text>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{client.status}</Text>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        {client.phone_number && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                                <Ionicons name="call" size={20} color="#3B82F6" />
                                <Text style={styles.actionText}>Call</Text>
                            </TouchableOpacity>
                        )}
                        {client.whatsapp && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                                <Ionicons name="logo-whatsapp" size={20} color="#10B981" />
                                <Text style={styles.actionText}>WhatsApp</Text>
                            </TouchableOpacity>
                        )}
                        {client.email && (
                            <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                                <Ionicons name="mail" size={20} color="#EF4444" />
                                <Text style={styles.actionText}>Email</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Stats Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{client.total_jobs_completed}</Text>
                            <Text style={styles.statLabel}>Jobs Completed</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>₨{client.total_spent.toLocaleString()}</Text>
                            <Text style={styles.statLabel}>Total Spent</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, client.outstanding_balance > 0 && styles.statValueRed]}>
                                ₨{client.outstanding_balance.toLocaleString()}
                            </Text>
                            <Text style={styles.statLabel}>Outstanding</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Contact Information</Text>
                    {client.phone_number && (
                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>{client.phone_number}</Text>
                        </View>
                    )}
                    {client.whatsapp && (
                        <View style={styles.infoRow}>
                            <Ionicons name="logo-whatsapp" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>{client.whatsapp}</Text>
                        </View>
                    )}
                    {client.email && (
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>{client.email}</Text>
                        </View>
                    )}
                    {client.address && (
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#6B7280" />
                            <Text style={styles.infoText}>{client.address}</Text>
                        </View>
                    )}
                </View>

                {/* Notes */}
                {client.notes && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Notes</Text>
                        <Text style={styles.notesText}>{client.notes}</Text>
                    </View>
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
    editButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    card: {
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
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    avatarImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    vipBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    vipText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F59E0B',
    },
    clientName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        alignSelf: 'center',
        backgroundColor: '#DBEAFE',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3B82F6',
        textTransform: 'capitalize',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statItem: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    statValueRed: {
        color: '#EF4444',
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    infoText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    notesText: {
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
})
