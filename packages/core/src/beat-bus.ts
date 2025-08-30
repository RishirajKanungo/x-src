import { BeatSnapshot, Analysis } from './types';

export class BeatBus {
  private analysis: Analysis | null = null;
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  private startTime: number = 0;
  private tempo: number = 120; // default BPM

  constructor() {
    this.startTime = performance.now();
  }

  setAnalysis(analysis: Analysis): void {
    this.analysis = analysis;
    if (analysis.tempo) {
      this.tempo = analysis.tempo;
    }
  }

  setCurrentTime(time: number): void {
    this.currentTime = time;
  }

  setPlaying(playing: boolean): void {
    this.isPlaying = playing;
    if (playing) {
      this.startTime = performance.now() - this.currentTime;
    }
  }

  at(time: number): BeatSnapshot {
    if (!this.analysis || !this.analysis.beats || this.analysis.beats.length === 0) {
      // Fallback to time-based estimation
      return this.estimateBeatSnapshot(time);
    }

    return this.computeBeatSnapshot(time);
  }

  private computeBeatSnapshot(time: number): BeatSnapshot {
    const beats = this.analysis!.beats!;
    const bars = this.analysis!.bars || [];
    const sections = this.analysis!.sections || [];

    // Find current beat
    let beatIndex = 0;
    let beatPhase = 0;
    for (let i = 0; i < beats.length - 1; i++) {
      if (time >= beats[i].t && time < beats[i + 1].t) {
        beatIndex = i;
        beatPhase = (time - beats[i].t) / (beats[i + 1].t - beats[i].t);
        break;
      }
    }

    // Find current bar
    let barPhase = 0;
    for (let i = 0; i < bars.length - 1; i++) {
      if (time >= bars[i].t && time < bars[i + 1].t) {
        barPhase = (time - bars[i].t) / (bars[i + 1].t - bars[i].t);
        break;
      }
    }

    // Find current section
    let sectionIndex = 0;
    for (let i = 0; i < sections.length; i++) {
      if (time >= sections[i].start && time < sections[i].start + sections[i].duration) {
        sectionIndex = i;
        break;
      }
    }

    return {
      beatIndex,
      beatPhase,
      barPhase,
      sectionIndex,
      currentTime: time,
      bpm: this.tempo,
    };
  }

  private estimateBeatSnapshot(time: number): BeatSnapshot {
    const beatDuration = 60 / this.tempo; // seconds per beat
    const barDuration = beatDuration * 4; // assuming 4/4 time

    const beatIndex = Math.floor(time / beatDuration);
    const beatPhase = (time % beatDuration) / beatDuration;

    const barIndex = Math.floor(time / barDuration);
    const barPhase = (time % barDuration) / barDuration;

    return {
      beatIndex,
      beatPhase,
      barPhase,
      sectionIndex: 0,
      currentTime: time,
      bpm: this.tempo,
    };
  }

  getTempo(): number {
    return this.tempo;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  // Quantize time to next downbeat
  quantizeToNextDownbeat(time: number): number {
    if (!this.analysis?.beats) {
      return time;
    }

    const beats = this.analysis.beats;
    for (const beat of beats) {
      if (beat.t > time && beat.isDownbeat) {
        return beat.t;
      }
    }

    // Fallback: quantize to next beat boundary
    const beatDuration = 60 / this.tempo;
    return Math.ceil(time / beatDuration) * beatDuration;
  }

  // Get next downbeat time
  getNextDownbeat(time: number): number {
    if (!this.analysis?.beats) {
      return time + (60 / this.tempo);
    }

    const beats = this.analysis.beats;
    for (const beat of beats) {
      if (beat.t > time && beat.isDownbeat) {
        return beat.t;
      }
    }

    // Fallback
    return time + (60 / this.tempo);
  }
}

// Singleton instance
export const beatBus = new BeatBus();
