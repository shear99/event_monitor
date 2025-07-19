'use client';
import { useState, useEffect } from 'react';

export default function Subtitle({ fontSize = 92, smallFontSize = 46 }) {
  const [subtitles, setSubtitles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Loading subtitles...');
    fetch('/data/subtitle.txt')
      .then(response => {
        console.log('Subtitle response:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Subtitle text loaded:', text);
        const lines = text.split('\n').filter(line => line.trim() !== '');
        console.log('Subtitle lines:', lines);
        setSubtitles(lines);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading subtitles:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (subtitles.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % subtitles.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [subtitles]);

  if (loading) {
    return (
      <div 
        className="text-yellow-400 font-bold text-left px-4 py-2"
        style={{ 
          fontSize: `${fontSize}px`,
          fontFamily: 'BM JUA, BMJUA, Arial, sans-serif',
          backgroundColor: 'rgba(0,0,0,0.7)'
        }}
      >
        자막 로딩 중...
      </div>
    );
  }

  if (subtitles.length === 0) {
    return (
      <div 
        className="text-red-400 font-bold text-left px-4 py-2"
        style={{ 
          fontSize: `${fontSize}px`,
          fontFamily: 'BM JUA, BMJUA, Arial, sans-serif',
          backgroundColor: 'rgba(0,0,0,0.7)'
        }}
      >
        자막을 불러올 수 없습니다.
      </div>
    );
  }

  const renderSubtitle = (text) => {
    const lines = text.split('&');
    return lines.map((line, lineIndex) => {
      const parts = line.split(/\$([^$]+)\$/);
      const renderedLine = parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span key={index} style={{ fontSize: `${smallFontSize}px` }}>
              {part}
            </span>
          );
        }
        return part;
      });
      
      return (
        <div key={lineIndex}>
          {renderedLine}
        </div>
      );
    });
  };

  return (
    <div 
      style={{ 
        fontSize: `${fontSize}px`,
        fontFamily: 'BM JUA, BMJUA, Arial, sans-serif',
        backgroundColor: 'transparent',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'left',
        padding: '8px 16px',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        position: 'relative',
        zIndex: 9999,
        minHeight: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%'
      }}
    >
      {renderSubtitle(subtitles[currentIndex])}
    </div>
  );
}