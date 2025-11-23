import React, { useState } from 'react'
import { View, Text, TextInput, Pressable, Image, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { BouncingBallsLoader } from '../src/components/ui/BouncingBallsLoader'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../src/lib/supabase'
import { router, Link } from 'expo-router'
import { getSelectedVertical } from '../src/lib/verticalStorage'
import { findVerticalById } from '../src/verticals'

export default function SignUp() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onSignUp = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error

            if (data.session?.user) {
                const v = await getSelectedVertical(data.session.user.id)
                if (v) {
                    router.replace('/')
                } else {
                    router.replace('/select-vertical')
                }
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image source={require('../assets/images/icon.png')} style={styles.logo} resizeMode="contain" />
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join Clientist today</Text>
                    </View>

                    <View style={styles.form}>
                        {error && <Text style={styles.errorText}>{error}</Text>}

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                autoCapitalize="none"
                                keyboardType="email-address"
                                placeholder="hello@example.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                secureTextEntry
                                placeholder="Create a strong password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                            />
                        </View>

                        <Pressable onPress={onSignUp} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={loading}>
                            {loading ? <BouncingBallsLoader color="#fff" size={8} /> : <Text style={styles.buttonText}>Sign Up</Text>}
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/sign-in" asChild>
                                <Pressable>
                                    <Text style={styles.link}>Sign In</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 10,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(0, 122, 255, 0.3)',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        width: '100%',
    },
    errorText: {
        color: '#ef4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1a1a1a',
    },
    button: {
        backgroundColor: '#222',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    link: {
        color: '#222',
        fontSize: 14,
        fontWeight: '700',
    },
})
