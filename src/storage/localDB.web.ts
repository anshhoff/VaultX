// Web stub - SQLite not needed on web, all data comes from Supabase

export interface LocalDocument {
  id: string;
  name: string;
  category: string;
  local_path: string;
  created_at: number;
  synced: number;
}

/**
 * Initialize the database (no-op on web)
 */
export async function initDB(): Promise<void> {
  // No-op on web
  console.log('SQLite not used on web');
}

/**
 * Insert a new document (no-op on web)
 */
export async function insertDocument(doc: LocalDocument): Promise<void> {
  // No-op on web
  console.log('insertDocument not supported on web');
}

/**
 * Get all documents (no-op on web, returns empty array)
 */
export async function getAllDocuments(): Promise<LocalDocument[]> {
  // No-op on web
  return [];
}

/**
 * Get all unsynced documents (no-op on web, returns empty array)
 */
export async function getUnsyncedDocuments(): Promise<LocalDocument[]> {
  // No-op on web
  return [];
}

/**
 * Delete a document (no-op on web)
 */
export async function deleteDocument(id: string): Promise<void> {
  // No-op on web
  console.log('deleteDocument not supported on web');
}

/**
 * Update the sync status of a document (no-op on web)
 */
export async function updateDocumentSyncStatus(id: string, synced: number): Promise<void> {
  // No-op on web
  console.log('updateDocumentSyncStatus not supported on web');
}
