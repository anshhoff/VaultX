import { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, Platform, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { deleteDocument } from '@/storage/localDB';
import { openDocument } from '@/services/documentOpener';
import { getDocuments, UnifiedDocument, getDocumentUrl } from '@/services/documentPlatform';
import { deleteCloudDocument } from '@/services/cloudDocuments';
import { supabase } from '@/services/supabase';

export default function HomeScreen() {
  const [documents, setDocuments] = useState<UnifiedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [])
  );

  async function loadDocuments() {
    setLoading(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error refreshing documents:', error);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleOpenDocument(document: UnifiedDocument) {
    try {
      if (Platform.OS === 'web') {
        // On web, open the cloud storage URL
        const signedUrl = await getDocumentUrl(document.local_path);
        await Linking.openURL(signedUrl);
      } else {
        // On native, check if it's a local file or cloud file
        if (document.local_path.startsWith('file://') || document.local_path.includes('/documents/')) {
          // Local file
          await openDocument(document.local_path);
        } else {
          // Cloud file - get signed URL
          const signedUrl = await getDocumentUrl(document.local_path);
          await Linking.openURL(signedUrl);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to open document');
    }
  }

  async function handleDeleteDocument(document: UnifiedDocument) {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${document.name}"?\n\nThis action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              
              if (!session?.user) {
                Alert.alert('Error', 'Not authenticated');
                return;
              }

              const userId = session.user.id;
              const isLocalFile = Platform.OS !== 'web' && 
                                 (document.local_path.startsWith('file://') || 
                                  document.local_path.includes('/documents/'));

              if (isLocalFile) {
                // Delete local file
                try {
                  await FileSystem.deleteAsync(document.local_path);
                } catch (fileError) {
                  console.warn('Could not delete local file:', fileError);
                }
                
                // Delete from local database
                await deleteDocument(document.id);
              }

              // Delete from cloud (if synced)
              if (document.synced === 1) {
                try {
                  await deleteCloudDocument(document.id, userId);
                  // Delete from storage
                  const storagePath = isLocalFile ? 
                    `${userId}/${document.id}.${document.name.split('.').pop()}` : 
                    document.local_path;
                  await supabase.storage.from('documents').remove([storagePath]);
                } catch (cloudError) {
                  console.warn('Could not delete from cloud:', cloudError);
                }
              }
              
              // Reload documents list
              await loadDocuments();
              
              Alert.alert('Success', 'Document deleted successfully');
            } catch (error: any) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', error.message || 'Failed to delete document');
            }
          },
        },
      ]
    );
  }

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function getFileIcon(fileName: string): { name: string; color: string } {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return { name: 'picture-as-pdf', color: '#d32f2f' };
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { name: 'image', color: '#1976d2' };
      default:
        return { name: 'insert-drive-file', color: Colors[colorScheme ?? 'light'].icon };
    }
  }

  function renderDocument({ item }: { item: UnifiedDocument }) {
    const fileIcon = getFileIcon(item.name);

    return (
      <TouchableOpacity
        style={[
          styles.documentCard,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            borderColor: Colors[colorScheme ?? 'light'].icon,
          },
        ]}
        onPress={() => handleOpenDocument(item)}
        onLongPress={() => handleDeleteDocument(item)}
        activeOpacity={0.7}>
        <View style={styles.documentHeader}>
          <MaterialIcons name={fileIcon.name as any} size={32} color={fileIcon.color} />
          <View style={styles.documentContent}>
            <View style={styles.documentTitleRow}>
              <ThemedText type="defaultSemiBold" style={styles.documentName}>
                {item.name}
              </ThemedText>
              <View
                style={[
                  styles.syncBadge,
                  {
                    backgroundColor:
                      item.synced === 1
                        ? 'rgba(76, 175, 80, 0.1)'
                        : 'rgba(158, 158, 158, 0.1)',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.syncText,
                    { color: item.synced === 1 ? '#4CAF50' : '#9E9E9E' },
                  ]}>
                  {item.synced === 1 ? 'Synced' : 'Local'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.documentInfo}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: Colors[colorScheme ?? 'light'].tint },
                ]}>
                <ThemedText style={[styles.categoryText, { color: '#fff' }]}>
                  {item.category}
                </ThemedText>
              </View>
              <ThemedText style={styles.dateText}>
                {formatDate(item.created_at)}
              </ThemedText>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        </View>
      </ThemedView>
    );
  }

  if (documents.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <ThemedText type="title" style={styles.title}>
            No Documents
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Add your first document using the Add tab
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={documents}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors[colorScheme ?? 'light'].tint}
            colors={[Colors[colorScheme ?? 'light'].tint]}
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  documentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  documentContent: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  documentName: {
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  syncBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  syncText: {
    fontSize: 10,
    fontWeight: '600',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
});
