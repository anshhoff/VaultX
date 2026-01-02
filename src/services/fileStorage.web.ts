// Web-specific file picker using HTML input
import { supabase } from './supabase';
import * as base64 from 'base64-arraybuffer';

export interface SavedDocument {
  localPath: string;
  originalName: string;
  fileData?: ArrayBuffer; // Web needs file data for upload
}

/**
 * Pick a document using web file input
 * Supports PDF and image files
 */
export async function pickAndSaveDocument(): Promise<SavedDocument | null> {
  return new Promise((resolve) => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf,image/*';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) {
        resolve(null);
        return;
      }

      try {
        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        resolve({
          localPath: file.name, // Use filename as path on web
          originalName: file.name,
          fileData: arrayBuffer,
        });
      } catch (error) {
        console.error('Error reading file:', error);
        resolve(null);
      }
    };

    input.oncancel = () => {
      resolve(null);
    };

    // Trigger file picker
    input.click();
  });
}

/**
 * Upload document directly to Supabase on web
 */
export async function uploadDocumentWeb(
  fileData: ArrayBuffer,
  userId: string,
  documentId: string,
  fileName: string
): Promise<string> {
  try {
    // Extract file extension
    const extension = fileName.split('.').pop() || '';
    const storagePath = `${userId}/${documentId}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileData, {
        contentType: getContentType(extension),
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload failed: No data returned');
    }

    return data.path;
  } catch (error: any) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(extension: string): string {
  const ext = extension.toLowerCase();
  
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
}
