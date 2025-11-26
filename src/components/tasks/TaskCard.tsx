import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ClientTask, TaskPriority, TaskStatus } from '../../types/tasks'
import { LinearGradient } from 'expo-linear-gradient'

interface TaskCardProps {
    task: ClientTask & { client?: { full_name: string } }
    onStatusChange: (id: string, status: TaskStatus) => void
    onDelete: (id: string) => void
    onPress: (task: ClientTask) => void
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete, onPress }) => {
    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return '#EF4444'
            case 'high': return '#F59E0B'
            case 'medium': return '#3B82F6'
            case 'low': return '#10B981'
        }
    }

    const getStatusIcon = (status: TaskStatus) => {
        switch (status) {
            case 'completed': return 'checkmark-circle'
            case 'in_progress': return 'time'
            default: return 'ellipse-outline'
        }
    }

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case 'completed': return '#10B981'
            case 'in_progress': return '#F59E0B'
            default: return '#9CA3AF'
        }
    }

    return (
        <TouchableOpacity style={styles.container} onPress={() => onPress(task)} activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <TouchableOpacity
                        onPress={() => {
                            const nextStatus = task.status === 'pending' ? 'in_progress' :
                                task.status === 'in_progress' ? 'completed' : 'pending'
                            onStatusChange(task.id, nextStatus)
                        }}
                    >
                        <Ionicons
                            name={getStatusIcon(task.status)}
                            size={24}
                            color={getStatusColor(task.status)}
                        />
                    </TouchableOpacity>
                    <View style={styles.textContainer}>
                        <Text style={[
                            styles.title,
                            task.status === 'completed' && styles.completedText
                        ]} numberOfLines={1}>
                            {task.title}
                        </Text>
                        {task.client && (
                            <Text style={styles.clientName}>{task.client.full_name}</Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            {task.description && (
                <Text style={styles.description} numberOfLines={2}>
                    {task.description}
                </Text>
            )}

            <View style={styles.footer}>
                <View style={[styles.badge, { backgroundColor: getPriorityColor(task.priority) + '20' }]}>
                    <Text style={[styles.badgeText, { color: getPriorityColor(task.priority) }]}>
                        {task.priority}
                    </Text>
                </View>

                {task.due_date && (
                    <View style={styles.dateContainer}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.dateText}>
                            {new Date(task.due_date).toLocaleDateString()}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    clientName: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    deleteButton: {
        padding: 4,
    },
    description: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 12,
        marginLeft: 36,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 36,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
    },
})
