import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../../src/hooks/useTasks'
import { TaskCard } from '../../../../src/components/tasks/TaskCard'
import { TaskModal } from '../../../../src/components/tasks/TaskModal'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { ClientTask, TaskStatus } from '../../../../src/types/tasks'

export default function ClientTasksScreen() {
    const { id } = useLocalSearchParams<{ id: string }>()
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingTask, setEditingTask] = useState<ClientTask | undefined>(undefined)

    const { data, isLoading, refetch } = useTasks({ clientId: id! })
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const tasks = data?.data || []

    const handleStatusChange = (taskId: string, status: TaskStatus) => {
        updateTask.mutate({ id: taskId, data: { status } })
    }

    const handleDelete = (taskId: string) => {
        deleteTask.mutate(taskId)
    }

    const handleEdit = (task: ClientTask) => {
        setEditingTask(task)
        setIsModalVisible(true)
    }

    const handleSubmit = (taskData: any) => {
        if (editingTask) {
            updateTask.mutate({ id: editingTask.id, data: taskData })
        } else {
            createTask.mutate(taskData)
        }
    }

    if (isLoading && !tasks.length) {
        return (
            <View style={styles.loadingContainer}>
                <BouncingBallsLoader size={12} color="#4F46E5" />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Tasks</Text>
                        <Text style={styles.headerSubtitle}>
                            {tasks.length} tasks • {tasks.filter(t => t.status === 'pending').length} pending
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            setEditingTask(undefined)
                            setIsModalVisible(true)
                        }}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <FlatList
                data={tasks}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onPress={handleEdit}
                    />
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkbox-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>No tasks yet</Text>
                        <Text style={styles.emptyText}>
                            Create tasks to track work for this client
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => {
                                setEditingTask(undefined)
                                setIsModalVisible(true)
                            }}
                        >
                            <Text style={styles.emptyButtonText}>Create First Task</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <TaskModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                initialData={editingTask}
                preSelectedClientId={id!}
            />
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        shadowColor: '#4F46E5',
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
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 12,
    },
    listContent: {
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#4F46E5',
        borderRadius: 12,
    },
    emptyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
})
