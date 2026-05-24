import type { VoiceGender, VoiceMessageStyle, VoicePresetId, VoiceSettings } from '../types/settings';
import { VOICE_PRESETS } from '../types/settings';

let speaking = false;
let voicesCache: SpeechSynthesisVoice[] = [];

export function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(settings: VoiceSettings): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (!voices.length) return null;
  if (settings.voiceURI) {
    const exact = voices.find((v) => v.voiceURI === settings.voiceURI);
    if (exact) return exact;
  }
  const lang = navigator.language || 'en-US';
  const filtered = voices.filter((v) => v.lang.startsWith(lang.slice(0, 2)));
  const pool = filtered.length ? filtered : voices;
  if (settings.gender === 'auto') return pool[0] ?? null;
  const isFemale = (v: SpeechSynthesisVoice) =>
    /female|woman|samantha|victoria|zira|susan|karen|moira|fiona/i.test(v.name);
  const isMale = (v: SpeechSynthesisVoice) =>
    /male|man|david|mark|daniel|james|alex|fred|george/i.test(v.name);
  if (settings.gender === 'female') return pool.find(isFemale) ?? pool[0];
  return pool.find(isMale) ?? pool[0];
}

function buildMessage(title: string, style: VoiceMessageStyle): string {
  switch (style) {
    case 'motivational':
      return `You've got this! Time to work on: ${title}`;
    case 'urgent':
      return `Important reminder: ${title}. Please take action now.`;
    case 'calm':
      return `Gentle reminder for ${title}. Whenever you're ready.`;
    default:
      return `Reminder: ${title}`;
  }
}

export function applyPreset(presetId: VoicePresetId): Partial<VoiceSettings> {
  const preset = VOICE_PRESETS.find((p) => p.id === presetId);
  if (!preset) return {};
  return {
    presetId,
    pitch: preset.pitch,
    rate: preset.rate,
    volume: preset.volume,
    messageStyle: preset.messageStyle,
  };
}

export function speakReminder(
  taskTitle: string,
  settings: VoiceSettings,
  onEnd?: () => void
): boolean {
  if (!isSpeechSupported() || !settings.enabled || speaking) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(buildMessage(taskTitle, settings.messageStyle));
  const voice = pickVoice(settings);
  if (voice) utterance.voice = voice;
  utterance.pitch = settings.pitch;
  utterance.rate = settings.rate;
  utterance.volume = settings.volume;
  speaking = true;
  utterance.onend = () => {
    speaking = false;
    onEnd?.();
  };
  utterance.onerror = () => {
    speaking = false;
    onEnd?.();
  };
  window.speechSynthesis.speak(utterance);
  return true;
}

export function testVoice(settings: VoiceSettings): void {
  speakReminder('TaskFlow voice test', settings);
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  speaking = false;
}

export function filterVoicesByGender(voices: SpeechSynthesisVoice[], gender: VoiceGender): SpeechSynthesisVoice[] {
  if (gender === 'auto') return voices;
  const isFemale = (v: SpeechSynthesisVoice) =>
    /female|woman|samantha|victoria|zira|susan|karen|moira|fiona/i.test(v.name);
  const isMale = (v: SpeechSynthesisVoice) =>
    /male|man|david|mark|daniel|james|alex|fred|george/i.test(v.name);
  const filtered = voices.filter(gender === 'female' ? isFemale : isMale);
  return filtered.length ? filtered : voices;
}
