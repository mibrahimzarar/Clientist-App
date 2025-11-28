import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as ImagePicker from 'expo-image-picker'
import { useClient, useUpdateClient } from '../../../../../src/hooks/useTravelAgent'
import { uploadClientProfileImage } from '../../../../../src/api/travelAgent'
import { PackageType, LeadSource, ClientStatus, PriorityTag } from '../../../../../src/types/travelAgent'
import { BouncingBallsLoader } from '../../../../../src/components/ui/BouncingBallsLoader'

const packageOptions = [
    { value: 'umrah_package', label: 'Umrah Package', icon: 'airplane' },
    { value: 'tourist_visa', label: 'Tourist Visa', icon: 'document-text' },
    { value: 'ticketing', label: 'Ticketing', icon: 'ticket' },
    { value: 'visit_visa', label: 'Visit Visa', icon: 'briefcase' },
]

const leadSourceOptions = [
    { value: 'facebook', label: 'Facebook', icon: 'logo-facebook' },
    { value: 'referral', label: 'Referral', icon: 'people' },
    { value: 'walk_in', label: 'Walk-in', icon: 'walk' },
    { value: 'website', label: 'Website', icon: 'globe' },
]

const priorityOptions = [
    { value: 'normal', label: 'Normal', icon: 'flag-outline', color: '#10B981' },
    { value: 'priority', label: 'Priority', icon: 'flag', color: '#F59E0B' },
    { value: 'urgent', label: 'Urgent', icon: 'warning', color: '#EF4444' },
    { value: 'vip', label: 'VIP', icon: 'star', color: '#8B5CF6' },
]

const statusOptions = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
]

