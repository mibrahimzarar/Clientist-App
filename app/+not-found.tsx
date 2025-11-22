import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'

export default function NotFound() {
  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 8 }}>Page not found</Text>
      <Text style={{ color: '#666', marginBottom: 16 }}>The route you opened does not exist.</Text>
      <Pressable onPress={() => router.replace('/')} style={{ padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 8 }}>
        <Text>Go to Home</Text>
      </Pressable>
    </View>
  )
}