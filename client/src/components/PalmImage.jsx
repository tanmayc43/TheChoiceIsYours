import React from 'react';

// Utility for noise overlay
const NoiseOverlay = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'100\\'><filter id=\\'noise\\'><feTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.8\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/></filter><rect width=\\'100\\' height=\\'100\\' filter=\\'url(%23noise)\\' opacity=\\'0.25\\'/></svg>')",
      backgroundSize: '60px 60px',
      opacity: 0.25,
      zIndex: 2,
      mixBlendMode: 'overlay',
    }}
  />
);

const PalmImage = ({ className = '', style = {} }) => {
  const src = '/sheesh.png';
  return (
    <div className={`relative inline-block ${className}`} style={{ pointerEvents: 'none' }}>
      <img
        src={src}
        alt="Palm"
        className="w-full h-auto filter grayscale contrast-125 brightness-90"
        style={{
          display: 'block',
          pointerEvents: 'none',
          background: 'none',
          ...style,
        }}
        draggable={false}
      />
      {/* NoiseOverlay if you want */}
    </div>
  );
};

export default PalmImage; 