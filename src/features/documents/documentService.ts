import { pickAndSaveDocument } from '@/services/fileStorage';
import { insertDocument, LocalDocument, updateDocumentSyncStatus } from '@/storage/localDB';
import { uploadDocumentToCloud } from '@/services/cloudStorage';
import { insertCloudDocument } from '@/services/cloudDocuments';
import { supabase } from '@/services/supabase';

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

/**
 * Sync a document to cloud storage (Supabase)
 * @param document - The document to sync
 * @returns true if synced successfully, false otherwise
 */
export async function syncDocument(document: LocalDocument): Promise<boolean> {
  // Skip if already synced
  if (document.synced === 1) {
    console.log('Document already synced:', document.id);
    return true;
  }

  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log('No active session, skipping sync');
      return false;
    }

    const userId = session.user.id;

    // Upload file to Supabase Storage
    const { storagePath } = await uploadDocumentToCloud({
      localFilePath: document.local_path,
      userId,
      documentId: document.id,
    });

    // Save metadata to Supabase DB
    await insertCloudDocument({
      id: document.id,
      userId,
      name: document.name,
      category: document.category,
      storagePath,
      createdAt: document.created_at,
    });

    // Update local record to mark as synced
    await updateDocumentSyncStatus(document.id, 1);

    console.log('Document synced successfully:', document.id);
    return true;
  } catch (error) {
    // Fail gracefully - don't throw error, leave synced = 0
    console.log('Failed to sync document (offline or error):', error);
    return false;
  }
}
