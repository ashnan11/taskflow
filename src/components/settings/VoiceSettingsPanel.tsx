import { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import { extendedStorage } from '../../utils/extendedStorage';
import type { VoicePresetId, VoiceSettings } from '../../types/settings';
import { VOICE_PRESETS, DEFAULT_VOICE_SETTINGS } from '../../types/settings';
import { applyPreset, filterVoicesByGender, loadVoices, stopSpeaking, testVoice } from '../../services/voiceService';
import { useApp } from '../../context/AppContext';
import { LoadingButton } from '../ui/LoadingButton';

export function VoiceSettingsPanel() {
  const { showToast } = useApp();
  const [settings, setSettings] = useState<VoiceSettings>(() => extendedStorage.getVoiceSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const persist = useCallback((next: VoiceSettings) => {
    setSettings(next);
    extendedStorage.setVoiceSettings(next);
  }, []);

  useEffect(() => {
    const load = () => setVoices(loadVoices());
    load();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = load;
    }
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const filtered = filterVoicesByGender(voices, settings.gender);

  const applyPresetId = (id: VoicePresetId) => {
    persist({ ...settings, ...applyPreset(id) });
  };

  const reset = () => {
    stopSpeaking();
    persist(DEFAULT_VOICE_SETTINGS);
    showToast('Voice settings reset', 'info');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 font-semibold">Voice reminders</h3>

      <label className="mb-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => persist({ ...settings, enabled: e.target.checked })}
        />
        Enable voice reminders
      </label>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Preset</label>
          <select
            value={settings.presetId}
            onChange={(e) => applyPresetId(e.target.value as VoicePresetId)}
            className="input"
          >
            {VOICE_PRESETS.filter((p) => p.id !== 'custom').map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Voice gender</label>
          <select
            value={settings.gender}
            onChange={(e) =>
              persist({ ...settings, gender: e.target.value as VoiceSettings['gender'], voiceURI: '' })
            }
            className="input"
          >
            <option value="auto">Auto</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">System voice</label>
          <select
            value={settings.voiceURI}
            onChange={(e) => persist({ ...settings, voiceURI: e.target.value, presetId: 'custom' })}
            className="input"
          >
            <option value="">Default</option>
            {filtered.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {(['pitch', 'rate', 'volume'] as const).map((key) => (
          <div key={key}>
            <label className="mb-1 flex justify-between text-xs text-slate-500">
              <span className="capitalize">{key}</span>
              <span>{settings[key].toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={key === 'volume' ? 0 : 0.5}
              max={key === 'pitch' ? 2 : key === 'rate' ? 2 : 1}
              step={0.05}
              value={settings[key]}
              onChange={(e) =>
                persist({ ...settings, [key]: parseFloat(e.target.value), presetId: 'custom' })
              }
              className="w-full"
            />
          </div>
        ))}

        <div>
          <label className="mb-1 block text-xs text-slate-500">Message style</label>
          <select
            value={settings.messageStyle}
            onChange={(e) =>
              persist({ ...settings, messageStyle: e.target.value as VoiceSettings['messageStyle'] })
            }
            className="input"
          >
            <option value="default">Default</option>
            <option value="calm">Calm</option>
            <option value="motivational">Motivational</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <LoadingButton onClick={() => testVoice(settings)} variant="secondary">
          <Volume2 className="h-4 w-4" /> Test voice
        </LoadingButton>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>
    </section>
  );
}
