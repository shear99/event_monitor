// 행사 데이터
export const eventData = [
  { dept: '유초등부', floor: 4, time: '09:00' },
  { dept: '중고등부', floor: 3, time: '09:00' },
  { dept: '오전예배', floor: 2, time: '11:00' },
  { dept: '오후예배', floor: 2, time: '14:00' },
  { dept: '대학청년부', floor: 3, time: '14:00' }
];

// 색상 팔레트
export const palette = {
  floorDefault: '#757575',
  floorHover: '#8B0000',
  floorActive: '#DC143C', // 버건디 색상
  floorImminent: '#DC143C', // 임박 시에도 버건디 색상 사용
  floorEnded: '#2F2F2F'
};

// 현재 층별 행사 정보 가져오기
export function getCurrentEventForFloor(floor, currentTime) {
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  
  const floorEvents = eventData
    .filter(event => event.floor === floor)
    .sort((a, b) => parseInt(a.time.split(':')[0]) - parseInt(b.time.split(':')[0]));
  
  if (floorEvents.length === 0) return null;
  
  for (let i = 0; i < floorEvents.length; i++) {
    const [eventHour, eventMinute] = floorEvents[i].time.split(':').map(Number);
    const eventTotalMinutes = eventHour * 60 + eventMinute;
    const eventEndMinutes = eventTotalMinutes + 120;
    
    if (currentTotalMinutes >= eventTotalMinutes && currentTotalMinutes < eventEndMinutes) {
      return { ...floorEvents[i], status: 'active' };
    }
    
    if (currentTotalMinutes >= eventTotalMinutes - 10 && currentTotalMinutes < eventTotalMinutes) {
      const minutesUntilEvent = eventTotalMinutes - currentTotalMinutes;
      return { ...floorEvents[i], status: 'imminent', minutesUntilEvent };
    }
  }
  
  for (let i = 0; i < floorEvents.length; i++) {
    const [eventHour] = floorEvents[i].time.split(':').map(Number);
    const eventEndHour = eventHour + 2;
    
    if (currentHour >= eventEndHour) {
      if (i < floorEvents.length - 1) {
        const nextEventHour = parseInt(floorEvents[i + 1].time.split(':')[0]);
        if (currentHour < nextEventHour) {
          return { ...floorEvents[i + 1], status: 'upcoming' };
        }
      } else {
        return { ...floorEvents[i], status: 'ended' };
      }
    }
  }
  
  return { ...floorEvents[0], status: 'upcoming' };
}

// RGB 색상을 보간하는 함수
function interpolateColor(color1, color2, factor) {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substr(0, 2), 16);
  const g1 = parseInt(hex1.substr(2, 2), 16);
  const b1 = parseInt(hex1.substr(4, 2), 16);
  
  const r2 = parseInt(hex2.substr(0, 2), 16);
  const g2 = parseInt(hex2.substr(2, 2), 16);
  const b2 = parseInt(hex2.substr(4, 2), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 상태에 따른 색상 반환
export function getFloorColor(status, minutesUntilEvent = 0) {
  switch (status) {
    case 'imminent': {
      // 임박 상태에서는 버건디 색상 사용 (깜빡임은 ChurchBuilding 컴포넌트에서 처리)
      return palette.floorImminent;
    }
    case 'active': return palette.floorActive;
    case 'ended': return palette.floorEnded;
    default: return palette.floorDefault;
  }
}