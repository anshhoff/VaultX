import * as SQLite from 'expo-sqlite';

export interface LocalDocument {
  id: string;
  name: string;
  category: string;
  local_path: string;
  created_at: number;
  synced: number;
}

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

/**
 * Initialize the database and create tables
 */
export async function initDB(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      db = await SQLite.openDatabaseAsync('vault.db');

      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS documents (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT,
          local_path TEXT,
          created_at INTEGER NOT NULL,
          synced INTEGER DEFAULT 0
        );
      `);

      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Ensure database is initialized before use
 */
async function ensureDBInitialized(): Promise<void> {
  if (!db) {
    await initDB();
  }
}

/**
 * Insert a new document into the database
 */
export async function insertDocument(doc: LocalDocument): Promise<void> {
  await ensureDBInitialized();

  try {
    await db!.runAsync(
      `INSERT INTO documents (id, name, category, local_path, created_at, synced)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [doc.id, doc.name, doc.category, doc.local_path, doc.created_at, doc.synced]
    );
  } catch (error) {
    console.error('Error inserting document:', error);
    throw error;
  }
}

/**
 * Get all documents from the database
 */
export async function getAllDocuments(): Promise<LocalDocument[]> {
  await ensureDBInitialized();

  try {
    const result = await db!.getAllAsync<LocalDocument>('SELECT * FROM documents ORDER BY created_at DESC');
    return result;
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

/**
 * Delete a document from the database
 */
export async function deleteDocument(id: string): Promise<void> {
  await ensureDBInitialized();

  try {
    await db!.runAsync('DELETE FROM documents WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
