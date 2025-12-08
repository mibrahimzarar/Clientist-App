import * as FileSystem from 'expo-file-system'

const CLIENT_IMAGES_DIR = `${FileSystem.documentDirectory}client_profiles/`

/**
 * Ensures the client images directory exists
 */
async function ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(CLIENT_IMAGES_DIR)
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CLIENT_IMAGES_DIR, { intermediates: true })
    }
}

/**
 * Saves a client profile image to local storage
 * @param clientId - The client's UUID
 * @param imageUri - The temporary URI from image picker
 * @returns The local file URI where the image is stored
 */
export async function saveClientImage(
    clientId: string,
    imageUri: string
): Promise<string> {
    try {
        await ensureDirectoryExists()

        // Extract file extension from the source URI
        const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
        const localFileName = `client_profile_${clientId}.${fileExt}`
        const localUri = `${CLIENT_IMAGES_DIR}${localFileName}`

        // Delete old image if exists
        const oldFileInfo = await FileSystem.getInfoAsync(localUri)
        if (oldFileInfo.exists) {
            await FileSystem.deleteAsync(localUri, { idempotent: true })
        }

        // Copy the image from picker cache to app directory
        await FileSystem.copyAsync({
            from: imageUri,
            to: localUri
        })

        return localUri
    } catch (error) {
        console.error('Error saving client image:', error)
        throw new Error(`Failed to save image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

/**
 * Deletes a client profile image from local storage
 * @param localUri - The local file URI to delete
 */
export async function deleteClientImage(localUri: string): Promise<void> {
    try {
        const fileInfo = await FileSystem.getInfoAsync(localUri)
        if (fileInfo.exists) {
            await FileSystem.deleteAsync(localUri, { idempotent: true })
        }
    } catch (error) {
        console.error('Error deleting client image:', error)
        // Don't throw - deletion failures shouldn't block other operations
    }
}

/**
 * Gets the local URI for a client's profile image
 * @param clientId - The client's UUID
 * @returns The local file URI if exists, otherwise null
 */
export async function getClientImageUri(clientId: string): Promise<string | null> {
    try {
        await ensureDirectoryExists()

        // Check for common image extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp', 'heic']

        for (const ext of extensions) {
            const localUri = `${CLIENT_IMAGES_DIR}client_profile_${clientId}.${ext}`
            const fileInfo = await FileSystem.getInfoAsync(localUri)
            if (fileInfo.exists) {
                return localUri
            }
        }

        return null
    } catch (error) {
        console.error('Error getting client image URI:', error)
        return null
    }
}

/**
 * Checks if a URI is a local file URI
 * @param uri - The URI to check
 * @returns True if the URI is a local file URI
 */
export function isLocalFileUri(uri: string | null | undefined): boolean {
    if (!uri) return false
    return uri.startsWith('file://') || uri.startsWith(CLIENT_IMAGES_DIR)
}

/**
 * Cleans up orphaned images for a deleted client
 * @param clientId - The client's UUID
 */
export async function cleanupClientImage(clientId: string): Promise<void> {
    const imageUri = await getClientImageUri(clientId)
    if (imageUri) {
        await deleteClientImage(imageUri)
    }
}
