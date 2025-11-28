import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'

interface DatePickerInputProps {
    label: string
    value: string
    onChange: (date: string) => void
    placeholder?: string
}

export function DatePickerInput({ label, value, onChange, placeholder = 'Select Date' }: DatePickerInputProps) {
    const [show, setShow] = useState(false)
    const [date, setDate] = useState(value ? new Date(value) : new Date())

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false)
        }

        if (selectedDate) {
            setDate(selectedDate)
            // Format as YYYY-MM-DD
            const formatted = selectedDate.toISOString().split('T')[0]
            onChange(formatted)
            if (Platform.OS === 'ios') {
                setShow(false)
            }
        } else if (event.nativeEvent && event.nativeEvent.timestamp === undefined) {
            // User cancelled
            setShow(false)
        }
    }

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return placeholder
        const d = new Date(dateString)
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.input}
                onPress={() => setShow(true)}
            >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={[styles.inputText, !value && styles.placeholder]}>
                    {formatDisplayDate(value)}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
                <Modal
                    visible={show}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShow(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShow(false)}
                    >
                        <View style={styles.iosPickerContainer}>
                            <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShow(false)}>
                                    <Text style={styles.doneButton}>Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="spinner"
                                onChange={onDateChange}
                                textColor="#000"
                            />
                        </View>
                    </TouchableOpacity>
                </Modal>
            ) : (
                show && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    placeholder: {
        color: '#9CA3AF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    iosPickerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34,
    },
    iosPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    doneButton: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B5CF6',
    },
})
