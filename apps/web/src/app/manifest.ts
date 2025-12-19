import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TanJai POS',
    short_name: 'TanJai',
    description: 'Modern Street Food POS & Ordering System',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#FFB300',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      // In production, user should generate real 192/512 pngs.
      // We will point to placeholders or assume they exist, or use internal Vercel/Next blobs if available?
      // For now, reuse favicon or generic. 
      // Ideally we should have /icon-192.png and /icon-512.png in public folder.
    ],
  }
}
