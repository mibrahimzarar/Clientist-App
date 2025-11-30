import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSPClient, useUpdateSPClient, useDeleteSPClient } from '../../../../../src/hooks/useServiceProvider'
import { BouncingBallsLoader } from '../../../../../src/components/ui/BouncingBallsLoader'

export default function EditClientPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: clientData, isLoading } = useSPClient(id)
    const updateClientMutation = useUpdateSPClient()
    const deleteClientMutation = useDeleteSPClient()

    const client = clientData?.data

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        whatsapp: '',
        email: '',
        address: '',
        notes: '',
        is_vip: false,
    })

    useEffect(() => {
        if (client) {
            setFormData({
                full_name: client.full_name || '',
                phone_number: client.phone_number || '',
                whatsapp: client.whatsapp || '',
                email: client.email || '',
                address: client.address || '',
                notes: client.notes || '',
                is_vip: client.is_vip || false,
            })
        }
    }, [client])

    const handleSubmit = async () => {
        if (!formData.full_name.trim()) {
            Alert.alert('Error', 'Please enter client name')
            return
        }

        if (!formData.phone_number.trim()) {
            Alert.alert('Error', 'Please enter phone number')
            return
        }

        const result = await updateClientMutation.mutateAsync({
            id,
            updates: formData,
        })

        if (result.data) {
            Alert.alert('Success', 'Client updated successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ])
        } else {
            Alert.alert('Error', 'Failed to update client')
        }
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Client',
            'Are you sure you want to delete this client? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteClientMutation.mutateAsync(id)
                        Alert.alert('Success', 'Client deleted successfully', [
                            {
                                text: 'OK',
                                onPress: () => router.push('/(verticals)/service-provider/clients'),
                            },
                        ])
                    },
                },
            ]
        )
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
                    <Text style={styles.headerTitle}>Edit Client</Text>
                    <Text style={styles.headerSubtitle}>Update client information</Text>
                </View>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Form */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client Information</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter full name"
                            value={formData.full_name}
                            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Phone Number <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter phone number"
                            value={formData.phone_number}
                            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>WhatsApp Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter WhatsApp number"
                            value={formData.whatsapp}
                            onChangeText={(text) => setFormData({ ...formData, whatsapp: text })}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email address"
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter address"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Additional notes"
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.vipToggle}
                        onPress={() => setFormData({ ...formData, is_vip: !formData.is_vip })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.vipToggleLeft}>
                            <Ionicons
                                name={formData.is_vip ? 'star' : 'star-outline'}
                                size={24}
                                color={formData.is_vip ? '#F59E0B' : '#6B7280'}
                            />
                            <Text style={styles.vipToggleText}>VIP Client</Text>
                        </View>
                        <View style={[styles.toggle, formData.is_vip && styles.toggleActive]}>
                            <View style={[styles.toggleThumb, formData.is_vip && styles.toggleThumbActive]} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateClientMutation.isPending}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {updateClientMutation.isPending ? 'Updating...' : 'Update Client'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
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
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
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
    vipToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    vipToggleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    vipToggleText: {
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
        backgroundColor: '#F59E0B',
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
})
