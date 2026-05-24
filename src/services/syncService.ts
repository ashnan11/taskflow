import type { AppState } from '../types';
import { getSupabase, isCloudEnabled } from '../config/supabase';

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
  return data.data as AppState;
}

export async function pushCloudState(userId: string, state: AppState): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const payload = {
    user_id: userId,
    data: state,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from(SYNC_TABLE).upsert(payload, { onConflict: 'user_id' });
  return !error;
}

export function mergeStates(local: AppState, remote: AppState): AppState {
  const taskMap = new Map<string, (typeof local.tasks)[0]>();
  local.tasks.forEach((t) => taskMap.set(t.id, t));
  remote.tasks.forEach((rt) => {
    const existing = taskMap.get(rt.id);
    if (!existing || new Date(rt.updatedAt) > new Date(existing.updatedAt)) {
      taskMap.set(rt.id, rt);
    }
  });
  return {
    ...local,
    tasks: Array.from(taskMap.values()).sort((a, b) => a.order - b.order),
    categories: [...new Set([...local.categories, ...remote.categories])],
    allTags: [...new Set([...local.allTags, ...remote.allTags])],
    preferences: { ...remote.preferences, ...local.preferences },
    completionStreak: Math.max(local.completionStreak, remote.completionStreak),
    weeklyCompletions: remote.weeklyCompletions?.length === 7 ? remote.weeklyCompletions : local.weeklyCompletions,
    lastActiveDate: remote.lastActiveDate ?? local.lastActiveDate,
  };
}

export function subscribeToCloudChanges(
  userId: string,
  onUpdate: (state: AppState) => void
): (() => void) | null {
  const supabase = getSupabase();
  if (!supabase) return null;
  const channel = supabase
    .channel(`taskflow-${userId}`)
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
