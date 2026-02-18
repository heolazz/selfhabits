import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../components/Toast';
import { translations } from '../constants/translations';

export interface SyncItem {
    id: string; // Queue Item ID
    table: string;
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    payload: any;
    matchField?: string; // Field to match for UPDATE/DELETE (usually 'id')
    matchValue?: string | number; // Value to match (Real ID or Temp ID)
}

export const generateTempId = () => 'temp-' + Date.now() + Math.random().toString(36).substr(2, 5);

export const useSync = (enableAutoSync = false) => {
    const { currentUser, fetchData, isOffline, lang } = useApp();
    const { showToast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);

    // Add item to queue with Smart Coalescing
    const addToQueue = (item: Omit<SyncItem, 'id'>) => {
        const queueStr = localStorage.getItem('zenith_offline_queue');
        let queue: SyncItem[] = queueStr ? JSON.parse(queueStr) : [];

        // 1. Coalesce UPDATE into pending INSERT
        if (item.type === 'UPDATE' && item.matchValue) {
            const insertIndex = queue.findIndex(q =>
                q.type === 'INSERT' &&
                q.table === item.table &&
                q.matchValue === item.matchValue
            );
            if (insertIndex !== -1) {
                // Merge payload into the pending insert
                queue[insertIndex].payload = { ...queue[insertIndex].payload, ...item.payload };
                localStorage.setItem('zenith_offline_queue', JSON.stringify(queue));
                return;
            }
        }

        // 2. Coalesce DELETE into pending INSERT
        if (item.type === 'DELETE' && item.matchValue) {
            const insertIndex = queue.findIndex(q =>
                q.type === 'INSERT' &&
                q.table === item.table &&
                q.matchValue === item.matchValue
            );
            if (insertIndex !== -1) {
                // Remove the pending insert entirely
                queue.splice(insertIndex, 1);
                localStorage.setItem('zenith_offline_queue', JSON.stringify(queue));
                return;
            }
        }

        // 3. Add new item
        const newItem: SyncItem = {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        };
        queue.push(newItem);
        localStorage.setItem('zenith_offline_queue', JSON.stringify(queue));
    };

    const processItem = async (item: SyncItem): Promise<any> => {
        try {
            if (item.type === 'INSERT') {
                // For INSERT, we ignore matchField/matchValue in the query itself (DB generates ID)
                // But we passed matchValue (tempId) for queue management.
                // We send payload as is.
                const { error } = await supabase.from(item.table).insert([item.payload]);
                return error;
            } else if (item.type === 'UPDATE') {
                const { error } = await supabase.from(item.table).update(item.payload).eq(item.matchField || 'id', item.matchValue);
                return error;
            } else if (item.type === 'DELETE') {
                const { error } = await supabase.from(item.table).delete().eq(item.matchField || 'id', item.matchValue);
                return error;
            }
        } catch (e) {
            return e;
        }
        return null;
    };

    const processQueue = useCallback(async () => {
        if (!currentUser || isSyncing) return;

        const queueStr = localStorage.getItem('zenith_offline_queue');
        if (!queueStr) return;

        let initialQueue: SyncItem[] = JSON.parse(queueStr);
        if (initialQueue.length === 0) return;

        setIsSyncing(true);
        showToast(lang === 'id' ? 'Menyinkronkan data...' : 'Syncing data...', 'info');

        // We iterate carefully.
        // Strategy: Try to sync the head of the queue.
        // If success: Remove it.
        // If fail: Move it to the end (Rotate) so we can try others, but preventing infinite loop if persistent error.
        // Limit: Try 'initialQueue.length' times.

        let attempts = 0;
        const maxAttempts = initialQueue.length + 2; // buffer

        while (attempts < maxAttempts) {
            // Re-read queue for safety
            const currentStr = localStorage.getItem('zenith_offline_queue');
            let currentQueue: SyncItem[] = currentStr ? JSON.parse(currentStr) : [];

            if (currentQueue.length === 0) break;

            const item = currentQueue[0];
            const error = await processItem(item);

            // Re-read queue again (in case user added something while we awaited)
            const postStr = localStorage.getItem('zenith_offline_queue');
            let postQueue: SyncItem[] = postStr ? JSON.parse(postStr) : [];

            // Find item in postQueue (it should be at 0 usually)
            const index = postQueue.findIndex(q => q.id === item.id);
            if (index === -1) {
                // Item was removed by someone else? Continue.
                continue;
            }

            if (!error) {
                // Success: Remove item
                postQueue.splice(index, 1);
            } else {
                console.error('Sync failed for item', item, error);
                // Failure: Rotate (Move to end)
                const [failedItem] = postQueue.splice(index, 1);
                postQueue.push(failedItem);
            }

            localStorage.setItem('zenith_offline_queue', JSON.stringify(postQueue));

            // If we successfully cleared everything, break
            if (postQueue.length === 0) break;

            attempts++;
        }

        // Final Status
        const finalStr = localStorage.getItem('zenith_offline_queue');
        const finalQueue = finalStr ? JSON.parse(finalStr) : [];

        if (finalQueue.length === 0) {
            localStorage.removeItem('zenith_offline_queue');
            showToast(lang === 'id' ? 'Sinkronisasi selesai! ✅' : 'Sync complete! ✅', 'success');
            await fetchData(); // Refresh data from server
        } else {
            showToast(lang === 'id' ? 'Sebagian data gagal disinkronkan' : 'Some items failed to sync', 'error');
        }

        setIsSyncing(false);
    }, [currentUser, fetchData, lang, showToast, isSyncing]);

    // Auto-sync effect
    useEffect(() => {
        if (enableAutoSync && !isOffline && currentUser) {
            processQueue();
        }
    }, [enableAutoSync, isOffline, currentUser]);

    return { addToQueue, isSyncing };
};
