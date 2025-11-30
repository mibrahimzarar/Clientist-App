import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPJob, useUpdateSPJob, useDeleteSPJob } from '../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { SPJobStatus } from '../../../../src/types/serviceProvider'

export default function JobDetailsPage() {
    const { id } = useLocalSearchParams()
    const jobId = id as string

    const { data: jobData, isLoading } = useSPJob(jobId)
    const updateJobMutation = useUpdateSPJob()
    const deleteJobMutation = useDeleteSPJob()

    const job = jobData?.data

    const handleStatusChange = async (newStatus: SPJobStatus) => {
        if (!job) return

        await updateJobMutation.mutateAsync({
            id: job.id,
            updates: { status: newStatus },
        })

        Alert.alert('Success', 'Job status updated')
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Job',
            'Are you sure you want to delete this job? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteJobMutation.mutateAsync(jobId)
                        router.back()
                    },
                },
            ]
        )
    }

    const handleCall = () => {
        if (job?.client?.phone_number) {
            Linking.openURL(`tel:${job.client.phone_number}`)
        }
    }

    const handleWhatsApp = () => {
        if (job?.client?.whatsapp || job?.client?.phone_number) {
            const number = job.client.whatsapp || job.client.phone_number
            Linking.openURL(`https://wa.me/${number}`)
        }
    }

    const getStatusColor = (status: SPJobStatus) => {
        switch (status) {
            case 'in_progress': return '#F59E0B'
            case 'completed': return '#10B981'
            case 'pending_payment': return '#EF4444'
            case 'cancelled': return '#6B7280'
            default: return '#6B7280'
        }
    }

    const getStatusIcon = (status: SPJobStatus) => {
        switch (status) {
            case 'in_progress': return 'construct'
            case 'completed': return 'checkmark-circle'
            case 'pending_payment': return 'card'
            case 'cancelled': return 'close-circle'
            default: return 'ellipse'
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
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
                <Text style={styles.errorText}>Job not found</Text>
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
                        <Text style={styles.headerTitle} numberOfLines={1}>
                            {job.title}
                        </Text>
                        <Text style={styles.headerSubtitle}>Job Details</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            onPress={() => router.push(`/(verticals)/service-provider/jobs/${jobId}/edit` as any)} 
                            style={styles.editButton}
                        >
                            <Ionicons name="create-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                            <Ionicons name="trash-outline" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {/* Status Card */}
                <View style={styles.card}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                        <Ionicons name={getStatusIcon(job.status)} size={16} color="#fff" />
                        <Text style={styles.statusBadgeText}>{job.status.replace('_', ' ')}</Text>
                    </View>

                    {job.is_urgent && (
                        <View style={styles.urgentBanner}>
                            <Ionicons name="alert-circle" size={20} color="#EF4444" />
                            <Text style={styles.urgentBannerText}>Urgent Job</Text>
                        </View>
                    )}

                    <Text style={styles.jobTitle}>{job.title}</Text>
                    {job.description && (
                        <Text style={styles.jobDescription}>{job.description}</Text>
                    )}
                </View>

                {/* Client Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Client Information</Text>
                    <View style={styles.clientInfo}>
                        <View style={styles.clientAvatar}>
                            <Text style={styles.clientAvatarText}>
                                {job.client?.full_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.clientDetails}>
                            <Text style={styles.clientName}>{job.client?.full_name}</Text>
                            {job.client?.phone_number && (
                                <Text style={styles.clientContact}>{job.client.phone_number}</Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.actionButtonGradient}
                            >
                                <Ionicons name="call" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>Call</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
                            <LinearGradient
                                colors={['#22C55E', '#16A34A']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.actionButtonGradient}
                            >
                                <Ionicons name="logo-whatsapp" size={20} color="#fff" />
                                <Text style={styles.actionButtonText}>WhatsApp</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Job Details */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Job Details</Text>

                    {job.category && (
                        <View style={styles.detailRow}>
                            <Ionicons name="pricetag" size={20} color="#8B5CF6" />
                            <Text style={styles.detailLabel}>Category</Text>
                            <Text style={styles.detailValue}>{job.category.name}</Text>
                        </View>
                    )}

                    {job.scheduled_date && (
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar" size={20} color="#3B82F6" />
                            <Text style={styles.detailLabel}>Scheduled Date</Text>
                            <Text style={styles.detailValue}>
                                {new Date(job.scheduled_date).toLocaleDateString()}
                            </Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Ionicons name="flag" size={20} color="#F59E0B" />
                        <Text style={styles.detailLabel}>Priority</Text>
                        <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>
                            {job.priority}
                        </Text>
                    </View>

                    {job.location_address && (
                        <View style={styles.detailRow}>
                            <Ionicons name="location" size={20} color="#EF4444" />
                            <Text style={styles.detailLabel}>Location</Text>
                            <Text style={[styles.detailValue, { flex: 1 }]}>
                                {job.location_address}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Pricing */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Pricing Breakdown</Text>

                    {job.parts_cost > 0 && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Parts Cost</Text>
                            <Text style={styles.priceValue}>₨{job.parts_cost.toLocaleString()}</Text>
                        </View>
                    )}

                    {job.labor_cost > 0 && (
                        <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Labor Cost</Text>
                            <Text style={styles.priceValue}>₨{job.labor_cost.toLocaleString()}</Text>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.priceRow}>
                        <Text style={styles.priceTotalLabel}>Total Cost</Text>
                        <Text style={styles.priceTotalValue}>
                            ₨{job.total_cost?.toLocaleString() || '0'}
                        </Text>
                    </View>
                </View>

                {/* Change Status */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Change Status</Text>
                    <View style={styles.statusButtons}>
                        {(['in_progress', 'completed', 'pending_payment', 'cancelled'] as SPJobStatus[]).map((status) => (
                            <TouchableOpacity
                                key={status}
                                style={[
                                    styles.statusButton,
                                    job.status === status && { backgroundColor: getStatusColor(status) }
                                ]}
                                onPress={() => handleStatusChange(status)}
                                disabled={job.status === status}
                            >
                                <Ionicons
                                    name={getStatusIcon(status)}
                                    size={16}
                                    color={job.status === status ? '#fff' : getStatusColor(status)}
                                />
                                <Text style={[
                                    styles.statusButtonText,
                                    job.status === status && { color: '#fff' }
                                ]}>
                                    {status.replace('_', ' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Timestamps */}
                <View style={styles.timestampContainer}>
                    <Text style={styles.timestamp}>
                        Created: {new Date(job.created_at).toLocaleString()}
                    </Text>
                    <Text style={styles.timestamp}>
                        Updated: {new Date(job.updated_at).toLocaleString()}
                    </Text>
                </View>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 40,
    },
    errorText: {
        fontSize: 18,
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 24,
    },
    backButtonError: {
        backgroundColor: '#3B82F6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        flex: 1,
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    editButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 10,
    },
    deleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderRadius: 12,
        padding: 10,
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
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        marginBottom: 12,
        gap: 6,
    },
    statusBadgeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    urgentBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    urgentBannerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    },
    jobTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    jobDescription: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    clientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    clientAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    clientAvatarText: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    clientDetails: {
        flex: 1,
    },
    clientName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    clientContact: {
        fontSize: 14,
        color: '#6B7280',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#6B7280',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    priceLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 12,
    },
    priceTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    priceTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#10B981',
    },
    statusButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 6,
    },
    statusButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    timestampContainer: {
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#9CA3AF',
        marginVertical: 2,
    },
})
