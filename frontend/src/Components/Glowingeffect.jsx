import React from 'react';

function Glowingeffect() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '1000px',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      {/* Large Glowing Semicircle */}
      <div
        style={{
          position: 'absolute',
          bottom: '500px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px', // wider
          height: '300px', // taller for bigger glow
          background: 'radial-gradient(ellipse at center, rgba(255,215,0,0.5), transparent 80%)',
          borderTop: '3px solid rgba(255, 215, 0, 0.5)',
          borderLeft: '3px solid rgba(255, 215, 0, 0.5)',
          borderRight: '3px solid rgba(255, 215, 0, 0.5)',
          borderBottom: 'none',
          borderRadius: '50% 50% 0 0',
          boxShadow: `
            0 -30px 100px rgba(255, 215, 0, 0.7),
            0 -20px 80px rgba(255, 255, 255, 0.6)
          `,
          animation: 'glow-pulse 5s ease-in-out infinite',
          zIndex: 100,
        }}
      ></div>

      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 
              0 -30px 100px rgba(255, 215, 0, 0.7),
              0 -20px 80px rgba(255, 255, 255, 0.6);
          }
          50% {
            box-shadow: 
              0 -50px 140px rgba(255, 215, 0, 0.9),
              0 -35px 120px rgba(255, 255, 255, 0.8);
          }
        }
      `}</style>
    </div>
  );
}

export default Glowingeffect;
