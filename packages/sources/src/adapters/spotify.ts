import { BaseSourceAdapter } from './base';
import { SourceCapabilities, TrackHandle, Analysis } from '@x-src/core';

export class SpotifyAdapter extends BaseSourceAdapter {
  readonly kind = 'spotify';
  readonly capabilities: SourceCapabilities = {
    playback: true,
    pcm: false,
    officialAnalysis: true,
    allowAudioExport: false,
    allowSeeking: true,
  };

  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;

  constructor(clientId?: string, clientSecret?: string) {
    super();
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async parseUrl(url: string): Promise<{ sourceId: string } | null> {
    if (!this.isValidUrl(url)) return null;

    const patterns = [
      /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /spotify\.com\/track\/([a-zA-Z0-9]+)/,
    ];

    if (!this.urlMatchesPattern(url, patterns)) return null;

    const match = url.match(patterns[0]) || url.match(patterns[1]);
    if (!match) return null;

    return { sourceId: match[1] };
  }

  async fetchMetadata(sourceId: string): Promise<TrackHandle> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const response = await fetch(`https://api.spotify.com/v1/tracks/${sourceId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Spotify track: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: `spotify:${sourceId}`,
      source: 'spotify',
      sourceId,
      title: data.name,
      artist: data.artists[0]?.name || 'Unknown Artist',
      durationMs: data.duration_ms,
      isrc: data.external_ids?.isrc,
      album: data.album?.name,
      artworkUrl: data.album?.images[0]?.url,
    };
  }

  async fetchAnalysis(sourceId: string): Promise<Analysis> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    const [audioFeatures, audioAnalysis] = await Promise.all([
      fetch(`https://api.spotify.com/v1/audio-features/${sourceId}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }),
      fetch(`https://api.spotify.com/v1/audio-analysis/${sourceId}`, {
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }),
    ]);

    if (!audioFeatures.ok || !audioAnalysis.ok) {
      throw new Error('Failed to fetch Spotify analysis');
    }

    const features = await audioFeatures.json();
    const analysis = await audioAnalysis.json();

    return {
      tempo: features.tempo,
      key: features.key,
      energy: features.energy,
      loudness: features.loudness,
      valence: features.valence,
      danceability: features.danceability,
      instrumentalness: features.instrumentalness,
      beats: analysis.beats?.map((beat: any) => ({
        t: beat.start,
        isDownbeat: beat.start % (60 / features.tempo * 4) < 0.1,
      })),
      bars: analysis.bars?.map((bar: any) => ({ t: bar.start })),
      sections: analysis.sections?.map((section: any) => ({
        start: section.start,
        duration: section.duration,
        label: section.name,
      })),
    };
  }

  async getPlaybackElement(opts: { sourceId: string; auth?: any }): Promise<HTMLIFrameElement> {
    const iframe = document.createElement('iframe');
    iframe.src = `https://open.spotify.com/embed/track/${opts.sourceId}`;
    iframe.width = '300';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media';
    
    return iframe;
  }

  private async authenticate(): Promise<void> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials not configured');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Spotify');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }
}
