import { SupabaseClient } from '@supabase/supabase-js';

import { UserPreferences } from '../types/UserPreferences';

const QUEUE_KEY = 'metronome_sync_queue';

interface SyncItem {
  id: string; // uuid
  timestamp: number;
  data: Partial<UserPreferences>;
  type: 'UPDATE' | 'INSERT'; // simplified
}

export const getQueue = (): SyncItem[] => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToQueue = (
  data: Partial<UserPreferences>,
  type: 'UPDATE' | 'INSERT' = 'UPDATE'
) => {
  const queue = getQueue();
  // Simple strategy: Always append, but we could optimize by merging if same ID.
  // Since we only have one user preferences row usually, we can just keep the latest.
  // "Last Write Wins" locally.

  const newItem: SyncItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    data,
    type,
  };

  // Optimization: If we have multiple pending updates for the same user preferences,
  // we might only really need the last one if they are full updates.
  // But to be safe, we'll append.
  queue.push(newItem);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const processQueue = async (supabase: SupabaseClient, userId: string) => {
  if (!navigator.onLine) return; // double check

  const queue = getQueue();
  if (queue.length === 0) return;

  // const failedItems: SyncItem[] = [];

  // We process in order.
  // Optimization: Squash all updates into one if they are all for the user preferences?
  // Yes, if we are just calling upsert on UserPreferences, the last one is what matters.
  // BUT, handling it sequentially ensures correctness.

  // Let's squash locally first to save requests.
  // Find the latest item.
  const latestItem = queue[queue.length - 1]; // Assuming time order

  if (latestItem) {
    // Just send the latest state.
    // NOTE: This assumes 'data' is the FULL object or we merge it.
    // If `savePreferences` sends full object, we are good.
    // If it sends partial, we need to merge.
    // Our `savePreferences` sends essentially a full object (result of configToPreferences).

    try {
      // Conflict Resolution: Check if server has newer data
      try {
        const { data: serverData } = await supabase
          .from('user_preferences')
          .select('updated_at')
          .eq('user_id', userId)
          .single();

        if (serverData && serverData.updated_at) {
          const serverTime = new Date(serverData.updated_at).getTime();
          const localTime = latestItem.timestamp; // When the change happened

          if (serverTime > localTime) {
            console.warn('Conflict detected: Server has newer data. Discarding offline changes.');
            localStorage.removeItem(QUEUE_KEY);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch server data for conflict resolution:', e);
        // If we can't fetch server data, proceed with local update to avoid data loss,
        // but log the error.
      }

      const { error } = await supabase.from('user_preferences').upsert({
        ...latestItem.data,
        user_id: userId,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      // Success! Clear whole queue because we sent the latest state which supersedes all previous.
      localStorage.removeItem(QUEUE_KEY);
      console.log('Processed sync queue successfully.');
    } catch (err) {
      console.error('Failed to sync item:', err);
      // If failed, keep in queue?
      // If we fail on the latest, we probably fail on all.
      // Retry later. Do not clear queue.
    }
  }
};
