import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { extendedStorage } from '../utils/extendedStorage';
import { mergeStates, pullCloudState, pushCloudState, subscribeToCloudChanges } from '../services/syncService';

export function useCloudSync() {
  const { state, showToast } = useApp();
  const { user, isCloudAvailable } = useAuth();
  const syncingRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  const getCloudUserId = useCallback(() => {
    if (user?.id) return user.id;

    let guestId = localStorage.getItem('taskflow-guest-cloud-id');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('taskflow-guest-cloud-id', guestId);
    }

    return guestId;
  }, [user]);

  const syncNow = useCallback(async () => {
    if (!isCloudAvailable || syncingRef.current) return;

    const cloudUserId = getCloudUserId();

    syncingRef.current = true;
    try {
      const remote = await pullCloudState(cloudUserId);
      if (remote) {
        const merged = mergeStates(stateRef.current, remote);
        window.dispatchEvent(new CustomEvent('taskflow:sync-merge', { detail: merged }));
      }

      await pushCloudState(cloudUserId, stateRef.current);

      const syncSettings = extendedStorage.getSyncSettings();
      extendedStorage.setSyncSettings({ ...syncSettings, lastSyncedAt: new Date().toISOString() });

      showToast('Synced with cloud', 'success');
    } catch {
      showToast('Sync failed', 'error');
    } finally {
      syncingRef.current = false;
    }
  }, [isCloudAvailable, getCloudUserId, showToast]);

  useEffect(() => {
    if (!isCloudAvailable) return;

    const settings = extendedStorage.getSyncSettings();
    if (!settings.autoSync) return;

    syncNow();
    const id = setInterval(syncNow, settings.syncIntervalMs);

    return () => clearInterval(id);
  }, [isCloudAvailable, syncNow]);

  useEffect(() => {
    if (!isCloudAvailable) return;

    const cloudUserId = getCloudUserId();

    const unsub = subscribeToCloudChanges(cloudUserId, (remote) => {
      const merged = mergeStates(stateRef.current, remote);
      window.dispatchEvent(new CustomEvent('taskflow:sync-merge', { detail: merged }));
    });

    return () => unsub?.();
  }, [isCloudAvailable, getCloudUserId]);
  
  return { syncNow, isSyncing: syncingRef.current };
}