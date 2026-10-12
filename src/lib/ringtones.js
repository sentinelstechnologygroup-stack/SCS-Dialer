// Web Audio-based ringtones and UI tones for the SCS Dialer prototype.
// No audio asset files needed — tones are synthesized with oscillators.
// Production native builds will use the device ringtone picker instead.

let ctx;
function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

const RINGTONES = {
  Classic: [{ f: 440, d: 0.4 }, { f: 550, d: 0.4 }],
  Pulse: [{ f: 660, d: 0.2 }, { f: 0, d: 0.1 }, { f: 660, d: 0.2 }, { f: 0, d: 0.3 }],
  Marimba: [{ f: 523, d: 0.18 }, { f: 659, d: 0.18 }, { f: 784, d: 0.18 }, { f: 659, d: 0.18 }],
  Chime: [{ f: 523, d: 0.25 }, { f: 659, d: 0.25 }, { f: 784, d: 0.4 }],
};

export const RINGTONE_NAMES = ["Classic", "Pulse", "Marimba", "Chime", "Silent"];

function playNote(c, freq, start, dur, gain = 0.15) {
  if (!freq) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Plays a looping ringtone. Returns a stop() function.
export function playRingtone(name) {
  if (!name || name === "Silent") return () => {};
  const c = audio();
  if (!c) return () => {};
  const seq = RINGTONES[name] || RINGTONES.Classic;
  let stopped = false;
  let timer;
  const loop = () => {
    if (stopped) return;
    let t = 0;
    for (const n of seq) {
      playNote(c, n.f, t, n.d);
      t += n.d;
    }
    timer = setTimeout(loop, (t + 0.5) * 1000);
  };
  loop();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

// Short one-shot UI tones.
export function playTone(name) {
  const c = audio();
  if (!c) return;
  const map = {
    dial: { f: 800, d: 0.08 },
    sent: { f: 1200, d: 0.12 },
    message: { f: 660, d: 0.18 },
    end: { f: 300, d: 0.2 },
  };
  const n = map[name] || map.dial;
  playNote(c, n.f, 0, n.d, 0.08);
}