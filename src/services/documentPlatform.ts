import { Platform } from 'react-native';
import { getAllDocuments as getAllLocalDocuments, LocalDocument } from '@/storage/localDB';
import { getCloudDocuments, CloudDocument } from '@/services/cloudDocuments';
import { supabase } from '@/services/supabase';

/**
 * Unified document interface for both platforms
 */
export interface UnifiedDocument {
  id: string;
  name: string;
  category: string;
  local_path: string;
  created_at: number;
  synced: number;
}

/**
 * Get documents based on platform
 * - Web: Fetch from Supabase (synced documents only)
 * - Native: Fetch from local SQLite
 */
export async function getDocuments(): Promise<UnifiedDocument[]> {
  if (Platform.OS === 'web') {
    // Web: Fetch from cloud storage
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return [];
      }

      const cloudDocs = await getCloudDocuments(session.user.id);
      
      // Convert cloud documents to unified format
      return cloudDocs.map((doc: CloudDocument) => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
        local_path: doc.storage_path, // Use storage path for web
        created_at: doc.created_at,
        synced: 1, // All cloud documents are synced
      }));
    } catch (error) {
      console.error('Error fetching cloud documents:', error);
      return [];
    }
  } else {
    // Native: Merge local and cloud documents
    try {
      const localDocs = await getAllLocalDocuments();
      
      // Try to fetch cloud documents
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const cloudDocs = await getCloudDocuments(session.user.id);
          
          // Create a map of local document IDs
          const localDocIds = new Set(localDocs.map((doc: LocalDocument) => doc.id));
          
          // Add cloud documents that don't exist locally
          const cloudOnlyDocs = cloudDocs
            .filter(doc => !localDocIds.has(doc.id))
            .map((doc: CloudDocument) => ({
              id: doc.id,
              name: doc.name,
              category: doc.category,
              local_path: doc.storage_path, // Use storage path for cloud-only docs
              created_at: doc.created_at,
              synced: 1, // Cloud documents are synced
            }));
          
          // Merge local and cloud-only documents
          return [...localDocs, ...cloudOnlyDocs].sort((a, b) => b.created_at - a.created_at);
        }
      } catch (cloudError) {
        console.log('Could not fetch cloud documents:', cloudError);
      }
      
      return localDocs;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }
}

/**
 * Get Supabase signed URL for a document
 * Used on web to download/view documents
 */
export async function getDocumentUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 3600); // 1 hour expiry
  
  if (error || !data) {
    throw new Error('Failed to get document URL');
  }
  
  return data.signedUrl;
}
