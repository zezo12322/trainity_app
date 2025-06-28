import { supabase } from './supabase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface FileUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class FileUploadService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  private readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  async pickImage(options: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  } = {}): Promise<FileUploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return {
          success: false,
          error: 'Permission denied to access media library'
        };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect ?? [4, 3],
        quality: options.quality ?? 0.8,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'User canceled image selection'
        };
      }

      const asset = result.assets[0];
      return this.validateAndPrepareFile({
        uri: asset.uri,
        name: asset.fileName || `image_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0
      });

    } catch (error) {
      console.error('Error picking image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pick image'
      };
    }
  }

  async pickDocument(): Promise<FileUploadResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return {
          success: false,
          error: 'User canceled document selection'
        };
      }

      const asset = result.assets[0];
      return this.validateAndPrepareFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
        size: asset.size || 0
      });

    } catch (error) {
      console.error('Error picking document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pick document'
      };
    }
  }

  private validateAndPrepareFile(file: {
    uri: string;
    name: string;
    type: string;
    size: number;
  }): FileUploadResult {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Validate file type
    const isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);
    const isDocument = this.ALLOWED_DOCUMENT_TYPES.includes(file.type);

    if (!isImage && !isDocument) {
      return {
        success: false,
        error: 'File type not supported'
      };
    }

    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: file.uri
    };
  }

  async uploadFile(
    file: {
      uri: string;
      name: string;
      type: string;
    },
    bucket?: string,
    folder: string = 'general',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResult> {
    // Auto-select bucket based on file type
    if (!bucket) {
      if (this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        bucket = 'chat-images';
      } else if (this.ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
        bucket = 'chat-documents';
      } else {
        bucket = 'chat-files';
      }
    }
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || '';
      const uniqueName = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${extension}`;

      // Convert URI to blob for web or use FormData for native
      let fileData: any;

      if (Platform.OS === 'web') {
        const response = await fetch(file.uri);
        fileData = await response.blob();
      } else {
        // For React Native, we need to create FormData
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          type: file.type,
          name: file.name,
        } as any);
        fileData = formData;
      }

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(uniqueName, fileData, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path,
        fileName: file.name,
        mimeType: file.type
      };

    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      };
    }
  }

  async deleteFile(path: string, bucket: string = 'chat-files'): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async getFileUrl(path: string, bucket: string = 'chat-files'): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  }

  getFileTypeIcon(mimeType: string): string {
    if (this.ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return 'image';
    }

    switch (mimeType) {
      case 'application/pdf':
        return 'document-text';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'document';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'grid';
      case 'text/plain':
        return 'document-text';
      default:
        return 'attach';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default new FileUploadService();
