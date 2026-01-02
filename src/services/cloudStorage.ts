import * as FileSystem from 'expo-file-system/legacy';
import * as base64 from 'base64-arraybuffer';
import { supabase } from './supabase';

interface UploadDocumentParams {
  localFilePath: string;
  userId: string;
  documentId: string;
}

interface UploadDocumentResult {
  storagePath: string;
}

/**
 * Upload a local document to Supabase Storage
 * @param params - Upload parameters
 * @returns The storage path of the uploaded document
 */
export async function uploadDocumentToCloud(
  params: UploadDocumentParams
): Promise<UploadDocumentResult> {
  const { localFilePath, userId, documentId } = params;

  try {
    // Verify session before upload
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated. Please log in again.');
    }

    console.log('Uploading document for user:', userId);
    console.log('Local file path:', localFilePath);

    // Read the file as base64
    const fileBase64 = await FileSystem.readAsStringAsync(localFilePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log('File read successfully, size:', fileBase64.length);

    // Convert base64 to array buffer for upload
    const arrayBuffer = base64.decode(fileBase64);

    // Extract file name and extension from local path
    const fileName = localFilePath.split('/').pop() || documentId;
    const fileExtension = fileName.split('.').pop() || '';

    // Construct storage path: userId/documentId.extension
    const storagePath = `${userId}/${documentId}.${fileExtension}`;

    console.log('Uploading to storage path:', storagePath);

    // Upload to Supabase Storage (upsert to handle existing files)
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(storagePath, arrayBuffer, {
        contentType: getContentType(fileExtension),
        upsert: true,
      });

    if (error) {
      console.error('Upload error details:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    if (!data) {
      throw new Error('Upload failed: No data returned');
    }

    console.log('Upload successful:', data.path);
    return { storagePath: data.path };
  } catch (error: any) {
    console.error('Error uploading document to cloud:', error);
    throw new Error(error.message || 'Failed to upload document to cloud storage');
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
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    default:
      return 'application/octet-stream';
  }
}
