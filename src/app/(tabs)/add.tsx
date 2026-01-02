import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { addDocument } from '@/features/documents/documentService';

const CATEGORIES = [
  { id: 'passport', label: 'Passport' },
  { id: 'license', label: 'License' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'other', label: 'Other' },
];

export default function AddDocumentScreen() {
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();

  async function handlePickDocument() {
    setLoading(true);
    try {
      const document = await addDocument(selectedCategory);

      if (document) {
        Alert.alert('Success', `Document "${document.name}" added successfully!`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add document');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Add Document
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Select a category and pick a file
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Category
          </ThemedText>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  {
                    borderColor: Colors[colorScheme ?? 'light'].icon,
                    backgroundColor:
                      selectedCategory === category.id
                        ? Colors[colorScheme ?? 'light'].tint
                        : 'transparent',
                  },
                ]}
                onPress={() => setSelectedCategory(category.id)}
                disabled={loading}>
                <ThemedText
                  style={[
                    styles.categoryText,
                    selectedCategory === category.id && { color: '#fff' },
                  ]}>
                  {category.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.pickButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint },
            loading && styles.buttonDisabled,
          ]}
          onPress={handlePickDocument}
          disabled={loading}>
          <ThemedText style={[styles.pickButtonText, { color: '#fff' }]}>
            {loading ? 'Processing...' : 'Pick Document'}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  webNotice: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  webNoticeText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
