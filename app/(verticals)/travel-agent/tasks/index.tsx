import React, { useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    TextInput,
    ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../../../../src/hooks/useTasks'
import { TaskCard } from '../../../../src/components/tasks/TaskCard'
import { TaskModal } from '../../../../src/components/tasks/TaskModal'
import { BouncingBallsLoader } from '../../../../src/components/ui/BouncingBallsLoader'
import { ClientTask, TaskStatus } from '../../../../src/types/tasks'

export default function TasksPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [editingTask, setEditingTask] = useState<ClientTask | undefined>(undefined)

    const { data, isLoading, refetch } = useTasks()
    const createTask = useCreateTask()
    const updateTask = useUpdateTask()
    const deleteTask = useDeleteTask()

    const tasks = data?.data || []

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.client?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus
        return matchesSearch && matchesStatus
    })

    const handleStatusChange = (id: string, status: TaskStatus) => {
        updateTask.mutate({ id, data: { status } })
    }

    const handleDelete = (id: string) => {
        deleteTask.mutate(id)
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
                colors={['#ba509eff', '#ae0e83ff']}
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
                            {filteredTasks.length} tasks • {tasks.filter(t => t.status === 'pending').length} pending
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

                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={20} color="#6B7280" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search tasks..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterContainer}
                    contentContainerStyle={styles.filterContent}
                >
                    {(['all', 'pending', 'in_progress', 'completed'] as const).map(status => (
                        <TouchableOpacity
                            key={status}
                            style={[
                                styles.filterTab,
                                filterStatus === status && styles.filterTabActive
                            ]}
                            onPress={() => setFilterStatus(status)}
                        >
                            <Text style={[
                                styles.filterText,
                                filterStatus === status && styles.filterTextActive
                            ]}>
                                {status.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>

            <FlatList
                data={filteredTasks}
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
                        <Text style={styles.emptyTitle}>No tasks found</Text>
                        <Text style={styles.emptyText}>
                            {searchQuery ? 'Try adjusting your filters' : 'Create your first task to get started'}
                        </Text>
                    </View>
                }
            />

            <TaskModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleSubmit}
                initialData={editingTask}
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
        marginBottom: 16,
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
    searchContainer: {
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    filterContainer: {
        marginBottom: 0,
    },
    filterContent: {
        gap: 8,
        paddingRight: 20,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    filterTabActive: {
        backgroundColor: '#fff',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        textTransform: 'capitalize',
    },
    filterTextActive: {
        color: '#4F46E5',
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
    },
})
