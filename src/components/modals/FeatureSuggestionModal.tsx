import React, { useState } from 'react'
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { supabase } from '../../lib/supabase'

interface FeatureSuggestionModalProps {
    visible: boolean
    onClose: () => void
}

const MAX_CHARS = 500

export function FeatureSuggestionModal({ visible, onClose }: FeatureSuggestionModalProps) {
    const [suggestion, setSuggestion] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!suggestion.trim()) {
            Alert.alert('Required', 'Please enter your feature suggestion')
            return
        }

        if (suggestion.length > MAX_CHARS) {
            Alert.alert('Too Long', `Please keep your suggestion under ${MAX_CHARS} characters`)
            return
        }

        setSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get user profile info
            const { data: profile } = await supabase
                .from('profiles')
                .select('company_name, email')
                .eq('id', user.id)
                .single()

            // Insert suggestion
            const { error } = await supabase
                .from('feature_suggestions')
                .insert({
                    user_id: user.id,
                    user_email: profile?.email || user.email || 'unknown@email.com',
                    user_name: profile?.company_name || 'Unknown User',
                    suggestion_text: suggestion.trim(),
                })

            if (error) throw error

            Alert.alert(
                'Success! 🎉',
                'Thank you for your suggestion! We\'ll review it and consider it for future updates.',
                [{
                    text: 'OK', onPress: () => {
                        setSuggestion('')
                        onClose()
                    }
                }]
            )
        } catch (error) {
            console.error('Submit suggestion error:', error)
            Alert.alert('Error', 'Failed to submit suggestion. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        if (suggestion.trim() && !submitting) {
            Alert.alert(
                'Discard Suggestion?',
                'Your suggestion will not be saved.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Discard', style: 'destructive', onPress: () => {
                            setSuggestion('')
                            onClose()
                        }
                    }
                ]
            )
        } else {
            setSuggestion('')
            onClose()
        }
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
            statusBarTranslucent
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                {/* Header */}
                                <View style={styles.header}>
                                    <View style={styles.headerIcon}>
                                        <Ionicons name="bulb" size={24} color="#F59E0B" />
                                    </View>
                                    <View style={styles.headerText}>
                                        <Text style={styles.title}>Suggest a Feature</Text>
                                        <Text style={styles.subtitle}>Help us improve the app</Text>
                                    </View>
                                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>

                                {/* Input */}
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Describe the feature you'd like to see..."
                                        placeholderTextColor="#9CA3AF"
                                        multiline
                                        maxLength={MAX_CHARS}
                                        value={suggestion}
                                        onChangeText={setSuggestion}
                                        autoFocus
                                    />
                                    <View style={styles.charCount}>
                                        <Text style={[
                                            styles.charCountText,
                                            suggestion.length > MAX_CHARS * 0.9 && styles.charCountWarning
                                        ]}>
                                            {suggestion.length}/{MAX_CHARS}
                                        </Text>
                                    </View>
                                </View>

                                {/* Tips */}
                                <View style={styles.tipsContainer}>
                                    <Text style={styles.tipsTitle}>💡 Tips for a great suggestion:</Text>
                                    <Text style={styles.tipText}>• Be specific about what you want</Text>
                                    <Text style={styles.tipText}>• Explain how it would help you</Text>
                                    <Text style={styles.tipText}>• Keep it concise and clear</Text>
                                </View>

                                {/* Submit Button */}
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmit}
                                    disabled={submitting || !suggestion.trim()}
                                >
                                    <LinearGradient
                                        colors={
                                            submitting || !suggestion.trim()
                                                ? ['#E5E7EB', '#D1D5DB']
                                                : ['#8B5CF6', '#7C3AED']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.submitGradient}
                                    >
                                        <Ionicons
                                            name={submitting ? "hourglass" : "send"}
                                            size={20}
                                            color="#fff"
                                        />
                                        <Text style={styles.submitText}>
                                            {submitting ? 'Submitting...' : 'Submit Suggestion'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    keyboardView: {
        width: '100%',
        maxWidth: 500,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    closeButton: {
        padding: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: '#111827',
        minHeight: 150,
        maxHeight: 250,
        textAlignVertical: 'top',
    },
    charCount: {
        alignItems: 'flex-end',
        marginTop: 8,
    },
    charCountText: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '500',
    },
    charCountWarning: {
        color: '#F59E0B',
    },
    tipsContainer: {
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    tipsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
        marginBottom: 8,
    },
    tipText: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 4,
        lineHeight: 18,
    },
    submitButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#8B5CF6',
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
        fontSize: 16,
        fontWeight: '600',
    },
})
