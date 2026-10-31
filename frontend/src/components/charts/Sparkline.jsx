import React from 'react';

export const Sparkline = ({ color = 'blue', dashed = false, height = 36 }) => {
  const colorMap = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    purple: '#8b5cf6',
  };

  const strokeColor = colorMap[color] || '#3b82f6';

  // Different organic wave paths for visual variety like in the reference screenshot
  const paths = {
    blue: "M 0,22 Q 25,8 50,18 T 100,12 T 150,24 T 200,8 T 250,14 T 300,6",
    green: "M 0,20 Q 30,26 60,14 T 120,20 T 180,8 T 240,16 T 300,5",
    red: "M 0,10 Q 35,6 70,18 T 140,12 T 210,22 T 260,18 T 300,24",
    purple: "M 0,18 Q 40,24 80,10 T 160,20 T 220,6 T 270,16 T 300,8",
  };

  const pathD = paths[color] || paths.blue;

  return (
    <div className="w-100 overflow-hidden" style={{ height: `${height}px` }}>
      <svg 
        viewBox="0 0 300 32" 
        preserveAspectRatio="none" 
        className="w-100 h-100"
      >
        <path 
          d={pathD}
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          strokeDasharray={dashed ? "4,4" : "none"}
        />
      </svg>
    </div>
  );
};
