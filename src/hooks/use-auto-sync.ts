import { useEffect, useRef } from 'react';
import * as Network from 'expo-network';
import { getUnsyncedDocuments } from '@/storage/localDB';
import { syncDocument } from '@/features/documents/documentService';

/**
 * Hook to automatically sync unsynced documents when network becomes available
 */
export function useAutoSync() {
  const isSyncingRef = useRef(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function checkAndSync() {
      // Prevent multiple simultaneous sync operations
      if (isSyncingRef.current) {
        return;
      }

      try {
        // Check network status
        const networkState = await Network.getNetworkStateAsync();
        
        if (!networkState.isConnected || !networkState.isInternetReachable) {
          return;
        }

        // Start sync operation
        isSyncingRef.current = true;

        // Get all unsynced documents
        const unsyncedDocs = await getUnsyncedDocuments();

        if (unsyncedDocs.length === 0) {
          return;
        }

        console.log(`Auto-sync: Found ${unsyncedDocs.length} unsynced documents`);

        // Sync each document (errors handled silently within syncDocument)
        for (const doc of unsyncedDocs) {
          try {
            await syncDocument(doc);
          } catch (error) {
            // Silently handle errors - syncDocument already logs them
            console.log('Auto-sync: Error syncing document', doc.id);
          }
        }

        console.log('Auto-sync: Completed');
      } catch (error) {
        // Silently handle errors
        console.log('Auto-sync: Network check or sync failed', error);
      } finally {
        isSyncingRef.current = false;
      }
    }

    // Check immediately on mount
    checkAndSync();

    // Then check periodically (every 30 seconds)
    intervalId = setInterval(checkAndSync, 30000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);
}
