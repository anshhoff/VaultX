import { Linking } from 'react-native';

/**
 * Open a local document using the system default viewer
 * @param localPath - The local file path to open
 */
export async function openDocument(localPath: string): Promise<void> {
  try {
    // Ensure the path has the file:// scheme
    const fileUri = localPath.startsWith('file://') ? localPath : `file://${localPath}`;

    // Open the document directly without canOpenURL check
    // canOpenURL returns false for local files on iOS, so we skip it
    await Linking.openURL(fileUri);

    console.log('Document opened successfully:', localPath);
  } catch (error) {
    console.error('Error opening document:', error);
    throw new Error('Failed to open document. Please ensure a compatible viewer is installed.');
  }
}
