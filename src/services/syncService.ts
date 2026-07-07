import type { AppState } from '../types';
import { getSupabase, isCloudEnabled } from '../config/supabase';
import { removeDemoTasksFromState } from '../utils/storage';

const SYNC_TABLE = 'taskflow_user_data';

export interface CloudPayload {
  user_id: string;
  data: AppState;
  updated_at: string;
}

export async function pullCloudState(userId: string): Promise<AppState | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(SYNC_TABLE)
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return removeDemoTasksFromState(data.data as AppState) as AppState;
}

export async function pushCloudState(userId: string, state: AppState): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const cleanState = removeDemoTasksFromState(state) as AppState;

  const payload = {
    user_id: userId,
    data: cleanState,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from(SYNC_TABLE).upsert(payload, {
    onConflict: 'user_id',
  });

  return !error;
}

export function mergeStates(local: AppState, remote: AppState): AppState {
  const cleanLocal = removeDemoTasksFromState(local) as AppState;
  const cleanRemote = removeDemoTasksFromState(remote) as AppState;

  return {
    ...cleanLocal,
    tasks: cleanLocal.tasks,
    categories: [...new Set([...cleanRemote.categories, ...cleanLocal.categories])],
    allTags: [...new Set([...cleanRemote.allTags, ...cleanLocal.allTags])],
    preferences: { ...cleanRemote.preferences, ...cleanLocal.preferences },
    completionStreak: Math.max(cleanLocal.completionStreak, cleanRemote.completionStreak),
    weeklyCompletions:
      cleanLocal.weeklyCompletions?.length === 7
        ? cleanLocal.weeklyCompletions
        : cleanRemote.weeklyCompletions,
    lastActiveDate: cleanLocal.lastActiveDate ?? cleanRemote.lastActiveDate,
  };
}

export function subscribeToCloudChanges(
  userId: string,
  onUpdate: (state: AppState) => void
): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const channel = supabase
    .channel(`taskflow-${userId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: SYNC_TABLE,
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const remote = await pullCloudState(userId);
        if (remote) onUpdate(remote);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export { isCloudEnabled };