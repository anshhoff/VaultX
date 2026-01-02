// Platform-agnostic exports for localDB
// This file re-exports from platform-specific implementations

import type { LocalDocument as LocalDocumentType } from './localDB.native';
import {
  initDB as initDBNative,
  insertDocument as insertDocumentNative,
  getAllDocuments as getAllDocumentsNative,
  getUnsyncedDocuments as getUnsyncedDocumentsNative,
  deleteDocument as deleteDocumentNative,
  updateDocumentSyncStatus as updateDocumentSyncStatusNative
} from './localDB.native';

export type LocalDocument = LocalDocumentType;
export const initDB = initDBNative;
export const insertDocument = insertDocumentNative;
export const getAllDocuments = getAllDocumentsNative;
export const getUnsyncedDocuments = getUnsyncedDocumentsNative;
export const deleteDocument = deleteDocumentNative;
export const updateDocumentSyncStatus = updateDocumentSyncStatusNative;
