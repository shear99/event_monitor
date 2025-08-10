'use client';
'use client';
import { useState, useEffect, useRef } from 'react';

export default function VideoList() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadVideos();
    // list 페이지에서도 스크롤 허용
    document.body.style.overflow = 'auto';
    
    return () => {
      document.body.style.overflow = 'hidden';
    };
  }, []);

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      if (response.ok) {
        const videoList = await response.json();
        setVideos(videoList);
      }
    } catch (error) {
      console.error('비디오 목록 로드 실패:', error);
      setMessage('비디오 목록을 불러올 수 없습니다.');
    }
  };
  const handleFileSelect = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 비디오 파일 유효성 검사
      if (!file.type.startsWith('video/')) {
        setMessage(`${file.name}은(는) 비디오 파일이 아닙니다.`);
        continue;
      }
      formData.append('videos', file);
    }

    setUploading(true);
    setMessage('');

    try {
      console.log('📄 업로드 시작:', files.length, '개 파일');
      
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData
      });
      
      console.log('🔄 서버 응답:', response.status, response.statusText);
      
      // 응답 타입 확인
      const contentType = response.headers.get('content-type');
      console.log('📝 응답 타입:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ JSON이 아닌 응답:', textResponse.substring(0, 200));
        setMessage('서버에서 예상치 못한 응답을 받았습니다.');
        return;
      }

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 업로드 결과:', result);
        
        let message = `${result.uploaded}개 파일 업로드 완료!`;
        if (result.errors && result.errors.length > 0) {
          message += ` (오류: ${result.errors.length}개)`;
          console.warn('⚠️ 업로드 오류:', result.errors);
        }
        
        setMessage(message);
        loadVideos();
        
        await fetch('/api/refresh', { method: 'POST' });
        window.dispatchEvent(new CustomEvent('videoRefresh'));
      } else {
        const error = await response.json();
        console.error('❌ 업로드 실패:', error);
        setMessage(`업로드 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('💥 업로드 예외:', error);
      setMessage(`업로드 중 오류: ${error.message}`);
    } finally {
      setUploading(false);
      // 입력 필드 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const handleDelete = async (filename) => {
    if (!confirm(`${filename}을(를) 삭제하시겠습니까?`)) return;

    setLoading(true);
    try {
      console.log('🗑️ 삭제 시작:', filename);
      
      const response = await fetch('/api/videos/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      
      console.log('🔄 삭제 응답:', response.status);

      if (response.ok) {
        console.log('✅ 삭제 성공:', filename);
        setMessage(`${filename} 삭제 완료`);
        loadVideos();
        
        await fetch('/api/refresh', { method: 'POST' });
        window.dispatchEvent(new CustomEvent('videoRefresh'));
      } else {
        const error = await response.json();
        console.error('❌ 삭제 실패:', error);
        setMessage(`삭제 실패: ${error.message}`);
      }
    } catch (error) {
      console.error('💥 삭제 예외:', error);
      setMessage(`삭제 중 오류: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '알 수 없음';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleReorder = async (index, direction) => {
    const newVideos = [...videos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= videos.length) return;
    
    // 순서 바꾸기
    [newVideos[index], newVideos[targetIndex]] = [newVideos[targetIndex], newVideos[index]];
    setVideos(newVideos);    
    // 서버에 순서 저장
    try {
      await fetch('/api/videos/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: newVideos })
      });
      
      // 메인 화면 새로고침
      await fetch('/api/refresh', { method: 'POST' });
      
      // 비디오 플레이어 새로고침
      window.dispatchEvent(new CustomEvent('videoRefresh'));
    } catch (error) {
      setMessage('순서 변경 저장 실패');
      loadVideos(); // 실패 시 원래 목록으로 복원
    }
  };

  const handleRename = async (oldName) => {
    if (!newFileName.trim()) {
      setMessage('새 파일명을 입력하세요.');
      return;
    }
    
    // 확장자 확인 및 추가
    const oldExt = oldName.substring(oldName.lastIndexOf('.'));
    const finalNewName = newFileName.includes('.') ? newFileName : newFileName + oldExt;
    
    setLoading(true);
    try {
      const response = await fetch('/api/videos/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: finalNewName })
      });
      
      if (response.ok) {
        setMessage('파일명이 변경되었습니다.');
        loadVideos();
        await fetch('/api/refresh', { method: 'POST' });
        
        // 비디오 플레이어 새로고침
        window.dispatchEvent(new CustomEvent('videoRefresh'));
      } else {
        const error = await response.json();
        setMessage(error.message);
      }
    } catch (error) {
      setMessage('파일명 변경 실패: ' + error.message);
    } finally {
      setLoading(false);
      setEditingFile(null);
      setNewFileName('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const startEdit = (filename) => {
    setEditingFile(filename);
    setNewFileName(filename.replace(/\.[^/.]+$/, '')); // 확장자 제거
  };

  const cancelEdit = () => {
    setEditingFile(null);
    setNewFileName('');
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      {/* 모바일 헤더 */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">비디오 관리</h1>
          <span className="text-sm text-gray-500">{videos.length}개</span>
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg text-sm font-medium ${
          message.includes('완료') 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : message.includes('실패') || message.includes('오류')
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}
      {/* 업로드 섹션 */}
      <div className="bg-white border-b px-4 py-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className={`block w-full text-center py-3 px-4 rounded-lg font-medium ${
            uploading 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-blue-600 text-white active:bg-blue-700'
          }`}
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              업로드 중...
            </span>
          ) : (
            '📁 비디오 추가하기'
          )}
        </label>
        <p className="text-xs text-gray-500 mt-2 text-center">
          여러 파일을 한번에 선택할 수 있습니다
        </p>
      </div>
      {/* 비디오 목록 */}
      <div className="px-4 py-4">
        {videos.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📹</div>
            <p className="text-gray-500">비디오가 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">위 버튼을 눌러 비디오를 추가하세요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {videos.map((video, index) => (
              <div key={video} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      {editingFile === video ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            placeholder="새 파일명 (확장자 제외)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRename(video)}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                            >
                              저장
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-medium text-gray-900 break-all">
                            {video}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            재생 순서: {index + 1}번째
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* 컨트롤 버튼들 */}
                  {editingFile !== video && (
                    <div className="flex gap-2 mt-3">
                      {/* 순서 변경 버튼 */}
                      <button
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50 active:bg-gray-200"
                      >
                        ↑ 위로
                      </button>
                      <button
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === videos.length - 1}
                        className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50 active:bg-gray-200"
                      >
                        ↓ 아래로
                      </button>
                      
                      {/* 파일명 수정 버튼 */}
                      <button
                        onClick={() => startEdit(video)}
                        disabled={loading}
                        className="py-2 px-3 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 active:bg-blue-600"
                      >
                        ✏️ 수정
                      </button>
                      
                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleDelete(video)}
                        disabled={loading}
                        className="py-2 px-3 bg-red-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 active:bg-red-600"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 정보 및 링크 */}
      <div className="px-4 pb-8">
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 사용 팁</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 지원 형식: MP4, WebM, OGG</li>
            <li>• 비디오는 순서대로 반복 재생됩니다</li>
            <li>• 파일명에 특수문자는 피해주세요</li>
            <li>• 큰 파일은 업로드에 시간이 걸릴 수 있습니다</li>
          </ul>
        </div>

        {/* 빠른 링크 */}
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
              href="/subtitle"
              className="block w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg text-center"
            >
              ✏️ 자막 편집
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}