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
    ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../../../../src/lib/supabase'
import { useCreateSPClient } from '../../../../src/hooks/useServiceProvider'
import { SPClient } from '../../../../src/types/serviceProvider'

export default function NewClientPage() {
    const createClientMutation = useCreateSPClient()
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        whatsapp: '',
        email: '',
        address: '',
        notes: '',
        is_vip: false,
        profile_picture_url: '',
    })

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            })

            if (!result.canceled) {
                await uploadImage(result.assets[0].uri)
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image')
        }
    }

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const arrayBuffer = await fetch(uri).then(res => res.arrayBuffer())
            const fileName = `${user.id}/client_${Date.now()}.png`

            const { error } = await supabase.storage
                .from('avatars')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/png',
                    upsert: true
                })

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            setFormData(prev => ({ ...prev, profile_picture_url: publicUrl }))
        } catch (error) {
            Alert.alert('Error', 'Failed to upload image')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async () => {
        if (!formData.full_name.trim()) {
            Alert.alert('Error', 'Please enter client name')
            return
        }

        if (!formData.phone_number.trim()) {
            Alert.alert('Error', 'Please enter phone number')
            return
        }

        const result = await createClientMutation.mutateAsync(formData as Partial<SPClient>)

        if (result.data) {
            Alert.alert('Success', 'Client created successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ])
        } else {
            Alert.alert('Error', 'Failed to create client')
        }
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
                    <Text style={styles.headerTitle}>New Client</Text>
                    <Text style={styles.headerSubtitle}>Add client information</Text>
                </View>
                <View style={styles.placeholder} />
            </LinearGradient>

            {/* Form */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                <View style={styles.section}>
                    <View style={styles.imageSection}>
                        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                            {formData.profile_picture_url ? (
                                <Image source={{ uri: formData.profile_picture_url }} style={styles.profileImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="person-add" size={32} color="#9CA3AF" />
                                </View>
                            )}
                            <View style={styles.editIconContainer}>
                                <Ionicons name="camera" size={16} color="#fff" />
                            </View>
                            {uploading && (
                                <View style={styles.uploadingOverlay}>
                                    <ActivityIndicator color="#fff" />
                                </View>
                            )}
                        </TouchableOpacity>
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.formGroup}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter client name"
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
                            placeholder="Add any notes about the client"
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
                            <Text style={styles.vipToggleText}>Mark as VIP Client</Text>
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
                    disabled={createClientMutation.isPending}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        <Text style={styles.submitText}>
                            {createClientMutation.isPending ? 'Creating...' : 'Create Client'}
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
    placeholder: {
        width: 40,
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
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3B82F6',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F9FAFB',
    },
    addPhotoText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
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
