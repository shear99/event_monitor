'use client';
import { useEffect, useRef, useState } from 'react';

export default function VideoPlayer() {
  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/videos')
      .then(response => response.json())
      .then(videos => {
        console.log('Video files found:', videos);
        setVideoList(videos);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading video list:', error);
        setLoading(false);
      });
  }, []);

  const playNextVideo = () => {
    if (videoList.length > 0) {
      const nextIndex = (currentVideoIndex + 1) % videoList.length;
      console.log(`Playing next video: ${currentVideoIndex} -> ${nextIndex} (${videoList[nextIndex]})`);
      setCurrentVideoIndex(nextIndex);
    }
  };

  useEffect(() => {
    if (videoList.length === 0 || loading) return;
    
    const video = videoRef.current;
    if (!video) return;

    console.log(`Loading video ${currentVideoIndex}: ${videoList[currentVideoIndex]}`);
    
    // 비디오 속성 설정
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('x5-playsinline', 'true');
    
    // 새 비디오 소스 설정
    video.src = `/video/${videoList[currentVideoIndex]}`;
    video.load();

    const handleEnded = () => {
      console.log(`Video ended: ${videoList[currentVideoIndex]}`);
      if (videoList.length === 1) {
        // 비디오가 1개일 때는 같은 비디오를 다시 재생
        video.currentTime = 0;
        video.play();
      } else {
        playNextVideo();
      }
    };
    
    const handleError = (e) => {
      console.error(`Error playing video: ${videoList[currentVideoIndex]}`, e);
      setTimeout(() => playNextVideo(), 1000);
    };
    
    const handleCanPlay = () => {
      console.log(`Video can play: ${videoList[currentVideoIndex]}`);
      video.play().catch(e => {
        console.error('Auto play failed:', e);
        // 음소거 상태에서 재시도
        video.muted = true;
        video.play().catch(e2 => console.error('Manual play failed:', e2));
      });
    };

    // 이벤트 리스너 등록
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('canplay', handleCanPlay);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentVideoIndex, videoList, loading]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
        비디오 로딩 중...
      </div>
    );
  }

  if (videoList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">
        비디오 파일이 없습니다.
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      muted
      autoPlay
      playsInline
      preload="auto"
      controls={false}
      disablePictureInPicture
      webkit-playsinline="true"
      x5-playsinline="true"
      style={{
        backgroundColor: '#000000'
      }}
    >
      <source src={`/video/${videoList[currentVideoIndex]}`} type="video/mp4" />
      <p className="text-white text-center p-4">
        비디오를 재생할 수 없습니다.
      </p>
    </video>
  );
}