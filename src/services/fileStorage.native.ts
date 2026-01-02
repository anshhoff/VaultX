import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

export interface SavedDocument {
  localPath: string;
  originalName: string;
  fileData?: ArrayBuffer; // Optional for native compatibility
}

const DOCUMENTS_DIR = `${FileSystem.documentDirectory}documents/`;

/**
 * Ensure the documents directory exists
 */
async function ensureDocumentsDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(DOCUMENTS_DIR);
  
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DOCUMENTS_DIR, { intermediates: true });
    console.log('Documents directory created');
  }
}

/**
 * Generate a unique filename with timestamp
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const extension = originalName.split('.').pop() || 'file';
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${sanitizedName}_${timestamp}_${random}.${extension}`;
}

/**
 * Pick a document and save it to local storage
 * Supports PDF and image files
 */
export async function pickAndSaveDocument(): Promise<SavedDocument | null> {
  try {
    // Ensure documents directory exists
    await ensureDocumentsDirectory();

    // Pick a document
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      console.log('Document picker was cancelled');
      return null;
    }

    const file = result.assets[0];
    const originalName = file.name;
    const uniqueFilename = generateUniqueFilename(originalName);
    const localPath = `${DOCUMENTS_DIR}${uniqueFilename}`;

    // Copy file to documents directory
    await FileSystem.copyAsync({
      from: file.uri,
      to: localPath,
    });

    console.log('Document saved successfully:', localPath);

    return {
      localPath,
      originalName,
    };
  } catch (error) {
    console.error('Error picking and saving document:', error);
    throw error;
  }
}

/**
 * Upload document web - not available on native
 * This stub exists for type compatibility
 */
export async function uploadDocumentWeb(
  fileData: ArrayBuffer,
  userId: string,
  documentId: string,
  fileName: string
): Promise<string> {
  throw new Error('uploadDocumentWeb is only available on web platform');
}
