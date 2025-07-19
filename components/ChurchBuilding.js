'use client';
import { palette } from '@/lib/eventUtils';
import { useState, useEffect } from 'react';

export default function ChurchBuilding({ floorData, fontSize = 48 }) {
  const [blinkState, setBlinkState] = useState({});
  
  // 깜빡임 효과를 위한 useEffect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      const newBlinkState = {};
      
      // 각 층별로 임박 상태인지 확인하고 깜빡임 상태 갱신
      Object.keys(floorData).forEach(floor => {
        if (floorData[floor].status === 'imminent') {
          newBlinkState[floor] = !blinkState[floor];
        }
      });
      
      setBlinkState(prev => ({
        ...prev,
        ...newBlinkState
      }));
    }, 500); // 0.5초 간격으로 깜빡임
    
    return () => clearInterval(blinkInterval);
  }, [floorData, blinkState]);

  const getFloorColor = (floor) => {
    const floorInfo = floorData[floor];
    if (!floorInfo) return palette.floorDefault;
    
    // 임박 상태이고 깜빡임 상태가 false인 경우 회색으로 표시
    if (floorInfo.status === 'imminent' && blinkState[floor] === false) {
      return palette.floorDefault;
    }
    
    return floorInfo.color;
  };

  const FloorText = ({ floor, x, y }) => {
    const event = floorData[floor];
    if (!event) return null;

    const textContent = `${event.dept} ${event.time}`;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        fontSize={fontSize}
        fontFamily="BM JUA, BMJUA, Arial, sans-serif"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {textContent}
      </text>
    );
  };

  return (
    <svg width="470" height="1181" viewBox="0 0 470 1181" className="w-full h-full">
      {/* Cross - adjusted coordinates */}
      <path d="M90.62 169H116.64V349H90.62V169Z" fill="#5C5C5C"/>
      <rect x="49" y="216.184" width="111" height="26.2136" fill="#5C5C5C"/>
      
      {/* Floor 4 - path coordinates from homepage.svg */}
      <g clipPath="url(#clip-floor4)">
        <path
          d="M18.22 407.16L30.97 387H373.45L426.28 413.789L470 435.96V567H0V435.96L18.22 407.16Z"
          fill={getFloorColor(4)}
        />
      </g>
      <FloorText floor={4} x={235} y={477} />
      
      {/* Floor 3 - rect at y=605 (864-259) */}
      <rect
        x="0"
        y="605"
        width="470"
        height="180"
        fill={getFloorColor(3)}
      />
      <FloorText floor={3} x={235} y={695} />
      
      {/* Floor 2 - rect at y=823 (1082-259) */}
      <rect
        x="0"
        y="823"
        width="470"
        height="180"
        fill={getFloorColor(2)}
      />
      <FloorText floor={2} x={235} y={913} />
      
      {/* Floor 1 - rect at y=1041 (1300-259) */}
      <rect
        x="0"
        y="1041"
        width="470"
        height="90"
        fill="#2F2F2F"
      />
      
      <defs>
        <clipPath id="clip-floor4">
          <rect width="470" height="180" transform="translate(0, 387)"/>
        </clipPath>
      </defs>
    </svg>
  );
}