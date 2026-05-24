import { useCallback, useRef, useState } from 'react';
import { Download, Upload, FileJson } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  createBackup,
  downloadBackup,
  mergeAppState,
  parseBackupFile,
} from '../../services/backupService';
import { getAllExtendedForBackup, restoreAllExtended } from '../../utils/extendedStorage';
import type { ImportMode } from '../../types/backup';
import { LoadingButton } from '../ui/LoadingButton';

export function BackupRestorePanel() {
  const { state, showToast } = useApp();
  const [importMode, setImportMode] = useState<ImportMode>('merge');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const backup = createBackup({ app: state, ...getAllExtendedForBackup() });
    downloadBackup(backup);
    showToast('Backup downloaded successfully', 'success');
  }, [state, showToast]);

  const processFile = useCallback(
    async (file: File) => {
      setLoading(true);
      try {
        const text = await file.text();
        const result = parseBackupFile(text);
        if (!result.valid) {
          showToast(result.error, 'error');
          return;
        }
        const { backup } = result;
        const mergedApp = mergeAppState(state, backup.app, importMode);
        window.dispatchEvent(
          new CustomEvent('taskflow:import-state', { detail: { app: mergedApp, mode: importMode } })
        );
        restoreAllExtended({
          voiceSettings: backup.voiceSettings,
          reminderSettings: backup.reminderSettings,
          reminderHistory: backup.reminderHistory ?? [],
          accessibilitySettings: backup.accessibilitySettings,
          syncSettings: backup.syncSettings,
          habits: backup.habits ?? [],
          taskTemplates: backup.taskTemplates ?? [],
          onboarding: backup.onboarding,
        });
        showToast(
          importMode === 'merge'
            ? `Backup merged (${backup.exportedAt.slice(0, 10)})`
            : `Data restored from ${backup.exportedAt.slice(0, 10)}`,
          'success'
        );
      } catch {
        showToast('Failed to import backup', 'error');
      } finally {
        setLoading(false);
      }
    },
    [state, importMode, showToast]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.includes('json') || file?.name.endsWith('.json')) {
        processFile(file);
      } else {
        showToast('Please upload a JSON backup file', 'error');
      }
    },
    [processFile, showToast]
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-1 font-semibold">Data backup & restore</h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
        Export or import your tasks, settings, themes, voice preferences, and reminders.
      </p>

      <div className="mb-4 flex flex-wrap gap-3">
        <LoadingButton onClick={handleExport} variant="secondary">
          <Download className="h-4 w-4" /> Export backup
        </LoadingButton>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Upload className="h-4 w-4" /> Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="sr-only"
          aria-label="Import backup file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = '';
          }}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <FileJson className="mx-auto mb-2 h-8 w-8 text-slate-400" aria-hidden="true" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Drag & drop a TaskFlow JSON backup here
        </p>
        <p className="mt-1 text-xs text-slate-500">Includes auto timestamp on export</p>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-xs font-medium text-slate-500">Import mode</legend>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'merge'}
              onChange={() => setImportMode('merge')}
            />
            Merge with existing
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="importMode"
              checked={importMode === 'replace'}
              onChange={() => setImportMode('replace')}
            />
            Replace all data
          </label>
        </div>
      </fieldset>

      {loading && (
        <p className="mt-3 text-sm text-brand-600" role="status">
          Validating and restoring backup…
        </p>
      )}
    </section>
  );
}
