'use client';
import { useEffect, useRef, useState } from 'react';

export default function VideoPlayer() {
  const videoRef = useRef(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadVideos = async () => {
    try {
      const response = await fetch(`/api/videos?t=${Date.now()}`);
      const videos = await response.json();
      console.log('Video files loaded:', videos);
      setVideoList(videos);
      setLoading(false);
    } catch (error) {
      console.error('Error loading video list:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
    
    const handleRefresh = () => {
      console.log('Refresh signal received, reloading videos...');
      loadVideos();
    };
    
    window.addEventListener('videoRefresh', handleRefresh);
    
    const eventSource = new EventSource('/api/refresh');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'refresh') {
        console.log('Refresh signal received, reloading videos...');
        loadVideos();
      }
    };
    
    return () => {
      window.removeEventListener('videoRefresh', handleRefresh);
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    if (videoList.length === 0 || loading) return;
    
    const video = videoRef.current;
    if (!video) return;

    console.log(`Setting up video ${currentVideoIndex}: ${videoList[currentVideoIndex]}`);
    
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';
    
    const videoUrl = `/video/${videoList[currentVideoIndex]}?t=${Date.now()}`;
    video.src = videoUrl;
    
    const loadAndPlay = async () => {
      try {
        await video.load();
        
        await new Promise((resolve) => {
          if (video.readyState >= 3) {
            resolve();
          } else {
            video.addEventListener('loadeddata', resolve, { once: true });
          }
        });
        
        await video.play();
        setIsPlaying(true);
        console.log(`Playing video: ${videoList[currentVideoIndex]}`);
      } catch (error) {
        console.error('Error playing video:', error);
        setTimeout(() => {
          playNextVideo();
        }, 1000);
      }
    };

    const handleEnded = () => {
      console.log(`Video ended: ${videoList[currentVideoIndex]}`);
      setIsPlaying(false);
      
      if (videoList.length === 1) {
        video.currentTime = 0;
        video.play().catch(console.error);
      } else {
        playNextVideo();
      }
    };
    
    const handleError = (e) => {
      console.error(`Error playing video: ${videoList[currentVideoIndex]}`, e);
      setIsPlaying(false);
      
      if (e.target.error) {
        console.error('Video error code:', e.target.error.code);
        console.error('Video error message:', e.target.error.message);
      }
      
      setTimeout(() => {
        playNextVideo();
      }, 1000);
    };
    
    const handleStalled = () => {
      console.warn('Video stalled, attempting to recover...');
      video.load();
    };
    
    const handleWaiting = () => {
      console.log('Video buffering...');
    };
    
    const handleCanPlay = () => {
      console.log('Video can play');
      if (!isPlaying) {
        video.play().catch(console.error);
      }
    };
    
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('stalled', handleStalled);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    
    loadAndPlay();
    
    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('stalled', handleStalled);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      
      video.pause();
      video.src = '';
    };
  }, [currentVideoIndex, videoList, loading]);
  
  const playNextVideo = () => {
    if (videoList.length > 0) {
      const nextIndex = (currentVideoIndex + 1) % videoList.length;
      console.log(`Switching to next video: ${currentVideoIndex} -> ${nextIndex}`);
      setCurrentVideoIndex(nextIndex);
    }
  };
  
  const handleUserInteraction = () => {
    const video = videoRef.current;
    if (video && !isPlaying) {
      video.play().then(() => {
        setIsPlaying(true);
        console.log('Video started after user interaction');
      }).catch(console.error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>비디오 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (videoList.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-2">비디오 파일이 없습니다</p>
          <p className="text-sm text-gray-400">public/video 폴더에 비디오를 추가하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black" onClick={handleUserInteraction}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        playsInline
        autoPlay
        preload="auto"
        controls={false}
        style={{
          backgroundColor: '#000000'
        }}
      >
        <source src={`/video/${videoList[currentVideoIndex]}`} type="video/mp4" />
        브라우저가 비디오 재생을 지원하지 않습니다.
      </video>
      
      {!isPlaying && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-sm">
          일시정지됨 (화면을 탭하세요)
        </div>
      )}
    </div>
  );
}