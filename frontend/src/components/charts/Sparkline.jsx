import React from 'react';

export const Sparkline = ({ 
  data = [], 
  color = 'blue', 
  dashed = false, 
  height = 36 
}) => {
  const colorMap = {
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    purple: '#8b5cf6',
  };

  const strokeColor = colorMap[color] || '#3b82f6';

  // If dynamic data points are provided, construct dynamic SVG path
  let pathD = '';
  if (Array.isArray(data) && data.length > 1) {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = (maxVal - minVal) || 1;
    const width = 300;
    const chartHeight = 28;
    const topPadding = 4;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      // Invert Y because SVG 0 is top
      const y = chartHeight - ((val - minVal) / range) * (chartHeight - topPadding) + topPadding;
      return { x: Math.round(x), y: Math.round(y) };
    });

    // Generate smooth cubic bezier SVG path
    pathD = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pathD += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
  } else {
    // Default fallback organic curves
    const fallbackPaths = {
      blue: "M 0,22 Q 25,8 50,18 T 100,12 T 150,24 T 200,8 T 250,14 T 300,6",
      green: "M 0,20 Q 30,26 60,14 T 120,20 T 180,8 T 240,16 T 300,5",
      red: "M 0,10 Q 35,6 70,18 T 140,12 T 210,22 T 260,18 T 300,24",
      purple: "M 0,18 Q 40,24 80,10 T 160,20 T 220,6 T 270,16 T 300,8",
    };
    pathD = fallbackPaths[color] || fallbackPaths.blue;
  }

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
          style={{ transition: 'd 0.4s ease' }}
        />
      </svg>
    </div>
  );
};
