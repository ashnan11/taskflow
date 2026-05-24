import { Link } from 'react-router-dom';
import { LogOut, User, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCloudSync } from '../hooks/useCloudSync';
import { extendedStorage } from '../utils/extendedStorage';
import { LoadingButton } from '../components/ui/LoadingButton';

export function ProfilePage() {
  const { user, isGuest, isCloudAvailable, signOut } = useAuth();
  const { syncNow } = useCloudSync();
  const syncSettings = extendedStorage.getSyncSettings();

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h2 className="text-2xl font-bold">Profile</h2>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 dark:bg-brand-900/40">
            <User className="h-7 w-7 text-brand-600" />
          </div>
          <div>
            {isGuest || !user ? (
              <>
                <p className="font-semibold">Guest mode</p>
                <p className="text-sm text-slate-500">Data stored locally on this device</p>
              </>
            ) : (
              <>
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-slate-500">Cloud sync enabled</p>
              </>
            )}
          </div>
        </div>

        {isCloudAvailable && user && (
          <div className="mt-6 space-y-3">
            <p className="text-xs text-slate-500">
              Last synced:{' '}
              {syncSettings.lastSyncedAt
                ? new Date(syncSettings.lastSyncedAt).toLocaleString()
                : 'Never'}
            </p>
            <LoadingButton onClick={() => syncNow()} variant="secondary" className="w-full">
              <Cloud className="h-4 w-4" /> Sync now
            </LoadingButton>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {!user && !isGuest && (
            <Link
              to="/auth"
              className="rounded-xl bg-brand-600 py-2.5 text-center text-sm text-white hover:bg-brand-700"
            >
              Sign in for cloud sync
            </Link>
          )}
          {user && (
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-900/20"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
          <Link to="/" className="text-center text-sm text-slate-500 hover:underline">
            Back to tasks
          </Link>
        </div>
      </section>
    </div>
  );
}
