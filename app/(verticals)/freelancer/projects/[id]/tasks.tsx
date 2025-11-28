import React from 'react'
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFreelancerTasks, useUpdateTask } from '../../../../../src/hooks/useFreelancer'
import { FreelancerTask } from '../../../../../src/types/freelancer'

export default function ProjectTasksPage() {
    const { id } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const { data: tasksData, isLoading } = useFreelancerTasks()
    const updateTaskMutation = useUpdateTask()

    const projectTasks = tasksData?.data?.filter(t => t.project_id === id) || []

    const handleToggleTask = (task: FreelancerTask) => {
        updateTaskMutation.mutate({
            id: task.id,
            updates: { status: task.status === 'done' ? 'todo' : 'done' }
        })
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Project Tasks</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push({
                            pathname: '/(verticals)/freelancer/tasks/new',
                            params: { projectId: id }
                        })}
                    >
                        <Ionicons name="add" size={24} color="#8B5CF6" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#8B5CF6" />
                ) : projectTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkbox-outline" size={64} color="#E5E7EB" />
                        <Text style={styles.emptyText}>No tasks for this project yet</Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => router.push({
                                pathname: '/(verticals)/freelancer/tasks/new',
                                params: { projectId: id }
                            })}
                        >
                            <Text style={styles.createButtonText}>Create Task</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    projectTasks.map((task) => (
                        <TouchableOpacity
                            key={task.id}
                            style={styles.taskCard}
                            onPress={() => router.push(`/(verticals)/freelancer/tasks/${task.id}/edit` as any)}
                        >
                            <TouchableOpacity
                                style={styles.checkbox}
                                onPress={() => handleToggleTask(task)}
                            >
                                {task.status === 'done' ? (
                                    <Ionicons name="checkbox" size={24} color="#10B981" />
                                ) : (
                                    <Ionicons name="square-outline" size={24} color="#9CA3AF" />
                                )}
                            </TouchableOpacity>
                            <View style={styles.taskContent}>
                                <Text style={[
                                    styles.taskTitle,
                                    task.status === 'done' && styles.taskTitleDone
                                ]}>
                                    {task.title}
                                </Text>
                                <View style={styles.taskMeta}>
                                    {task.due_date && (
                                        <View style={styles.metaItem}>
                                            <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                            <Text style={styles.metaText}>
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}
                                    <View style={[
                                        styles.priorityBadge,
                                        { backgroundColor: task.priority === 'high' ? '#FEE2E2' : '#E0E7FF' }
                                    ]}>
                                        <Text style={[
                                            styles.priorityText,
                                            { color: task.priority === 'high' ? '#DC2626' : '#4F46E5' }
                                        ]}>
                                            {task.priority}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                        </TouchableOpacity>
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
    emptyState: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 16,
        marginBottom: 24,
    },
    createButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    taskCard: {
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
    checkbox: {
        marginRight: 12,
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    taskTitleDone: {
        textDecorationLine: 'line-through',
        color: '#9CA3AF',
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'capitalize',
    },
})
