'use client';
import { useState, useEffect } from 'react';

export default function Clock({ testTime, onTimeChange, dateFontSize = 44, timeFontSize = 88, periodFontSize = 28, periodOffset = -14, horizontalPadding = 15 }) {
  const [currentTime, setCurrentTime] = useState('');
  const [dateInfo, setDateInfo] = useState({ month: '', day: '', weekday: '', period: '', time: '' });

  useEffect(() => {
    const updateTime = () => {
      let now;
      if (testTime) {
        const [hours, minutes] = testTime.split(':').map(Number);
        now = new Date();
        now.setHours(hours, minutes, 0, 0);
        setCurrentTime(testTime);
        onTimeChange?.(testTime);
      } else {
        now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        setCurrentTime(timeString);
        onTimeChange?.(timeString);
      }
      
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const weekdays = ['주일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const weekday = weekdays[now.getDay()];
      
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const period = hours >= 12 ? '오후' : '오전';
      hours = hours % 12 || 12;
      
      const time = `${hours} : ${minutes.toString().padStart(2, '0')}`;
      
      setDateInfo({ month, day, weekday, period, time });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, [testTime, onTimeChange]);

  return (
    <div style={{ 
      fontFamily: 'BM JUA, BMJUA, Arial, sans-serif',
      color: 'white',
      fontWeight: 'bold',
      backgroundColor: 'transparent',
      padding: `16px ${horizontalPadding}%`,
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '8px',
        fontSize: `${dateFontSize}px`,
        width: '100%'
      }}>
        <span style={{ paddingLeft: '5%' }}>{dateInfo.month} {dateInfo.day}</span>
        <span style={{ paddingRight: '5%' }}>{dateInfo.weekday}</span>
      </div>
      
      <div style={{ 
        textAlign: 'center', 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        gap: '16px'
      }}>
        <span style={{ 
          fontSize: `${periodFontSize}px`,
          transform: `translateY(${periodOffset}px)`
        }}>{dateInfo.period}</span>
        <span style={{ fontSize: `${timeFontSize}px` }}>{dateInfo.time}</span>
      </div>
    </div>
  );
}