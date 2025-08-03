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

  useEffect(() => {
    loadData();
    // subtitle 페이지에서는 스크롤 허용
    document.body.style.overflow = 'auto';
    
    // 컴포넌트 언마운트 시 원래대로 복원
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
        
        setTimeout(() => {
          window.open('/', '_blank');
        }, 1000);
      } else {
        setMessage('저장 실패');
      }
    } catch (error) {
      setMessage('오류 발생: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8 min-h-screen" style={{overflow: 'auto'}}>
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <h1 className="text-4xl font-bold text-white text-center">🎬 자막 및 설정 편집기</h1>
          <p className="text-blue-100 text-center mt-2">교회 빌보드 시스템 관리</p>
        </div>
        
        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-purple-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-800">화면 줌 제어</h2>
              <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Remote Control</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleZoom('zoomIn')}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🔍+ 확대
                </button>
                <button
                  onClick={() => handleZoom('zoomOut')}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🔍- 축소
                </button>
                <button
                  onClick={() => handleZoom('zoomReset')}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  🔄 원래크기
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mb-10">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-xl text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  저장 중...
                </div>
              ) : (
                <div className="flex items-center">
                  <span className="mr-2">💾</span>
                  저장 및 모든 화면 새로고침
                </div>
              )}
            </button>
          </div>

          <div className="mb-10">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-blue-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-800">자막 내용</h2>
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">subtitle.txt</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <textarea
                value={subtitleContent}
                onChange={(e) => setSubtitleContent(e.target.value)}
                className="w-full h-[300px] p-6 border-2 border-gray-300 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-lg leading-relaxed"
                placeholder="자막 내용을 입력하세요..."
                style={{ fontFamily: 'monospace' }}
              />
              <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
                <strong>💡 자막 문법:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• & : 줄바꿈</li>
                  <li>• $텍스트$ : 작은 글씨로 표시 (시간 등)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-green-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-800">시계 폰트 크기</h2>
              <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Clock Component</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">⏰ 시간</label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-blue-600">{clockTimeFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={clockTimeFontSize}
                    onChange={(e) => setClockTimeFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={clockTimeFontSize}
                    onChange={(e) => setClockTimeFontSize(Number(e.target.value))}
                    className="w-full mt-3 p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">📅 날짜</label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-green-600">{clockDateFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={clockDateFontSize}
                    onChange={(e) => setClockDateFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={clockDateFontSize}
                    onChange={(e) => setClockDateFontSize(Number(e.target.value))}
                    className="w-full mt-3 p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">🌅 오전/오후</label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-purple-600">{clockPeriodFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={clockPeriodFontSize}
                    onChange={(e) => setClockPeriodFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={clockPeriodFontSize}
                    onChange={(e) => setClockPeriodFontSize(Number(e.target.value))}
                    className="w-full mt-3 p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center mb-4">
              <div className="w-1 h-8 bg-orange-500 rounded-full mr-4"></div>
              <h2 className="text-2xl font-bold text-gray-800">자막 폰트 크기</h2>
              <span className="ml-3 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Subtitle Component</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex flex-wrap gap-6 justify-center">
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">📝 일반 텍스트</label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-orange-600">{subtitleFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="150"
                    value={subtitleFontSize}
                    onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={subtitleFontSize}
                    onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                    className="w-full mt-3 p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">🔤 작은 텍스트 ($표시)</label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-red-600">{subtitleSmallFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={subtitleSmallFontSize}
                    onChange={(e) => setSubtitleSmallFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    value={subtitleSmallFontSize}
                    onChange={(e) => setSubtitleSmallFontSize(Number(e.target.value))}
                    className="w-full mt-3 p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  />
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                  <label className="block text-lg font-semibold mb-3 text-gray-700">📏 줄간격</label>
                  <div className="text-center mb-3">
                    <span className="text-3xl font-bold text-indigo-600">{subtitleLineHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.0"
                    step="0.1"
                    value={subtitleLineHeight}
                    onChange={(e) => setSubtitleLineHeight(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0.8"
                    max="2.0"
                    step="0.1"
                    value={subtitleLineHeight}
                    onChange={(e) => setSubtitleLineHeight(Number(e.target.value))}
                    className="w-full mt-3 p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
              </div>
            </div>
          </div>



          {message && (
            <div className={`mt-6 p-6 rounded-xl text-center text-lg font-semibold shadow-lg ${
              message.includes('완료') 
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-2 border-green-200' 
                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-2 border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}