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
    flex: 1, // Center content vertically
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    marginBottom: 16, // Increased spacing for clarity
    fontSize: 22, // Clear heading
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8, // Improved readability
    marginBottom: 32, // Better spacing
    fontSize: 14,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12, // Reduced spacing for compactness
    fontSize: 16,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 24, // More padding for distinction
    paddingVertical: 14,
    borderRadius: 12, // Softer corners
    borderWidth: 1,
    minWidth: 120, // Larger buttons
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickButton: {
    height: 56, // Larger button for prominence
    borderRadius: 12, // Softer corners
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40, // More spacing for emphasis
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  pickButtonText: {
    fontSize: 18, // Larger text for prominence
    fontWeight: '700',
  },
});
