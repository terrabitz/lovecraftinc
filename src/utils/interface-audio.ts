const STORAGE_KEY = 'soundMuted';
const CONTROL_SELECTOR = 'button, a[href], [role="button"], input[type="button"], input[type="submit"], input[type="checkbox"], input[type="radio"], summary, [data-sound-click]';
const DIALOG_BLIP_INTERVAL_MS = 70;
const HORROR_BLIP_INTERVAL_MS = 40;

let context: AudioContext | undefined;
let output: GainNode | undefined;
let clickBuffer: AudioBuffer | undefined;
let distortionCurve: Float32Array<ArrayBuffer> | undefined;
let hum: { voices: OscillatorNode[]; gain: GainNode } | undefined;
let dialogTimer: ReturnType<typeof setInterval> | undefined;
let muted = false;
let initialized = false;
let unavailable = false;

export function initInterfaceAudio() {
  if (initialized) return;
  initialized = true;
  try {
    muted = localStorage.getItem(STORAGE_KEY) === 'true';
  } catch (error) {
    console.warn('Unable to read sound preference:', error);
  }
  updateToggles();
  // Capture before controls disable themselves or replace their DOM.
  document.addEventListener('click', handleClick, true);
  document.addEventListener('astro:after-swap', updateToggles);
  document.addEventListener('astro:before-swap', stopLoadingHum);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAllSounds();
  });
  window.addEventListener('pagehide', stopAllSounds);
}

export function startLoadingHum() {
  stopLoadingHum();
  const audio = getAudioContext();
  if (!audio || !output) return;

  const now = audio.currentTime;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.035, now + 0.18);
  gain.connect(output);
  const voices = [60, 120, 181].map((frequency, index) => {
    const voice = audio.createOscillator();
    voice.type = 'sine';
    voice.frequency.value = frequency;
    voice.detune.value = index * 2;
    voice.connect(gain);
    voice.start(now);
    return voice;
  });
  hum = { voices, gain };
}

export function stopLoadingHum() {
  if (!hum || !context) return;
  const { voices, gain } = hum;
  hum = undefined;
  const now = context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.08);
  voices.forEach(voice => {
    voice.onended = () => {
      voice.disconnect();
      gain.disconnect();
    };
    voice.stop(now + 0.08);
  });
}

export function startDialogBlips(horror = false) {
  stopDialogBlips();
  playDialogBlip(horror);
  dialogTimer = setInterval(
    () => playDialogBlip(horror),
    horror ? HORROR_BLIP_INTERVAL_MS : DIALOG_BLIP_INTERVAL_MS,
  );
}

export function stopDialogBlips() {
  if (dialogTimer === undefined) return;
  clearInterval(dialogTimer);
  dialogTimer = undefined;
}

function stopAllSounds() {
  stopLoadingHum();
  stopDialogBlips();
}

function handleClick(event: MouseEvent) {
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest(CONTROL_SELECTOR);
  if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;

  if (control.hasAttribute('data-sound-toggle')) {
    muted = !muted;
    if (output && context) output.gain.setValueAtTime(muted ? 0 : 0.5, context.currentTime);
    if (muted) stopAllSounds();
    try {
      localStorage.setItem(STORAGE_KEY, String(muted));
    } catch (error) {
      console.warn('Unable to save sound preference:', error);
    }
    updateToggles();
  }
  playClick();
}

function updateToggles() {
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach(toggle => {
    toggle.setAttribute('aria-pressed', String(!muted));
    toggle.setAttribute('aria-label', muted ? 'Enable sound effects' : 'Mute sound effects');
    toggle.title = muted ? 'Enable sound effects' : 'Mute sound effects';
  });
}

function playClick() {
  const audio = getAudioContext();
  if (!audio || !output) return;
  clickBuffer ??= createClickBuffer(audio);
  const source = audio.createBufferSource();
  source.buffer = clickBuffer;
  source.connect(output);
  source.onended = () => source.disconnect();
  source.start();
}

function playDialogBlip(horror: boolean) {
  const audio = getAudioContext();
  if (!audio || !output) return;
  const now = audio.currentTime;
  const duration = horror ? 0.07 : 0.045;
  const voice = audio.createOscillator();
  const gain = audio.createGain();
  // Slight random pitch per syllable gives the classic RPG "speech" feel.
  const pitch = horror ? 70 + Math.random() * 160 : 520 + Math.random() * 90;
  voice.type = horror ? 'sawtooth' : 'square';
  voice.frequency.setValueAtTime(pitch, now);
  if (horror) {
    voice.frequency.exponentialRampToValueAtTime(pitch * 0.45, now + duration);
    voice.detune.setValueAtTime((Math.random() - 0.5) * 600, now);
  }
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(horror ? 0.05 : 0.03, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  let shaper: WaveShaperNode | undefined;
  if (horror) {
    shaper = audio.createWaveShaper();
    shaper.curve = distortionCurve ??= createDistortionCurve();
    shaper.oversample = '2x';
    voice.connect(shaper);
    shaper.connect(gain);
  } else {
    voice.connect(gain);
  }
  gain.connect(output);
  voice.onended = () => {
    voice.disconnect();
    shaper?.disconnect();
    gain.disconnect();
  };
  voice.start(now);
  voice.stop(now + duration);
}

function getAudioContext(): AudioContext | undefined {
  if (muted || unavailable) return;
  try {
    context ??= new AudioContext();
    if (!output) {
      output = context.createGain();
      output.gain.value = 0.5;
      output.connect(context.destination);
    }
    // Audio is only requested inside user gestures, never on page load.
    if (context.state === 'suspended') {
      void context.resume().catch(reportAudioError);
    }
    return context;
  } catch (error) {
    reportAudioError(error);
    return undefined;
  }
}

function reportAudioError(error: unknown) {
  if (unavailable) return;
  unavailable = true;
  stopAllSounds();
  console.warn('Interface sound effects are unavailable:', error);
}

function createClickBuffer(audio: AudioContext): AudioBuffer {
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * 0.065), audio.sampleRate);
  const samples = buffer.getChannelData(0);
  // Two damped transients imitate a plastic mouse switch, not an electronic beep.
  for (let index = 0; index < samples.length; index++) {
    const time = index / audio.sampleRate;
    const press = Math.exp(-time * 240);
    const releaseTime = time - 0.018;
    const release = releaseTime >= 0 ? 0.45 * Math.exp(-releaseTime * 300) : 0;
    const noise = Math.random() * 2 - 1;
    samples[index] = (noise * 0.65 + Math.sin(2 * Math.PI * 1800 * time) * 0.35)
      * (press + release) * 0.16;
  }
  return buffer;
}

function createDistortionCurve(): Float32Array<ArrayBuffer> {
  const samples = 1024;
  const amount = 60;
  const curve = new Float32Array(samples);
  for (let index = 0; index < samples; index++) {
    const x = (index * 2) / samples - 1;
    curve[index] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}
