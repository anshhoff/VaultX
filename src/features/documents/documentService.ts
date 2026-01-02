import { pickAndSaveDocument } from '@/services/fileStorage';
import { insertDocument, LocalDocument } from '@/storage/localDB';

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Add a new document by picking from device and saving to local storage
 * @param category - Document category (e.g., 'passport', 'license', 'other')
 * @returns The saved document or null if cancelled
 */
export async function addDocument(category: string): Promise<LocalDocument | null> {
  try {
    // Pick and save the document to file storage
    const savedFile = await pickAndSaveDocument();

    if (!savedFile) {
      // User cancelled the picker
      return null;
    }

    // Create document record
    const document: LocalDocument = {
      id: generateUUID(),
      name: savedFile.originalName,
      category,
      local_path: savedFile.localPath,
      created_at: Date.now(),
      synced: 0,
    };

    // Save to local database
    await insertDocument(document);

    console.log('Document added successfully:', document.id);

    return document;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}
