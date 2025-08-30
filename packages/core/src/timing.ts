// Timing utilities for x-src

export class TimingUtils {
  // Convert milliseconds to seconds
  static msToSeconds(ms: number): number {
    return ms / 1000;
  }

  // Convert seconds to milliseconds
  static secondsToMs(seconds: number): number {
    return seconds * 1000;
  }

  // Format time as MM:SS
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Format time as MM:SS.mmm
  static formatTimeWithMs(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  }

  // Calculate BPM from beat intervals
  static calculateBPM(beatIntervals: number[]): number {
    if (beatIntervals.length < 2) return 120;
    
    const avgInterval = beatIntervals.reduce((sum, interval) => sum + interval, 0) / beatIntervals.length;
    return 60 / avgInterval;
  }

  // Detect tempo from audio data using autocorrelation
  static detectTempo(audioData: Float32Array, sampleRate: number): number {
    // Simple autocorrelation-based tempo detection
    const minBPM = 60;
    const maxBPM = 200;
    const minPeriod = Math.floor(sampleRate * 60 / maxBPM);
    const maxPeriod = Math.floor(sampleRate * 60 / minBPM);

    let bestCorrelation = 0;
    let bestPeriod = 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < audioData.length - period; i++) {
        correlation += audioData[i] * audioData[i + period];
      }
      
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? (60 * sampleRate) / bestPeriod : 120;
  }

  // Quantize time to grid
  static quantizeToGrid(time: number, gridSize: number): number {
    return Math.round(time / gridSize) * gridSize;
  }

  // Get grid lines for timeline
  static getGridLines(duration: number, gridSize: number): number[] {
    const lines: number[] = [];
    for (let time = 0; time <= duration; time += gridSize) {
      lines.push(time);
    }
    return lines;
  }
}
