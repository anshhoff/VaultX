// Platform-agnostic exports for fileStorage
// This file re-exports from platform-specific implementations

import type { SavedDocument as SavedDocumentType } from './fileStorage.native';
import {
  pickAndSaveDocument as pickAndSaveDocumentNative,
  uploadDocumentWeb as uploadDocumentWebNative
} from './fileStorage.native';

export type SavedDocument = SavedDocumentType;
export const pickAndSaveDocument = pickAndSaveDocumentNative;
export const uploadDocumentWeb = uploadDocumentWebNative;
