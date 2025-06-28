import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../constants';
import fileUploadService, { FileUploadResult, UploadProgress } from '../services/fileUploadService';
import { RTLView, useRTL } from './RTLText';

interface FileItem {
  id: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface FileUploaderProps {
  onFilesChange: (files: FileItem[]) => void;
  maxFiles?: number;
  allowedTypes?: 'images' | 'documents' | 'all';
  initialFiles?: FileItem[];
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesChange,
  maxFiles = 5,
  allowedTypes = 'all',
  initialFiles = [],
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { isRTL: rtl } = useRTL();
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const updateFiles = (newFiles: FileItem[]) => {
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handlePickImage = async () => {
    if (disabled || files.length >= maxFiles) return;

    try {
      setUploading(true);

      const result = await fileUploadService.pickImage({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.success && result.url) {
        const uploadResult = await fileUploadService.uploadFile(
          {
            uri: result.url,
            name: result.fileName || 'image.jpg',
            type: result.mimeType || 'image/jpeg',
          },
          undefined, // Auto-select bucket
          'training-attachments',
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.success && uploadResult.url) {
          const newFile: FileItem = {
            id: Date.now().toString(),
            name: uploadResult.fileName || 'image.jpg',
            url: uploadResult.url,
            path: uploadResult.path || '',
            type: uploadResult.mimeType || 'image/jpeg',
            size: result.fileSize || 0,
            uploadedAt: new Date().toISOString(),
          };

          updateFiles([...files, newFile]);
        } else {
          Alert.alert(t('common.error'), uploadResult.error || t('fileUpload.uploadFailed'));
        }
      } else if (result.error && !result.error.includes('canceled')) {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(t('common.error'), t('fileUpload.uploadFailed'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handlePickDocument = async () => {
    if (disabled || files.length >= maxFiles) return;

    try {
      setUploading(true);

      const result = await fileUploadService.pickDocument();

      if (result.success && result.url) {
        const uploadResult = await fileUploadService.uploadFile(
          {
            uri: result.url,
            name: result.fileName || 'document',
            type: result.mimeType || 'application/octet-stream',
          },
          undefined, // Auto-select bucket
          'training-attachments',
          (progress) => setUploadProgress(progress)
        );

        if (uploadResult.success && uploadResult.url) {
          const newFile: FileItem = {
            id: Date.now().toString(),
            name: uploadResult.fileName || 'document',
            url: uploadResult.url,
            path: uploadResult.path || '',
            type: uploadResult.mimeType || 'application/octet-stream',
            size: result.fileSize || 0,
            uploadedAt: new Date().toISOString(),
          };

          updateFiles([...files, newFile]);
        } else {
          Alert.alert(t('common.error'), uploadResult.error || t('fileUpload.uploadFailed'));
        }
      } else if (result.error && !result.error.includes('canceled')) {
        Alert.alert(t('common.error'), result.error);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(t('common.error'), t('fileUpload.uploadFailed'));
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    Alert.alert(
      t('fileUpload.removeFile'),
      t('fileUpload.removeFileConfirm'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.remove'),
          style: 'destructive',
          onPress: () => {
            const fileToRemove = files.find(f => f.id === fileId);
            if (fileToRemove) {
              // Delete from storage
              fileUploadService.deleteFile(fileToRemove.path);
              // Remove from state
              updateFiles(files.filter(f => f.id !== fileId));
            }
          },
        },
      ]
    );
  };

  const renderFileItem = (file: FileItem) => {
    const isImage = file.type.startsWith('image/');
    const icon = fileUploadService.getFileTypeIcon(file.type);
    const size = fileUploadService.formatFileSize(file.size);

    return (
      <View key={file.id} style={styles.fileItem}>
        <RTLView style={styles.fileContent}>
          <View style={styles.fileIcon}>
            {isImage ? (
              <Image source={{ uri: file.url }} style={styles.thumbnail} />
            ) : (
              <Ionicons name={icon as any} size={24} color={COLORS.primary} />
            )}
          </View>

          <View style={styles.fileInfo}>
            <Text style={styles.fileName} numberOfLines={1}>
              {file.name}
            </Text>
            <Text style={styles.fileSize}>{size}</Text>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFile(file.id)}
            disabled={disabled}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </RTLView>
      </View>
    );
  };

  const canAddMore = files.length < maxFiles && !disabled;

  return (
    <View style={styles.container}>
      {/* Upload Buttons */}
      {canAddMore && (
        <RTLView style={styles.uploadButtons}>
          {(allowedTypes === 'images' || allowedTypes === 'all') && (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handlePickImage}
              disabled={uploading}
            >
              <Ionicons name="camera" size={20} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>{t('fileUpload.addImage')}</Text>
            </TouchableOpacity>
          )}

          {(allowedTypes === 'documents' || allowedTypes === 'all') && (
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handlePickDocument}
              disabled={uploading}
            >
              <Ionicons name="document" size={20} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>{t('fileUpload.addDocument')}</Text>
            </TouchableOpacity>
          )}
        </RTLView>
      )}

      {/* Upload Progress */}
      {uploading && (
        <View style={styles.uploadProgress}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.uploadProgressText}>
            {uploadProgress
              ? `${t('fileUpload.uploading')} ${Math.round(uploadProgress.percentage)}%`
              : t('fileUpload.uploading')
            }
          </Text>
        </View>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <ScrollView style={styles.filesList} showsVerticalScrollIndicator={false}>
          {files.map(renderFileItem)}
        </ScrollView>
      )}

      {/* Info Text */}
      <Text style={styles.infoText}>
        {t('fileUpload.maxFiles', { count: maxFiles })} • {t('fileUpload.maxSize')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.md,
  },
  uploadButtons: {
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: SIZES.radiusMedium,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
  },
  uploadProgressText: {
    color: COLORS.light.textSecondary,
    fontSize: SIZES.caption,
  },
  filesList: {
    maxHeight: 200,
  },
  fileItem: {
    backgroundColor: COLORS.light.surface,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  fileContent: {
    alignItems: 'center',
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusSmall,
    backgroundColor: COLORS.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusSmall,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.xs,
  },
  fileSize: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
  removeButton: {
    padding: SIZES.xs,
  },
  infoText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
});
