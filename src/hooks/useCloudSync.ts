import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { extendedStorage } from '../utils/extendedStorage';
import { mergeStates, pullCloudState, pushCloudState, subscribeToCloudChanges } from '../services/syncService';

export function useCloudSync() {
  const { state, showToast } = useApp();
  const { user, isGuest, isCloudAvailable } = useAuth();
  const syncingRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const syncNow = useCallback(async () => {
    if (!user || isGuest || !isCloudAvailable || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const remote = await pullCloudState(user.id);
      if (remote) {
        const merged = mergeStates(stateRef.current, remote);
        window.dispatchEvent(new CustomEvent('taskflow:sync-merge', { detail: merged }));
      }
      await pushCloudState(user.id, stateRef.current);
      const syncSettings = extendedStorage.getSyncSettings();
      extendedStorage.setSyncSettings({ ...syncSettings, lastSyncedAt: new Date().toISOString() });
      showToast('Synced with cloud', 'success');
    } catch {
      showToast('Sync failed', 'error');
    } finally {
      syncingRef.current = false;
    }
  }, [user, isGuest, isCloudAvailable, showToast]);

  useEffect(() => {
    if (!user || isGuest || !isCloudAvailable) return;
    const settings = extendedStorage.getSyncSettings();
    if (!settings.autoSync) return;
    syncNow();
    const id = setInterval(syncNow, settings.syncIntervalMs);
    return () => clearInterval(id);
  }, [user, isGuest, isCloudAvailable, syncNow]);

  useEffect(() => {
    if (!user || isGuest || !isCloudAvailable) return;
    const unsub = subscribeToCloudChanges(user.id, (remote) => {
      const merged = mergeStates(stateRef.current, remote);
      window.dispatchEvent(new CustomEvent('taskflow:sync-merge', { detail: merged }));
    });
    return () => unsub?.();
  }, [user, isGuest, isCloudAvailable]);

  return { syncNow, isSyncing: syncingRef.current };
}
