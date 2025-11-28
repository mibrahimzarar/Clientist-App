import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFreelancerProject } from '../../../../../src/hooks/useFreelancer'

export default function ProjectTimerPage() {
    const { id } = useLocalSearchParams()
    const insets = useSafeAreaInsets()
    const { data: projectData } = useFreelancerProject(id as string)
    const project = projectData?.data

    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        if (!project?.deadline) return

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const deadline = new Date(project.deadline!).getTime()
            const distance = deadline - now

            if (distance < 0) {
                clearInterval(interval)
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            } else {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                })
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [project?.deadline])

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={[styles.header, { paddingTop: insets.top }]}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Project Deadline</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.timerCard}>
                    <Text style={styles.timerLabel}>Time Remaining</Text>
                    <View style={styles.timerGrid}>
                        <View style={styles.timeUnit}>
                            <Text style={styles.timeValue}>{timeLeft.days}</Text>
                            <Text style={styles.timeLabel}>Days</Text>
                        </View>
                        <Text style={styles.separator}>:</Text>
                        <View style={styles.timeUnit}>
                            <Text style={styles.timeValue}>{timeLeft.hours.toString().padStart(2, '0')}</Text>
                            <Text style={styles.timeLabel}>Hours</Text>
                        </View>
                        <Text style={styles.separator}>:</Text>
                        <View style={styles.timeUnit}>
                            <Text style={styles.timeValue}>{timeLeft.minutes.toString().padStart(2, '0')}</Text>
                            <Text style={styles.timeLabel}>Mins</Text>
                        </View>
                        <Text style={styles.separator}>:</Text>
                        <View style={styles.timeUnit}>
                            <Text style={styles.timeValue}>{timeLeft.seconds.toString().padStart(2, '0')}</Text>
                            <Text style={styles.timeLabel}>Secs</Text>
                        </View>
                    </View>
                    <Text style={styles.deadlineText}>
                        Deadline: {project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                    </Text>
                </View>
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
        paddingBottom: 40,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
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
    content: {
        flex: 1,
        padding: 20,
        marginTop: -30,
    },
    timerCard: {
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    timerLabel: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 20,
        fontWeight: '500',
    },
    timerGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    timeUnit: {
        alignItems: 'center',
        minWidth: 60,
    },
    timeValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        fontVariant: ['tabular-nums'],
    },
    timeLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 4,
    },
    separator: {
        fontSize: 32,
        fontWeight: '700',
        color: '#E5E7EB',
        marginHorizontal: 4,
        marginTop: -16,
    },
    deadlineText: {
        fontSize: 16,
        color: '#4B5563',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        overflow: 'hidden',
    },
})
