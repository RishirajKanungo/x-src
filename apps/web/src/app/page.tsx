import Link from 'next/link';
import { Music, Sparkles, Zap, Palette } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
            x-src
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            Cross-Source Music Tools Hub
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Modern web-native music tools with WebGPU, beat-synced visuals, and cross-platform source support.
            Paste any music link and create stunning, synchronized visuals.
          </p>
        </div>

        {/* Main CTA */}
        <div className="mb-16">
          <Link 
            href="/apps/visualizer" 
            className="btn btn-primary text-lg px-8 py-4 text-xl font-semibold"
          >
            <Music className="mr-2 h-6 w-6" />
            Start Visualizing
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card p-6 text-center">
            <div className="mb-4">
              <Sparkles className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Beat-Synced Visuals</h3>
            <p className="text-muted-foreground">
              Real-time WebGPU rendering synchronized to music beats and sections
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="mb-4">
              <Zap className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Cross-Platform Sources</h3>
            <p className="text-muted-foreground">
              Support for Spotify, YouTube, Apple Music, and local files
            </p>
          </div>
          
          <div className="card p-6 text-center">
            <div className="mb-4">
              <Palette className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Shader Marketplace</h3>
            <p className="text-muted-foreground">
              Customizable shader packs and visual effects
            </p>
          </div>
        </div>

        {/* App Links */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link 
            href="/apps/visualizer"
            className="card p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              x-src Visualizer
            </h3>
            <p className="text-muted-foreground mb-4">
              Create structure-aware, beat-synced visuals from any music source
            </p>
            <div className="text-sm text-primary">Launch Visualizer →</div>
          </Link>
          
          <Link 
            href="/apps/clips"
            className="card p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
              x-src Clips Studio
            </h3>
            <p className="text-muted-foreground mb-4">
              Create beat-aligned visual clips for social media sharing
            </p>
            <div className="text-sm text-primary">Launch Clips Studio →</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
