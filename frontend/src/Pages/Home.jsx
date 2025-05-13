import React from 'react';

function Home() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '1000px',
      overflow: 'hidden',
      background: '#111'
    }}>
      {/* Glowing semicircle positioned 500px from bottom */}
      <div style={{
        position: 'absolute',
        bottom: '500px', // Positioned 500px from bottom
        left: 0,
        width: '100%',
        height: '50px', // Proper semicircle height
        background: 'transparent',
        borderTop: '2px solid rgba(204, 153, 51, 0.3)',
        borderLeft: '2px solid rgba(204, 153, 51, 0.3)',
        borderRight: '2px solid rgba(204, 153, 51, 0.3)',
        borderBottom: 'none',
        borderRadius: '50% 50% 0 0',
        boxShadow: `
          0 -10px 30px rgba(204, 153, 51, 0.7),
          0 -5px 15px rgba(255, 215, 0, 0.9)
        `,
        animation: 'glow-pulse 4s ease-in-out infinite',
        zIndex: 100
      }}></div>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 
              0 -10px 30px rgba(204, 153, 51, 0.7),
              0 -5px 15px rgba(255, 215, 0, 0.9);
          }
          50% {
            box-shadow: 
              0 -15px 50px rgba(204, 153, 51, 0.9),
              0 -10px 30px rgba(255, 215, 0, 1);
          }
        }
      `}</style>
    </div>
  );
}

export default Home;