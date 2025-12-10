import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { ClientDocument } from '../../types/documents'
import { openDocument } from '../../utils/documentHandler'

interface DocumentCardProps {
    document: ClientDocument
    onDelete: (id: string, filePath: string) => void
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDelete }) => {
    const isImage = document.file_type.startsWith('image/')

    const handlePress = () => {
        if (document.url) {
            openDocument(document.url, document.name, document.file_type)
        } else {
            Alert.alert('Error', 'Could not open document')
        }
    }

    const handleDelete = () => {
        Alert.alert(
            'Delete Document',
            `Are you sure you want to delete "${document.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete(document.id, document.file_path),
                },
            ]
        )
    }

    const getIcon = () => {
        if (isImage) return 'image'
        if (document.file_type.includes('pdf')) return 'document-text'
        return 'document'
    }

    const formatType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.previewContainer}>
                {isImage && document.url ? (
                    <Image source={{ uri: document.url }} style={styles.previewImage} contentFit="cover" transition={200} />
                ) : (
                    <View style={styles.iconPlaceholder}>
                        <Ionicons name={getIcon()} size={32} color="#6B7280" />
                    </View>
                )}
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{formatType(document.type)}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                        {document.name}
                    </Text>
                    <Text style={styles.date}>
                        {new Date(document.created_at).toLocaleDateString()}
                    </Text>
                </View>

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    previewContainer: {
        height: 140,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    iconPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    typeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    content: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    info: {
        flex: 1,
        marginRight: 12,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#6B7280',
    },
    deleteButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },
})