export default function EditClient() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { data: clientData, isLoading } = useClient(id!)
    const updateClient = useUpdateClient()

    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        country: '',
        package_type: 'umrah_package' as PackageType,
        lead_source: 'walk_in' as LeadSource,
        status: 'in_progress' as ClientStatus,
        priority_tag: 'normal' as PriorityTag,
        notes: '',
    })
    const [profileImage, setProfileImage] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    useEffect(() => {
        if (clientData?.data) {
            const client = clientData.data
            setFormData({
                full_name: client.full_name || '',
                phone_number: client.phone_number || '',
                email: client.email || '',
                country: client.country || '',
                package_type: client.package_type || 'umrah_package',
                lead_source: client.lead_source || 'walk_in',
                status: client.status || 'in_progress',
                priority_tag: client.priority_tag || 'normal',
                notes: client.notes || '',
            })
            if (client.profile_picture_url) {
                setProfileImage(client.profile_picture_url)
            }
        }
    }, [clientData])

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.')
            return
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri)
        }
    }

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync()
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant camera permissions to take a photo.')
            return
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })

        if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri)
        }
    }

    const handleSubmit = async () => {
        if (!formData.full_name.trim() || !formData.phone_number.trim() || !formData.country.trim()) {
            Alert.alert('Required Fields', 'Please fill in all required fields (Name, Phone, Country)')
            return
        }

        try {
            await updateClient.mutateAsync({ id: id!, data: formData })

            // Upload new profile image if changed and it's a local URI
            if (profileImage && profileImage.startsWith('file://')) {
                setUploadingImage(true)
                const fileName = profileImage.split('/').pop() || 'profile.jpg'
                await uploadClientProfileImage(id!, profileImage, fileName)
            }

            Alert.alert('Success', 'Client updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ])
        } catch (error) {
            Alert.alert('Error', 'Failed to update client. Please try again.')
        } finally {
            setUploadingImage(false)
        }
    }

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#4F46E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
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
                <View style={{ width: 40 }} />
            </LinearGradient>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
                {/* Profile Image Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="image" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Profile Picture</Text>
                    </View>

                    <View style={styles.imageSection}>
                        {profileImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image source={{ uri: profileImage }} style={styles.imagePreview} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setProfileImage(null)}
                                >
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="person-circle-outline" size={80} color="#D1D5DB" />
                                <Text style={styles.imagePlaceholderText}>No image selected</Text>
                            </View>
                        )}

                        <View style={styles.imageButtons}>
                            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                                <LinearGradient
                                    colors={['#4F46E5', '#7C3AED']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.imageButtonGradient}
                                >
                                    <Ionicons name="images" size={20} color="#fff" />
                                    <Text style={styles.imageButtonText}>Gallery</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                                <LinearGradient
                                    colors={['#10B981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.imageButtonGradient}
                                >
                                    <Ionicons name="camera" size={20} color="#fff" />
                                    <Text style={styles.imageButtonText}>Camera</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Basic Information Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person-circle" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Basic Information</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Full Name <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.full_name}
                                onChangeText={(text) => setFormData({ ...formData, full_name: text })}
                                placeholder="Enter client's full name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Phone Number <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.phone_number}
                                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                                placeholder="+1 234 567 8900"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.email}
                                onChangeText={(text) => setFormData({ ...formData, email: text })}
                                placeholder="client@example.com"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>
                            Country <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={formData.country}
                                onChangeText={(text) => setFormData({ ...formData, country: text })}
                                placeholder="Enter country"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>
                </View>

                {/* Status Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Status</Text>
                    </View>

                    <View style={styles.optionsGrid}>
                        {statusOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    formData.status === option.value && styles.optionCardActive
                                ]}
                                onPress={() => setFormData({ ...formData, status: option.value as ClientStatus })}
                            >
                                {formData.status === option.value && (
                                    <LinearGradient
                                        colors={['#4F46E5', '#7C3AED']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.optionGradient}
                                    />
                                )}
                                <Text style={[
                                    styles.optionText,
                                    formData.status === option.value && styles.optionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Package Type Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="cube" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Package Type</Text>
                    </View>

                    <View style={styles.optionsGrid}>
                        {packageOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    formData.package_type === option.value && styles.optionCardActive
                                ]}
                                onPress={() => setFormData({ ...formData, package_type: option.value as PackageType })}
                            >
                                {formData.package_type === option.value && (
                                    <LinearGradient
                                        colors={['#4F46E5', '#7C3AED']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.optionGradient}
                                    />
                                )}
                                <Ionicons
                                    name={option.icon as any}
                                    size={24}
                                    color={formData.package_type === option.value ? '#fff' : '#6B7280'}
                                    style={styles.optionIcon}
                                />
                                <Text style={[
                                    styles.optionText,
                                    formData.package_type === option.value && styles.optionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Lead Source Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="trending-up" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Lead Source</Text>
                    </View>

                    <View style={styles.optionsGrid}>
                        {leadSourceOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.optionCard,
                                    formData.lead_source === option.value && styles.optionCardActive
                                ]}
                                onPress={() => setFormData({ ...formData, lead_source: option.value as LeadSource })}
                            >
                                {formData.lead_source === option.value && (
                                    <LinearGradient
                                        colors={['#10B981', '#059669']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.optionGradient}
                                    />
                                )}
                                <Ionicons
                                    name={option.icon as any}
                                    size={24}
                                    color={formData.lead_source === option.value ? '#fff' : '#6B7280'}
                                    style={styles.optionIcon}
                                />
                                <Text style={[
                                    styles.optionText,
                                    formData.lead_source === option.value && styles.optionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Priority Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="flag" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Priority Level</Text>
                    </View>

                    <View style={styles.priorityOptions}>
                        {priorityOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.priorityChip,
                                    formData.priority_tag === option.value && { backgroundColor: option.color }
                                ]}
                                onPress={() => setFormData({ ...formData, priority_tag: option.value as PriorityTag })}
                            >
                                <Ionicons
                                    name={option.icon as any}
                                    size={16}
                                    color={formData.priority_tag === option.value ? '#fff' : '#6B7280'}
                                />
                                <Text style={[
                                    styles.priorityText,
                                    formData.priority_tag === option.value && styles.priorityTextActive
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Notes Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="document-text" size={24} color="#4F46E5" />
                        <Text style={styles.cardTitle}>Additional Notes</Text>
                    </View>

                    <TextInput
                        style={styles.textArea}
                        value={formData.notes}
                        onChangeText={(text) => setFormData({ ...formData, notes: text })}
                        placeholder="Add any additional notes about this client..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Submit Button */}
            <View style={styles.submitContainer}>
                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={updateClient.isPending || uploadingImage}
                >
                    <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitGradient}
                    >
                        {updateClient.isPending || uploadingImage ? (
                            <BouncingBallsLoader color="#fff" size={8} />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                                <Text style={styles.submitText}>Save Changes</Text>
                            </>
                        )}
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
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
    scrollView: {
        flex: 1,
    },
    formContainer: {
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginLeft: 12,
    },
    imageSection: {
        alignItems: 'center',
    },
    imagePreviewContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#F3F4F6',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        paddingVertical: 20,
    },
    imagePlaceholderText: {
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 8,
    },
    imageButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    imageButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    imageButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: '#111827',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    optionCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        position: 'relative',
        overflow: 'hidden',
    },
    optionCardActive: {
        borderColor: 'transparent',
    },
    optionGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    optionIcon: {
        marginBottom: 8,
    },
    optionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
        textAlign: 'center',
    },
    optionTextActive: {
        color: '#fff',
    },
    priorityOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priorityChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 6,
    },
    priorityText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6B7280',
    },
    priorityTextActive: {
        color: '#fff',
    },
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        minHeight: 100,
    },
    submitContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    submitGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
})
