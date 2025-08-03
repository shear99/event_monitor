'use client';
import { useState, useEffect } from 'react';
import VideoPlayer from '@/components/VideoPlayer';
import ChurchBuilding from '@/components/ChurchBuilding';
import Clock from '@/components/Clock';
import Subtitle from '@/components/Subtitle';
import { getCurrentEventForFloor, getFloorColor, eventData } from '@/lib/eventUtils';

export default function Home() {
  const [currentTime, setCurrentTime] = useState('');
  const [floorData, setFloorData] = useState({});
  const [testTime, setTestTime] = useState(null);
  const [fontSize, setFontSize] = useState(48);
  const [subtitleFontSize, setSubtitleFontSize] = useState(100);
  const [subtitleSmallFontSize, setSubtitleSmallFontSize] = useState(50);
  const [clockDateFontSize, setClockDateFontSize] = useState(60);
  const [clockTimeFontSize, setClockTimeFontSize] = useState(120);
  const [clockPeriodFontSize, setClockPeriodFontSize] = useState(40);

  // 설정값 로드 및 실시간 새로고침 리스너
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          setClockTimeFontSize(config.clockTimeFontSize || 120);
          setClockDateFontSize(config.clockDateFontSize || 60);
          setClockPeriodFontSize(config.clockPeriodFontSize || 40);
          setSubtitleFontSize(config.subtitleFontSize || 100);
          setSubtitleSmallFontSize(config.subtitleSmallFontSize || 50);
        }
      } catch (error) {
        console.error('설정 로드 실패:', error);
      }
    };
    
    // 실시간 새로고침 리스너
    const eventSource = new EventSource('/api/refresh');
    const zoomEventSource = new EventSource('/api/zoom');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'refresh') {
        console.log('새로고침 신호 수신, 페이지를 새로고침합니다...');
        window.location.reload();
      }
    };
    
    zoomEventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'zoom') {
        console.log('줌 제어 신호 수신:', data.action);
        const currentZoom = parseFloat(document.body.style.getPropertyValue('--zoom-level') || '1');
        let newZoom = currentZoom;
        
        if (data.action === 'zoomIn') {
          newZoom = Math.min(3, currentZoom + 0.1);
        } else if (data.action === 'zoomOut') {
          newZoom = Math.max(0.5, currentZoom - 0.1);
        } else if (data.action === 'zoomReset') {
          newZoom = 1;
        }
        
        document.body.style.setProperty('--zoom-level', newZoom.toString());
        document.body.style.transform = `scale(${newZoom})`;
        document.body.style.transformOrigin = 'top left';
        document.body.style.width = `${100/newZoom}%`;
        document.body.style.height = `${100/newZoom}%`;
        
        console.log('줌 레벨 변경:', newZoom);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('EventSource 오류:', error);
    };
    
    zoomEventSource.onerror = (error) => {
      console.error('Zoom EventSource 오류:', error);
    };
    
    loadConfig();
    
    return () => {
      eventSource.close();
      zoomEventSource.close();
    };
  }, []);
  const [clockPeriodOffset, setClockPeriodOffset] = useState(-14);
  const [clockHorizontalPadding, setClockHorizontalPadding] = useState(15);

  // 개발자 도구 함수들을 전역으로 노출
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.setTestTime = (time) => {
        setTestTime(time);
        console.log(`Test time set to: ${time}`);
      };
      
      window.resetTime = () => {
        setTestTime(null);
        console.log('Time reset to current time');
      };
      
      window.stopFastTime = () => {
        setTestTime(null);
        console.log('Fast time stopped, reset to current time');
      };
      
      window.setFontSize = (size) => {
        setFontSize(size);
        console.log(`Font size set to: ${size}px`);
      };
      
      window.setSubtitleFontSize = (size) => {
        setSubtitleFontSize(size);
        console.log(`Subtitle font size set to: ${size}px`);
      };
      
      window.setSubtitleSmallFontSize = (size) => {
        setSubtitleSmallFontSize(size);
        console.log(`Subtitle small font size ($ parts) set to: ${size}px`);
      };
      
      window.setClockDateFontSize = (size) => {
        setClockDateFontSize(size);
        console.log(`Clock date font size set to: ${size}px`);
      };
      
      window.setClockTimeFontSize = (size) => {
        setClockTimeFontSize(size);
        console.log(`Clock time font size set to: ${size}px`);
      };
      
      window.setClockPeriodFontSize = (size) => {
        setClockPeriodFontSize(size);
        console.log(`Clock period font size set to: ${size}px`);
      };
      
      window.adjustClockPeriodPosition = (offset) => {
        setClockPeriodOffset(offset);
        console.log(`Clock period position adjusted: ${offset}px ${offset > 0 ? '(down)' : offset < 0 ? '(up)' : '(center)'} from baseline`);
      };
      
      window.adjustClockWidth = (padding) => {
        setClockHorizontalPadding(padding);
        console.log(`Clock horizontal padding set to: ${padding}% (effective width: ${100 - padding * 2}%)`);
      };
      
      window.showEvents = () => {
        console.log('Event schedule:');
        eventData.forEach(event => {
          console.log(`${event.dept} - Floor ${event.floor} - ${event.time}`);
        });
      };
      
      window.fastTimeTest = (startTime, speedMultiplier = 20) => {
        let [hour, minute] = startTime.split(':').map(Number);
        let elapsedMinutes = 0;
        const maxMinutes = 20;
        
        const interval = setInterval(() => {
          minute += 1;
          elapsedMinutes += 1;
          
          if (minute >= 60) {
            hour += 1;
            minute = 0;
          }
          if (hour >= 24) hour = 0;
          
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          setTestTime(timeString);
          console.log(`Fast time: ${timeString}`);
          
          if (elapsedMinutes >= maxMinutes) {
            clearInterval(interval);
            console.log('Fast time test completed (20 minutes elapsed)');
          }
        }, 1000 / speedMultiplier);
        
        console.log(`Fast time test started from ${startTime} (${speedMultiplier}x speed, will run for ${maxMinutes} minutes)`);
        return interval;
      };
    }
  }, []);

  // 시간 변경 시 층별 데이터 업데이트
  useEffect(() => {
    if (!currentTime) return;

    const newFloorData = {};
    [2, 3, 4].forEach(floor => {
      const eventInfo = getCurrentEventForFloor(floor, currentTime);
      if (eventInfo) {
        newFloorData[floor] = {
          ...eventInfo,
          color: getFloorColor(eventInfo.status, eventInfo.minutesUntilEvent)
        };
      }
    });
    
    setFloorData(newFloorData);
  }, [currentTime]);

  return (
    <div className="w-screen h-screen overflow-hidden relative" style={{backgroundColor: '#000000'}}>
      <style jsx global>{`
        body:fullscreen {
          cursor: none;
        }
        
        body:-webkit-full-screen {
          cursor: none;
        }
        
        body:-moz-full-screen {
          cursor: none;
        }
      `}</style>
      
      {/* Background - 2560x1440 */}
      <div className="absolute inset-0" style={{backgroundColor: '#000000'}}>
        
        {/* Header - 1920x208 at (39, 51) */}
        <div 
          className="absolute bg-gray-600"
          style={{
            left: '39px',
            top: '51px',
            width: '1920px',
            height: '208px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          <Subtitle fontSize={subtitleFontSize} smallFontSize={subtitleSmallFontSize} />
        </div>
        
        {/* Right Header - 470x208 at (2015, 51) */}
        <div 
          className="absolute bg-red-800 flex items-center justify-center"
          style={{
            left: '2015px',
            top: '51px',
            width: '470px',
            height: '208px'
          }}
        >
          <Clock 
            testTime={testTime} 
            onTimeChange={setCurrentTime}
            dateFontSize={clockDateFontSize}
            timeFontSize={clockTimeFontSize}
            periodFontSize={clockPeriodFontSize}
            periodOffset={clockPeriodOffset}
            horizontalPadding={clockHorizontalPadding}
          />
        </div>
        
        {/* Main Video Area - 1920x1080 at (40, 310) */}
        <div 
          className="absolute bg-white"
          style={{
            left: '40px',
            top: '310px',
            width: '1920px',
            height: '1080px'
          }}
        >
          <VideoPlayer />
        </div>
        
        {/* Church Building Area - starting at x=2015 */}
        <div 
          className="absolute"
          style={{
            left: '2015px',
            top: '259px',
            width: '470px',
            height: '1181px'
          }}
        >
          <ChurchBuilding 
            floorData={floorData}
            fontSize={fontSize}
          />
        </div>
        
      </div>
    </div>
  );
}