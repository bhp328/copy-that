export interface FixedStepResult {
  readonly steps: number;
  readonly interpolationAlpha: number;
  readonly simulationSeconds: number;
  readonly clampedFrameSeconds: number;
}

export const AUTHORITATIVE_STEP_SECONDS = 1 / 60;
export const MAX_FRAME_DELTA_SECONDS = 0.1;

/**
 * Converts variable render timing into deterministic simulation ticks. At the
 * current frame clamp a maximum of six 60 Hz steps can be due, so no simulation
 * time is silently dropped during normal browser frame spikes.
 */
export class FixedStepClock {
  private accumulatorSeconds = 0;
  private simulationSeconds = 0;

  reset(): void {
    this.accumulatorSeconds = 0;
    this.simulationSeconds = 0;
  }

  advance(frameDeltaSeconds: number, step: (deltaSeconds: number) => void): FixedStepResult {
    const clampedFrameSeconds = clamp(
      frameDeltaSeconds,
      0,
      MAX_FRAME_DELTA_SECONDS,
    );
    this.accumulatorSeconds += clampedFrameSeconds;
    let steps = 0;
    while (this.accumulatorSeconds + 1e-12 >= AUTHORITATIVE_STEP_SECONDS) {
      step(AUTHORITATIVE_STEP_SECONDS);
      this.accumulatorSeconds -= AUTHORITATIVE_STEP_SECONDS;
      this.simulationSeconds += AUTHORITATIVE_STEP_SECONDS;
      steps += 1;
    }
    return {
      steps,
      interpolationAlpha: clamp(
        this.accumulatorSeconds / AUTHORITATIVE_STEP_SECONDS,
        0,
        1,
      ),
      simulationSeconds: this.simulationSeconds,
      clampedFrameSeconds,
    };
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : 0));
}
