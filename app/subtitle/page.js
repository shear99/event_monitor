'use client';
import { useState, useEffect } from 'react';

export default function SubtitleEditor() {
  const [subtitleContent, setSubtitleContent] = useState('');
  const [clockTimeFontSize, setClockTimeFontSize] = useState(120);
  const [clockDateFontSize, setClockDateFontSize] = useState(60);
  const [clockPeriodFontSize, setClockPeriodFontSize] = useState(40);
  const [subtitleFontSize, setSubtitleFontSize] = useState(100);
  const [subtitleSmallFontSize, setSubtitleSmallFontSize] = useState(50);
  const [subtitleLineHeight, setSubtitleLineHeight] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedSection, setExpandedSection] = useState('subtitle');

  useEffect(() => {
    loadData();
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  const loadData = async () => {
    try {
      const subtitleRes = await fetch('/api/subtitle');
      if (subtitleRes.ok) {
        const data = await subtitleRes.json();
        setSubtitleContent(data.content || '');
      }

      const configRes = await fetch('/api/config');
      if (configRes.ok) {
        const config = await configRes.json();
        setClockTimeFontSize(config.clockTimeFontSize || 120);
        setClockDateFontSize(config.clockDateFontSize || 60);
        setClockPeriodFontSize(config.clockPeriodFontSize || 40);
        setSubtitleFontSize(config.subtitleFontSize || 100);
        setSubtitleSmallFontSize(config.subtitleSmallFontSize || 50);
        setSubtitleLineHeight(config.subtitleLineHeight || 1.2);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  };
  const handleZoom = async (action) => {
    try {
      const response = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessage(data.message);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('줌 제어 실패: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const subtitleRes = await fetch('/api/subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: subtitleContent })
      });

      const configRes = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockTimeFontSize,
          clockDateFontSize,
          clockPeriodFontSize,
          subtitleFontSize,
          subtitleSmallFontSize,
          subtitleLineHeight
        })
      });

      if (subtitleRes.ok && configRes.ok) {
        const refreshRes = await fetch('/api/refresh', {
          method: 'POST'
        });        
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setMessage(`저장 완료! ${refreshData.message}`);
        } else {
          setMessage('저장 완료! 하지만 새로고침 신호 전송에 실패했습니다.');
        }
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('저장 실패');
      }
    } catch (error) {
      setMessage('오류 발생: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      {/* 모바일 헤더 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">자막 및 설정</h1>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('완료') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}
      {/* 저장 버튼 - 상단 고정 */}
      <div className="sticky top-14 z-40 bg-white border-b px-4 py-3">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 active:bg-blue-700"
        >
          {loading ? '저장 중...' : '💾 저장 및 새로고침'}
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 py-4 space-y-3">
        
        {/* 화면 줌 제어 섹션 */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            onClick={() => toggleSection('zoom')}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">🔍 화면 줌 제어</span>
            <span className="text-gray-400">{expandedSection === 'zoom' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'zoom' && (
            <div className="px-4 pb-4 space-y-3">
              <button
                onClick={() => handleZoom('zoomIn')}
                className="w-full bg-green-500 text-white font-medium py-3 rounded-lg active:bg-green-600"
              >
                🔍+ 확대
              </button>
              <button
                onClick={() => handleZoom('zoomOut')}
                className="w-full bg-red-500 text-white font-medium py-3 rounded-lg active:bg-red-600"
              >
                🔍- 축소
              </button>
              <button
                onClick={() => handleZoom('zoomReset')}
                className="w-full bg-gray-500 text-white font-medium py-3 rounded-lg active:bg-gray-600"
              >
                🔄 원래크기
              </button>
            </div>
          )}
        </div>
        {/* 자막 내용 섹션 */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            onClick={() => toggleSection('subtitle')}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">📝 자막 내용</span>
            <span className="text-gray-400">{expandedSection === 'subtitle' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'subtitle' && (
            <div className="px-4 pb-4">
              <textarea
                value={subtitleContent}
                onChange={(e) => setSubtitleContent(e.target.value)}
                className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="자막 내용을 입력하세요..."
              />
              <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-gray-600">
                <div className="font-medium mb-1">💡 자막 문법</div>
                <div>• & : 줄바꿈</div>
                <div>• $텍스트$ : 작은 글씨</div>
              </div>
            </div>
          )}
        </div>

        {/* 시계 폰트 크기 섹션 */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            onClick={() => toggleSection('clock')}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">⏰ 시계 폰트 크기</span>
            <span className="text-gray-400">{expandedSection === 'clock' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'clock' && (
            <div className="px-4 pb-4 space-y-4">
              {/* 시간 폰트 크기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  시간 ({clockTimeFontSize}px)
                </label>
                <input
                  type="range"
                  min="80"
                  max="200"
                  value={clockTimeFontSize}
                  onChange={(e) => setClockTimeFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* 날짜 폰트 크기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜 ({clockDateFontSize}px)
                </label>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={clockDateFontSize}
                  onChange={(e) => setClockDateFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* 오전/오후 폰트 크기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  오전/오후 ({clockPeriodFontSize}px)
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={clockPeriodFontSize}
                  onChange={(e) => setClockPeriodFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* 자막 폰트 크기 섹션 */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            onClick={() => toggleSection('subtitleFont')}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <span className="font-medium text-gray-900">📏 자막 폰트 크기</span>
            <span className="text-gray-400">{expandedSection === 'subtitleFont' ? '−' : '+'}</span>
          </button>
          
          {expandedSection === 'subtitleFont' && (
            <div className="px-4 pb-4 space-y-4">
              {/* 일반 텍스트 크기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일반 텍스트 ({subtitleFontSize}px)
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={subtitleFontSize}
                  onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>              
              {/* 작은 텍스트 크기 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작은 텍스트 ({subtitleSmallFontSize}px)
                </label>
                <input
                  type="range"
                  min="25"
                  max="100"
                  value={subtitleSmallFontSize}
                  onChange={(e) => setSubtitleSmallFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              
              {/* 줄간격 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  줄간격 ({subtitleLineHeight})
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="2.0"
                  step="0.1"
                  value={subtitleLineHeight}
                  onChange={(e) => setSubtitleLineHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* 빠른 링크 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-medium text-gray-900 mb-3">🔗 빠른 링크</h3>
          <div className="space-y-2">
            <a 
              href="/"
              target="_blank"
              className="block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg text-center"
            >
              📺 메인 화면 보기
            </a>
            <a 
              href="/list"
              className="block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg text-center"
            >
              📹 비디오 관리
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}