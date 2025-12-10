import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import * as Linking from 'expo-linking'
import { Alert } from 'react-native'

/**
 * Opens a document handling various URL types including base64 data URIs
 * @param url - The URL or base64 data URI of the document
 * @param filename - Optional filename for the document (useful for base64)
 * @param fileType - Optional MIME type or extension (useful for base64)
 */
export const openDocument = async (url: string, filename?: string, fileType?: string) => {
    try {
        if (!url) {
            Alert.alert('Error', 'Invalid document URL')
            return
        }

        // Handle http/https URLs directly
        if (url.startsWith('http://') || url.startsWith('https://')) {
            const supported = await Linking.canOpenURL(url)
            if (supported) {
                await Linking.openURL(url)
            } else {
                // Try opening anyway as canOpenURL can be false negatives on Android
                await Linking.openURL(url).catch(() => {
                    Alert.alert('Error', 'Cannot open this URL')
                })
            }
            return
        }

        // Handle base64 data URIs
        if (url.startsWith('data:')) {
            // Extract base64 data
            const base64DataIndex = url.indexOf('base64,')
            if (base64DataIndex === -1) {
                Alert.alert('Error', 'Invalid base64 data')
                return
            }
            const base64Code = url.substring(base64DataIndex + 7)

            // Determine extension
            let extension = 'bin'
            if (fileType) {
                // e.g. "image/jpeg" -> "jpeg"
                // e.g. "pdf" -> "pdf"
                const typeParts = fileType.split('/')
                extension = typeParts.length > 1 ? typeParts[1] : fileType
            } else if (filename) {
                const parts = filename.split('.')
                if (parts.length > 1) {
                    extension = parts.pop() || extension
                }
            } else {
                 // Try to guess from mime type in data URI
                 const mime = url.substring(5, url.indexOf(';'))
                 if (mime) {
                     const mimeParts = mime.split('/')
                     extension = mimeParts.length > 1 ? mimeParts[1] : mime
                 }
            }

            // Create temp file path
            // Use a clean filename or default
            const safeFilename = filename 
                ? filename.replace(/[^a-zA-Z0-9.-]/g, '_') 
                : `document_${Date.now()}`
            
            // Ensure filename has extension
            const finalFilename = safeFilename.toLowerCase().endsWith(`.${extension.toLowerCase()}`) 
                ? safeFilename 
                : `${safeFilename}.${extension}`

            const fileUri = `${FileSystem.cacheDirectory}${finalFilename}`

            // Write to file
            await FileSystem.writeAsStringAsync(fileUri, base64Code, {
                encoding: FileSystem.EncodingType.Base64
            })

            // Open with share sheet/viewer
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri)
            } else {
                Alert.alert('Error', 'Sharing is not available on this device')
            }
            return
        }

        // Handle existing file URIs
        if (url.startsWith('file://')) {
             if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(url)
            } else {
                 await Linking.openURL(url)
            }
            return
        }

        // Fallback for other schemes
        await Linking.openURL(url)

    } catch (error) {
        console.error('Error opening document:', error)
        Alert.alert('Error', 'Failed to open document')
    }
}
