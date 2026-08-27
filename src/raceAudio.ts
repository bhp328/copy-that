/** Lightweight procedural race audio. It starts only from the START gesture. */
export class RaceAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineOscillators: OscillatorNode[] = [];
  private windGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;

  async start(): Promise<void> {
    if (!this.context) this.createGraph();
    if (this.context?.state === 'suspended') await this.context.resume();
  }

  update(speedKmh: number, attacking: boolean): void {
    if (!this.context || !this.engineGain || !this.engineFilter || !this.windGain) return;
    const now = this.context.currentTime;
    const normalizedSpeed = clamp(speedKmh / 190, 0, 1.15);
    const fundamental = 48 + normalizedSpeed * 112;
    this.engineOscillators.forEach((oscillator, index) => {
      const multiplier = index === 0 ? 1 : 2.03;
      oscillator.frequency.setTargetAtTime(fundamental * multiplier, now, 0.06);
    });
    this.engineGain.gain.setTargetAtTime(
      0.035 + normalizedSpeed * 0.075 + (attacking ? 0.018 : 0),
      now,
      0.08,
    );
    this.engineFilter.frequency.setTargetAtTime(
      520 + normalizedSpeed * 1550,
      now,
      0.08,
    );
    this.windGain.gain.setTargetAtTime(
      Math.max(0, normalizedSpeed - 0.25) * 0.042,
      now,
      0.12,
    );
  }

  toggleMuted(): boolean {
    this.muted = !this.muted;
    if (this.context && this.master) {
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : 0.78,
        this.context.currentTime,
        0.03,
      );
    }
    return this.muted;
  }

  playRadioClick(): void {
    if (!this.context || !this.master || !this.noiseBuffer || this.muted) return;
    const now = this.context.currentTime;
    const noise = this.context.createBufferSource();
    const noiseGain = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    noise.buffer = this.noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.value = 1750;
    filter.Q.value = 0.72;
    noiseGain.gain.setValueAtTime(0.075, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    noise.connect(filter).connect(noiseGain).connect(this.master);
    noise.start(now, Math.random() * 0.6, 0.095);

    const click = this.context.createOscillator();
    const clickGain = this.context.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(950, now);
    click.frequency.exponentialRampToValueAtTime(280, now + 0.045);
    clickGain.gain.setValueAtTime(0.04, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    click.connect(clickGain).connect(this.master);
    click.start(now);
    click.stop(now + 0.06);
  }

  playOutcome(success: boolean): void {
    if (!this.context || !this.master || this.muted) return;
    const now = this.context.currentTime;
    const frequencies = success ? [440, 660, 880] : [190, 145];
    frequencies.forEach((frequency, index) => {
      const oscillator = this.context!.createOscillator();
      const gain = this.context!.createGain();
      const start = now + index * (success ? 0.08 : 0.13);
      oscillator.type = success ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(success ? 0.055 : 0.045, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.23);
      oscillator.connect(gain).connect(this.master!);
      oscillator.start(start);
      oscillator.stop(start + 0.25);
    });
  }

  private createGraph(): void {
    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextConstructor) return;
    this.context = new AudioContextConstructor();
    this.master = this.context.createGain();
    this.master.gain.value = this.muted ? 0 : 0.78;
    this.master.connect(this.context.destination);

    this.engineGain = this.context.createGain();
    this.engineGain.gain.value = 0.025;
    this.engineFilter = this.context.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 700;
    this.engineFilter.Q.value = 1.2;
    this.engineGain.connect(this.engineFilter).connect(this.master);

    const fundamental = this.context.createOscillator();
    fundamental.type = 'sawtooth';
    fundamental.frequency.value = 52;
    const harmonic = this.context.createOscillator();
    harmonic.type = 'square';
    harmonic.frequency.value = 104;
    const fundamentalGain = this.context.createGain();
    fundamentalGain.gain.value = 0.74;
    const harmonicGain = this.context.createGain();
    harmonicGain.gain.value = 0.14;
    fundamental.connect(fundamentalGain).connect(this.engineGain);
    harmonic.connect(harmonicGain).connect(this.engineGain);
    fundamental.start();
    harmonic.start();
    this.engineOscillators = [fundamental, harmonic];

    this.noiseBuffer = this.createNoiseBuffer(2);
    const wind = this.context.createBufferSource();
    wind.buffer = this.noiseBuffer;
    wind.loop = true;
    const windFilter = this.context.createBiquadFilter();
    windFilter.type = 'highpass';
    windFilter.frequency.value = 650;
    this.windGain = this.context.createGain();
    this.windGain.gain.value = 0;
    wind.connect(windFilter).connect(this.windGain).connect(this.master);
    wind.start();
  }

  private createNoiseBuffer(seconds: number): AudioBuffer {
    const context = this.context!;
    const length = Math.max(1, Math.floor(context.sampleRate * seconds));
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.82 + white * 0.18;
      data[index] = previous;
    }
    return buffer;
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : 0));
}
