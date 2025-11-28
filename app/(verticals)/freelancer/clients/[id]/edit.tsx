import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { useFreelancerClient, useUpdateClient } from '../../../../../src/hooks/useFreelancer'
import { FreelancerClientStatus } from '../../../../../src/types/freelancer'
import { freelancerService } from '../../../../../src/services/freelancerService'

export default function EditClientPage() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: clientData, isLoading: isLoadingClient } = useFreelancerClient(id)
    const updateClientMutation = useUpdateClient()

    const [formData, setFormData] = useState({
        full_name: '',
        company_name: '',
        role: '',
        email: '',
        phone_number: '',
        country: '',
        status: 'active' as FreelancerClientStatus,
        tags: '',
        notes: '',
        profile_picture_url: '',
    })
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (clientData?.data) {
            setFormData({
                full_name: clientData.data.full_name || '',
                company_name: clientData.data.company_name || '',
                role: clientData.data.role || '',
                email: clientData.data.email || '',
                phone_number: clientData.data.phone_number || '',
                country: clientData.data.country || '',
                status: clientData.data.status || 'active',
                tags: clientData.data.tags ? clientData.data.tags.join(', ') : '',
                notes: clientData.data.notes || '',
                profile_picture_url: clientData.data.profile_picture_url || '',
            })
        }
    }, [clientData])

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled) {
                setUploading(true)
                try {
                    const publicUrl = await freelancerService.uploadImage(result.assets[0].uri, 'avatars')
                    setFormData({ ...formData, profile_picture_url: publicUrl })
                } catch (error) {
                    Alert.alert('Error', 'Failed to upload image')
                } finally {
                    setUploading(false)
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image')
        }
    }

    const handleSubmit = async () => {
        if (!formData.full_name) {
            Alert.alert('Error', 'Full Name is required')
            return
        }

        try {
            await updateClientMutation.mutateAsync({
                id,
                updates: {
                    ...formData,
                    tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                }
            })
            Alert.alert('Success', 'Client updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to update client')
            console.error(error)
        }
    }

    if (isLoadingClient) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        )
    }

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
                    <Text style={styles.headerTitle}>Edit Client</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    {/* Image Picker */}
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                            {formData.profile_picture_url ? (
                                <Image source={{ uri: formData.profile_picture_url }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                                    <Text style={styles.placeholderText}>Add Photo</Text>
                                </View>
                            )}
                            {uploading && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.full_name}
                            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                            placeholder="e.g. John Doe"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Company Name</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.company_name}
                            onChangeText={(text) => setFormData({ ...formData, company_name: text })}
                            placeholder="e.g. Acme Corp"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Role</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.role}
                            onChangeText={(text) => setFormData({ ...formData, role: text })}
                            placeholder="e.g. CEO"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.email}
                            onChangeText={(text) => setFormData({ ...formData, email: text })}
                            placeholder="e.g. john@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.phone_number}
                            onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                            placeholder="e.g. +1 234 567 890"
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Country</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.country}
                            onChangeText={(text) => setFormData({ ...formData, country: text })}
                            placeholder="e.g. USA"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusContainer}>
                            {(['active', 'inactive', 'lead', 'archived'] as FreelancerClientStatus[]).map((status) => (
                                <TouchableOpacity
                                    key={status}
                                    style={[
                                        styles.statusChip,
                                        formData.status === status && styles.statusChipActive
                                    ]}
                                    onPress={() => setFormData({ ...formData, status })}
                                >
                                    <Text style={[
                                        styles.statusText,
                                        formData.status === status && styles.statusTextActive
                                    ]}>
                                        {status}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tags (comma separated)</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.tags}
                            onChangeText={(text) => setFormData({ ...formData, tags: text })}
                            placeholder="e.g. VIP, Referral"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.notes}
                            onChangeText={(text) => setFormData({ ...formData, notes: text })}
                            placeholder="Add notes..."
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateClientMutation.isPending || uploading}
                >
                    {updateClientMutation.isPending ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>Update Client</Text>
                    )}
                </TouchableOpacity>
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
        justifyContent: 'center',
        alignItems: 'center',
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
    imageContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    imagePicker: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputGroup: {
        marginBottom: 16,
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
    textArea: {
        minHeight: 100,
    },
    statusContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    statusChipActive: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    statusText: {
        fontSize: 14,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    statusTextActive: {
        color: '#fff',
        fontWeight: '600',
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
})
