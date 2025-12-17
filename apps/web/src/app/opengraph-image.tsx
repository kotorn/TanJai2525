import { ImageResponse } from 'next/og';
 
export const runtime = 'edge';
 
export const alt = 'Midnight Comfort Menu - Tanjai POS';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #121212, #1E1E1E)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
         {/* Background Glow */}
        <div style={{
            position: 'absolute',
            top: '-20%',
            left: '20%',
            width: '600px',
            height: '600px',
            background: '#ee6c2b',
            filter: 'blur(200px)',
            opacity: 0.2,
        }} />

        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '60px 100px',
            borderRadius: '24px',
            background: 'rgba(30,30,30,0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
            <h1 style={{ 
                fontSize: 84, 
                fontWeight: 800, 
                margin: 0, 
                background: 'linear-gradient(to right, #fff, #aaa)', 
                backgroundClip: 'text',
                color: 'transparent',
            }}>
            Midnight Comfort
            </h1>
            <p style={{ 
                fontSize: 32, 
                color: '#ee6c2b', 
                marginTop: 20, 
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase'
            }}>
            New Late Night Menu
            </p>
        </div>

        <div style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
        }}>
            <div style={{
                width: 16,
                height: 16,
                background: '#4ade80',
                borderRadius: '50%',
            }} />
            <span style={{ fontSize: 24, color: '#888' }}>Tanjai POS System</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
