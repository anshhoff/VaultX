import { supabase } from './supabase';

export interface CloudDocument {
  id: string;
  user_id: string;
  name: string;
  category: string;
  storage_path: string;
  created_at: number;
}

interface InsertDocumentParams {
  id: string;
  userId: string;
  name: string;
  category: string;
  storagePath: string;
  createdAt: number;
}

/**
 * Insert document metadata into Supabase (upsert to handle duplicates)
 * @param params - Document metadata parameters
 */
export async function insertCloudDocument(
  params: InsertDocumentParams
): Promise<void> {
  const { id, userId, name, category, storagePath, createdAt } = params;

  try {
    const { error } = await supabase
      .from('documents')
      .upsert({
        id,
        user_id: userId,
        name,
        category,
        storage_path: storagePath,
        created_at: createdAt,
      }, {
        onConflict: 'id',
      });

    if (error) {
      throw new Error(`Failed to insert document metadata: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error inserting cloud document:', error);
    throw new Error(error.message || 'Failed to insert document metadata');
  }
}

/**
 * Get all documents for a user from Supabase
 * @param userId - User ID to fetch documents for
 */
export async function getCloudDocuments(userId: string): Promise<CloudDocument[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    return data || [];
  } catch (error: any) {
    console.error('Error fetching cloud documents:', error);
    throw new Error(error.message || 'Failed to fetch documents');
  }
}

/**
 * Delete document metadata from Supabase
 * @param documentId - Document ID to delete
 * @param userId - User ID for verification
 */
export async function deleteCloudDocument(
  documentId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete document metadata: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error deleting cloud document:', error);
    throw new Error(error.message || 'Failed to delete document metadata');
  }
}
