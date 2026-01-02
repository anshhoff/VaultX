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
    fontSize: 20, // Increased for better hierarchy
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8, // Improved readability
    fontSize: 14, // Slightly larger for better visibility
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  documentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  documentName: {
    fontSize: 18, // Increased for prominence
    fontWeight: '700', // Stronger emphasis
    flex: 1,
    marginRight: 12,
    lineHeight: 24, // Adjusted for better spacing
  },
  syncBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryText: {
    fontSize: 12, // Slightly smaller for muted effect
    fontWeight: '600',
    textTransform: 'capitalize',
    letterSpacing: 0.2,
    opacity: 0.7, // Muted appearance
  },
  dateText: {
    fontSize: 12, // Consistent with category
    opacity: 0.6, // Muted appearance
    fontWeight: '500',
  },
});
