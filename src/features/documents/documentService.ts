import { Platform } from 'react-native';
import { pickAndSaveDocument, uploadDocumentWeb } from '@/services/fileStorage';
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

    const documentId = generateUUID();

    if (Platform.OS === 'web') {
      // Web: Upload directly to Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Not authenticated');
      }

      const userId = session.user.id;

      // Upload file to Supabase Storage
      const storagePath = await uploadDocumentWeb(
        savedFile.fileData!,
        userId,
        documentId,
        savedFile.originalName
      );

      // Save metadata to Supabase DB
      await insertCloudDocument({
        id: documentId,
        userId,
        name: savedFile.originalName,
        category,
        storagePath,
        createdAt: Date.now(),
      });

      console.log('Document uploaded to cloud successfully:', documentId);

      // Return a document object for consistency
      return {
        id: documentId,
        name: savedFile.originalName,
        category,
        local_path: storagePath,
        created_at: Date.now(),
        synced: 1,
      };
    } else {
      // Native: Save to local database
      const document: LocalDocument = {
        id: documentId,
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
    }
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
  // Skip on web - web documents are always synced
  if (Platform.OS === 'web') {
    return true;
  }

  // Skip if already synced
  if (document.synced === 1) {
    console.log('Document already synced:', document.id);
    return true;
  }

  try {
    // Get current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('Session error:', sessionError);
      return false;
    }
    
    if (!session?.user) {
      console.log('No active session, skipping sync');
      return false;
    }

    const userId = session.user.id;

    console.log('Starting sync for document:', document.id);
    console.log('User ID:', userId);
    console.log('Local path:', document.local_path);

    // Upload file to Supabase Storage
    const { storagePath } = await uploadDocumentToCloud({
      localFilePath: document.local_path,
      userId,
      documentId: document.id,
    });

    console.log('File uploaded, saving metadata...');

    // Save metadata to Supabase DB
    await insertCloudDocument({
      id: document.id,
      userId,
      name: document.name,
      category: document.category,
      storagePath,
      createdAt: document.created_at,
    });

    console.log('Metadata saved, updating local status...');

    // Update local record to mark as synced
    await updateDocumentSyncStatus(document.id, 1);

    console.log('Document synced successfully:', document.id);
    return true;
  } catch (error: any) {
    // Fail gracefully - don't throw error, leave synced = 0
    console.error('Failed to sync document:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('Failed to sync document (offline or error):', error);
    return false;
  }
}
