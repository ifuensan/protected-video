import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function VideoPlayer({ file }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);

  // 🔐 Obtener URL firmada
  useEffect(() => {
    if (!file) return;
    fetch(`/api/video-url?file=${encodeURIComponent(file)}`)
      .then(res => res.json())
      .then(data => setVideoUrl(data.url))
      .catch(err => console.error("❌ Error al obtener la URL:", err));
  }, [file]);

  // ▶️ Inicializar Video.js
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      if (playerRef.current) {
        playerRef.current.dispose();
      }

      playerRef.current = videojs(videoRef.current, {
        controls: true,
        autoplay: false,
        preload: 'auto',
        responsive: true,
        fluid: true,
        sources: [{ src: videoUrl, type: 'video/mp4' }],
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [videoUrl]);

  // 🚫 Bloquear clic derecho
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const blockContextMenu = e => e.preventDefault();
      videoElement.addEventListener('contextmenu', blockContextMenu);
      return () => {
        videoElement.removeEventListener('contextmenu', blockContextMenu);
      };
    }
  }, []);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl aspect-video bg-black rounded overflow-hidden shadow">
        <div data-vjs-player className="w-full h-full">
          <video
            ref={videoRef}
            className="video-js w-full h-full object-contain"
            controlsList="nodownload"
          />
        </div>
      </div>
    </div>
  );
}
