import { ISourceAdapter, SourceCapabilities, TrackHandle, Analysis } from '@x-src/core';

export abstract class BaseSourceAdapter implements ISourceAdapter {
  abstract readonly kind: string;
  abstract readonly capabilities: SourceCapabilities;

  abstract parseUrl(url: string): Promise<{ sourceId: string } | null>;
  abstract fetchMetadata(sourceId: string): Promise<TrackHandle>;
  abstract getPlaybackElement(opts: {
    sourceId: string;
    auth?: any;
  }): Promise<HTMLIFrameElement | HTMLAudioElement>;

  // Optional method for sources that provide official analysis
  async fetchAnalysis?(sourceId: string): Promise<Analysis> {
    throw new Error(`Analysis not available for ${this.kind} source`);
  }

  // Helper method to validate URLs
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to extract domain from URL
  protected getDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return '';
    }
  }

  // Helper method to check if URL matches expected pattern
  protected urlMatchesPattern(url: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(url));
  }
}
