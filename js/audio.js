/**
 * Web Audio API synthesizer for retro-fantasy sound effects.
 * Requires zero external audio assets.
 */
export class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  playTone(freq, type = 'sine', duration = 0.08, startVol = 0.15, endVol = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(endVol, 0.0001), this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback fails gracefully if browser policy blocks
    }
  }

  playPaint(terrainId) {
    const pitchMap = {
      GRASS: 330,
      ROAD: 440,
      SAND: 370,
      MUD: 220,
      LAVA: 180,
      WALL: 140
    };
    const freq = pitchMap[terrainId] || 350;
    this.playTone(freq, 'triangle', 0.06, 0.12);
  }

  playExplore(dist) {
    // Pitch scales with distance (200Hz to 600Hz)
    const baseFreq = 220;
    const freq = Math.min(650, baseFreq + (dist % 40) * 10);
    this.playTone(freq, 'sine', 0.04, 0.08);
  }

  playRelax() {
    this.playTone(587.33, 'triangle', 0.04, 0.08); // D5
  }

  playPathFound() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.22, 0.18);
      }, idx * 75);
    });
  }

  playHeroStep() {
    this.playTone(480 + Math.random() * 40, 'sine', 0.03, 0.05);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 120 },
      { f: 783.99, d: 0.14, t: 240 },
      { f: 1046.50, d: 0.35, t: 380 }
    ];

    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, 'triangle', n.d, 0.22);
      }, n.t);
    });
  }
}
