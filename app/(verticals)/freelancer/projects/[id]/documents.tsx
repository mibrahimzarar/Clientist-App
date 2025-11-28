import React, { useState } from 'react'
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useProjectDocuments, useCreateDocument } from '../../../../../src/hooks/useFreelancer'

export default function ProjectDocumentsPage() {
    const { id } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const { data: docsData, isLoading } = useProjectDocuments(id as string)
    const createDocMutation = useCreateDocument()

    const [isAdding, setIsAdding] = useState(false)
    const [newDoc, setNewDoc] = useState({ name: '', url: '', type: 'doc' })

    const handleAddDocument = async () => {
        if (!newDoc.name || !newDoc.url) {
            Alert.alert('Error', 'Please fill in all fields')
            return
        }

        try {
            await createDocMutation.mutateAsync({
                project_id: id as string,
                ...newDoc,
                uploaded_at: new Date().toISOString()
            })
            setIsAdding(false)
            setNewDoc({ name: '', url: '', type: 'doc' })
        } catch (error) {
            Alert.alert('Error', 'Failed to add document')
        }
    }

    const getIconForType = (type: string) => {
        switch (type) {
            case 'pdf': return 'document-text'
            case 'image': return 'image'
            default: return 'document'
        }
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#10B981', '#059669']}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Project Files</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setIsAdding(!isAdding)}
                    >
                        <Ionicons name={isAdding ? "close" : "add"} size={24} color="#10B981" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {isAdding && (
                    <View style={styles.addCard}>
                        <Text style={styles.addTitle}>Add New Document</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Document Name"
                            value={newDoc.name}
                            onChangeText={(t) => setNewDoc({ ...newDoc, name: t })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Document URL"
                            value={newDoc.url}
                            onChangeText={(t) => setNewDoc({ ...newDoc, url: t })}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddDocument}
                            disabled={createDocMutation.isPending}
                        >
                            {createDocMutation.isPending ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Add Document</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {isLoading ? (
                    <ActivityIndicator size="large" color="#10B981" />
                ) : docsData?.data?.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No documents uploaded yet</Text>
                    </View>
                ) : (
                    docsData?.data?.map((doc: import('../../../../../src/types/freelancer').FreelancerDocument) => (
                        <View key={doc.id} style={styles.docCard}>
                            <View style={[styles.docIcon, { backgroundColor: '#ECFDF5' }]}>
                                <Ionicons name={getIconForType(doc.type) as any} size={24} color="#10B981" />
                            </View>
                            <View style={styles.docContent}>
                                <Text style={styles.docName}>{doc.name}</Text>
                                <Text style={styles.docDate}>
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => {/* Open URL */ }}>
                                <Ionicons name="download-outline" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
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
    header: {
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
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
    addButton: {
        padding: 8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    content: {
        padding: 20,
    },
    addCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    addTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#111827',
    },
    input: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#10B981',
        padding: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
    },
    docCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    docIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    docContent: {
        flex: 1,
    },
    docName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    docDate: {
        fontSize: 12,
        color: '#6B7280',
    },
})
