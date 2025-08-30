import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'x-src — Cross-Source Music Tools Hub',
  description: 'Modern web-native music tools with WebGPU, beat-synced visuals, and cross-platform source support.',
  keywords: ['music', 'visualizer', 'webgpu', 'spotify', 'youtube', 'apple-music', 'audio-analysis'],
  authors: [{ name: 'Rishiraj Kanungo' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
