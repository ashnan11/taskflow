import { useCallback, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { extendedStorage } from '../utils/extendedStorage';
import { mergeStates, pushCloudState, subscribeToCloudChanges } from '../services/syncService';

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
    const saved = localStorage.getItem('taskflow-app-state');

    if (saved) {
      try {
        stateRef.current = JSON.parse(saved);
      } catch {
        // ignore invalid local state
      }
    }

    await pushCloudState(cloudUserId, stateRef.current);

    const syncSettings = extendedStorage.getSyncSettings();
    extendedStorage.setSyncSettings({
      ...syncSettings,
      lastSyncedAt: new Date().toISOString(),
    });

    showToast('Synced with cloud', 'success');
  } catch {
    showToast('Sync failed', 'error');
  } finally {
    syncingRef.current = false;
  }
}, [isCloudAvailable, getCloudUserId, showToast]);

  useEffect(() => {
    if (!isCloudAvailable) return;

    const cloudUserId = getCloudUserId();

    const unsub = subscribeToCloudChanges(cloudUserId, (remote) => {
      const merged = mergeStates(stateRef.current, remote);
      window.dispatchEvent(new CustomEvent('taskflow:sync-merge', { detail: merged }));
    });

    return () => unsub?.();
  }, [isCloudAvailable, getCloudUserId]);
  useEffect(() => {
    const handleManualSync = () => {
      setTimeout(() => {
        const saved = localStorage.getItem('taskflow-app-state');

        if (saved) {
          try {
            stateRef.current = JSON.parse(saved);
          } catch {
            // ignore
          }
        }

        syncNow();
      }, 1000);
    };

    window.addEventListener('taskflow:manual-sync', handleManualSync);

    return () => {
      window.removeEventListener('taskflow:manual-sync', handleManualSync);
    };
  }, [syncNow]);

  return { syncNow, isSyncing: syncingRef.current };
}