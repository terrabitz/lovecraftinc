import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class Control {
  textContent = '';
  disabled = false;
  title = '';
  attributes = new Map<string, string>();

  closest() { return this; }
  matches() { return this.disabled; }
  hasAttribute(name: string) { return this.attributes.has(name); }
  setAttribute(name: string, value: string) { this.attributes.set(name, value); }
}

function audioParam() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
  };
}

function audioNode() {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    type: '',
    curve: null as Float32Array | null,
    oversample: 'none',
    onended: null as null | (() => void),
    gain: audioParam(),
    frequency: audioParam(),
    detune: audioParam(),
  };
}

describe('interface audio', () => {
  let audio: typeof import('../interface-audio');
  let documentEvents: EventTarget & { hidden: boolean };
  let windowEvents: EventTarget;
  let toggle: Control;
  let storage: Map<string, string>;
  let gains: ReturnType<typeof audioNode>[];
  let voices: ReturnType<typeof audioNode>[];
  let sources: ReturnType<typeof audioNode>[];
  let shapers: ReturnType<typeof audioNode>[];
  let samples: Float32Array;
  let resume: ReturnType<typeof vi.fn>;
  let AudioContextMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    storage = new Map();
    toggle = new Control();
    toggle.setAttribute('data-sound-toggle', '');
    documentEvents = Object.assign(new EventTarget(), { hidden: false });
    windowEvents = new EventTarget();
    vi.stubGlobal('Element', Control);
    vi.stubGlobal('document', Object.assign(documentEvents, {
      querySelectorAll: vi.fn(() => [toggle]),
    }));
    vi.stubGlobal('window', windowEvents);
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    });
    gains = [];
    voices = [];
    sources = [];
    shapers = [];
    samples = new Float32Array(3120);
    resume = vi.fn().mockResolvedValue(undefined);
    AudioContextMock = vi.fn(function () {
      return {
        currentTime: 1,
        sampleRate: 48000,
        state: 'suspended',
        destination: {},
        resume,
        createGain: () => { const node = audioNode(); gains.push(node); return node; },
        createOscillator: () => { const node = audioNode(); voices.push(node); return node; },
        createBufferSource: () => { const node = audioNode(); sources.push(node); return node; },
        createWaveShaper: () => { const node = audioNode(); shapers.push(node); return node; },
        createBuffer: vi.fn(() => ({ getChannelData: () => samples })),
      };
    });
    vi.stubGlobal('AudioContext', AudioContextMock);
    audio = await import('../interface-audio');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function click(control = new Control()) {
    const event = new Event('click');
    Object.defineProperty(event, 'target', { value: control });
    documentEvents.dispatchEvent(event);
  }

  it('initializes once without autoplay and plays one quiet click per activation', () => {
    audio.initInterfaceAudio();
    audio.initInterfaceAudio();
    expect(AudioContextMock).not.toHaveBeenCalled();
    click();
    expect(AudioContextMock).toHaveBeenCalledTimes(1);
    expect(sources).toHaveLength(1);
    expect(resume).toHaveBeenCalled();
    expect(gains[0].gain.value).toBe(0.5);
    expect(Math.max(...samples.map(Math.abs))).toBeLessThan(0.17);
    expect(samples.some(sample => sample !== 0)).toBe(true);
    click();
    expect(AudioContextMock).toHaveBeenCalledTimes(1);
    expect(sources).toHaveLength(2);
  });

  it('ignores disabled controls', () => {
    audio.initInterfaceAudio();
    const control = new Control();
    control.disabled = true;
    click(control);
    expect(AudioContextMock).not.toHaveBeenCalled();
  });

  it('restores mute before any audio is created', () => {
    storage.set('soundMuted', 'true');
    audio.initInterfaceAudio();
    click();
    audio.startLoadingHum();
    expect(AudioContextMock).not.toHaveBeenCalled();
    expect(toggle.attributes.get('aria-pressed')).toBe('false');
  });

  it('mutes immediately, persists preference, and confirms unmuting with a click', () => {
    audio.initInterfaceAudio();
    audio.startLoadingHum();
    click(toggle);
    expect(storage.get('soundMuted')).toBe('true');
    expect(gains[0].gain.setValueAtTime).toHaveBeenCalledWith(0, 1);
    expect(voices.every(voice => voice.stop.mock.calls.length === 1)).toBe(true);
    click();
    expect(sources).toHaveLength(0);
    click(toggle);
    expect(storage.get('soundMuted')).toBe('false');
    expect(toggle.attributes.get('aria-label')).toBe('Mute sound effects');
    expect(sources).toHaveLength(1);
  });

  it('fades a low hum in and out, without accumulating loops', () => {
    audio.initInterfaceAudio();
    audio.startLoadingHum();
    expect(voices.map(voice => voice.frequency.value)).toEqual([60, 120, 181]);
    expect(gains[1].gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.035, 1.18);
    audio.startLoadingHum();
    expect(voices.slice(0, 3).every(voice => voice.stop.mock.calls.length === 1)).toBe(true);
    audio.stopLoadingHum();
    audio.stopLoadingHum();
    expect(voices.every(voice => voice.stop.mock.calls.length === 1)).toBe(true);
    expect(gains[2].gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1.08);
  });

  it.each(['astro:before-swap', 'visibilitychange', 'pagehide'])('stops hum on %s', event => {
    audio.initInterfaceAudio();
    audio.startLoadingHum();
    documentEvents.hidden = true;
    (event === 'pagehide' ? windowEvents : documentEvents).dispatchEvent(new Event(event));
    expect(voices.every(voice => voice.stop.mock.calls.length === 1)).toBe(true);
  });

  it('keeps preferences and click listeners across Astro swaps without duplication', () => {
    audio.initInterfaceAudio();
    click(toggle);
    toggle.attributes.set('aria-pressed', 'true');
    documentEvents.dispatchEvent(new Event('astro:after-swap'));
    expect(toggle.attributes.get('aria-pressed')).toBe('false');
    click(toggle);
    expect(sources).toHaveLength(1);
  });

  it('logs unavailable audio once without breaking button actions', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    AudioContextMock.mockImplementation(function () { throw new Error('Audio unavailable'); });
    audio.initInterfaceAudio();
    expect(() => click()).not.toThrow();
    click();
    expect(warning).toHaveBeenCalledTimes(1);
  });

  it('handles rejected autoplay promises without an unhandled rejection', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    resume.mockRejectedValue(new Error('Audio blocked'));
    audio.initInterfaceAudio();
    audio.startLoadingHum();
    await Promise.resolve();
    expect(warning).toHaveBeenCalledTimes(1);
    expect(voices.every(voice => voice.stop.mock.calls.length === 1)).toBe(true);
  });

  it('logs storage failures while leaving the toggle functional', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('Storage blocked'); },
      setItem: () => { throw new Error('Storage blocked'); },
    });
    audio.initInterfaceAudio();
    click(toggle);
    expect(toggle.attributes.get('aria-pressed')).toBe('false');
    expect(warning).toHaveBeenCalledTimes(2);
  });

  it('plays quiet, clean RPG dialog blips until stopped', () => {
    vi.useFakeTimers();
    audio.initInterfaceAudio();
    audio.startDialogBlips();
    vi.advanceTimersByTime(70 * 3);
    expect(voices).toHaveLength(4);
    expect(voices.every(voice => voice.type === 'square')).toBe(true);
    expect(shapers).toHaveLength(0);
    const pitches = voices.map(voice => voice.frequency.setValueAtTime.mock.calls[0][0]);
    expect(pitches.every(pitch => pitch >= 520 && pitch <= 610)).toBe(true);
    expect(gains.slice(1).every(gain => gain.gain.linearRampToValueAtTime.mock.calls[0][0] <= 0.03)).toBe(true);
    audio.stopDialogBlips();
    vi.advanceTimersByTime(500);
    expect(voices).toHaveLength(4);
  });

  it('distorts horror dialog through a shared waveshaper curve', () => {
    vi.useFakeTimers();
    audio.initInterfaceAudio();
    audio.startDialogBlips(true);
    vi.advanceTimersByTime(40);
    expect(voices).toHaveLength(2);
    expect(voices.every(voice => voice.type === 'sawtooth')).toBe(true);
    expect(voices.every(voice => voice.frequency.exponentialRampToValueAtTime.mock.calls.length === 1)).toBe(true);
    expect(shapers).toHaveLength(2);
    expect(shapers[0].curve).toBeInstanceOf(Float32Array);
    expect(shapers[1].curve).toBe(shapers[0].curve);
    expect(voices[0].connect).toHaveBeenCalledWith(shapers[0]);
    audio.stopDialogBlips();
  });

  it('restarting dialog replaces the previous blip loop', () => {
    vi.useFakeTimers();
    audio.initInterfaceAudio();
    audio.startDialogBlips(true);
    audio.startDialogBlips();
    vi.advanceTimersByTime(70);
    expect(voices.map(voice => voice.type)).toEqual(['sawtooth', 'square', 'square']);
    audio.stopDialogBlips();
  });

  it.each(['mute', 'visibilitychange', 'pagehide'])('stops dialog blips on %s', trigger => {
    vi.useFakeTimers();
    audio.initInterfaceAudio();
    audio.startDialogBlips();
    if (trigger === 'mute') click(toggle);
    else {
      documentEvents.hidden = true;
      (trigger === 'pagehide' ? windowEvents : documentEvents).dispatchEvent(new Event(trigger));
    }
    const count = voices.length;
    vi.advanceTimersByTime(500);
    expect(voices).toHaveLength(count);
  });

  it('keeps dialog silent while muted', () => {
    vi.useFakeTimers();
    storage.set('soundMuted', 'true');
    audio.initInterfaceAudio();
    audio.startDialogBlips(true);
    vi.advanceTimersByTime(200);
    expect(AudioContextMock).not.toHaveBeenCalled();
    audio.stopDialogBlips();
  });
});
