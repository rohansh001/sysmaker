/**
 * Rig Audio Synthesizer (Web Audio API)
 * Generates realistic hardware sound effects purely via code:
 * - Mechanical PCIe & RAM latch clicks
 * - Power switch mechanical click
 * - Glass panel sliding acoustic
 * - High-tech thermal HUD scan chirp
 * - Subtle aerodynamic fan acoustic hum
 *
 * No external audio files or network requests required.
 */

class RigAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private fanOscillator: OscillatorNode | null = null;
  private fanGain: GainNode | null = null;
  private fanFilter: BiquadFilterNode | null = null;
  private isFanRunning: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.fanGain) {
      this.fanGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Crisp dual-action click for mounting RAM, GPU, or CPU latch
   */
  public playLatchClick(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Stage 1: Initial plastic engagement click
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(1400, now);
    osc1.frequency.exponentialRampToValueAtTime(320, now + 0.025);

    gain1.gain.setValueAtTime(0.22, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.025);

    // Stage 2: Heavy satisfying mechanical lock snap (12ms later)
    const snapTime = now + 0.018;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(820, snapTime);
    osc2.frequency.exponentialRampToValueAtTime(180, snapTime + 0.045);

    gain2.gain.setValueAtTime(0.28, snapTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, snapTime + 0.045);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(snapTime);
    osc2.stop(snapTime + 0.05);
  }

  /**
   * Tactile chassis power switch toggle click
   */
  public playPowerSwitch(turnOn: boolean): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (turnOn) {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.06);
    } else {
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.06);
    }

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Subtle glass panel slide / thumbscrew unscrew sound
   */
  public playGlassToggle(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /**
   * High-tech radar chirp when toggling thermal infrared camera
   */
  public playThermalChirp(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.linearRampToValueAtTime(1800, now + 0.08);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Continuous gentle aerodynamic fan acoustic hum
   */
  public setFanHum(active: boolean): void {
    if (typeof window === 'undefined') return;
    this.isFanRunning = active;
    const ctx = this.getContext();
    if (!ctx) return;

    if (!active || this.isMuted) {
      if (this.fanGain) {
        this.fanGain.gain.setTargetAtTime(0, ctx.currentTime, 0.4);
      }
      return;
    }

    if (!this.fanOscillator) {
      try {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(58, ctx.currentTime); // Realistic low fan blade passing frequency

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, ctx.currentTime);

        gain.gain.setValueAtTime(0, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        this.fanOscillator = osc;
        this.fanFilter = filter;
        this.fanGain = gain;
      } catch (err) {
        console.warn('AudioContext fan init error:', err);
      }
    }

    if (this.fanGain) {
      // Gentle whisper-quiet ambient level
      this.fanGain.gain.setTargetAtTime(0.025, ctx.currentTime, 0.6);
    }
  }
}

export const rigAudio = new RigAudioSynthesizer();
