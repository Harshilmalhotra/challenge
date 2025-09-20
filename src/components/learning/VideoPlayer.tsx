"use client";
import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useFacePose } from "../../hooks/useFaceLandmarker";

interface VideoPlayerProps {
  videoUrl: string; // YouTube URL
  title: string;
  onComplete?: () => void;
  onProgress?: (watchTime: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  onComplete,
  onProgress,
}) => {
  const { darkMode } = useTheme();
  const playerRef = useRef<ReactPlayer>(null);

  const [playing, setPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);

  // 👀 Face tracking
  const { videoRef: camRef, zone } = useFacePose();
  const lastToggleRef = useRef<number>(0);

  // 🔄 Face Pose → Play/Pause toggle
  useEffect(() => {
    if (zone === "BOTTOM_LEFT") {
      const now = Date.now();
      if (now - lastToggleRef.current < 1500) return; // debounce 1.5s
      lastToggleRef.current = now;
      setPlaying((prev) => !prev);
    }
  }, [zone]);

  // ⏱️ Watch time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (playing && playerRef.current) {
        const t = Math.floor(playerRef.current.getCurrentTime() || 0);
        setWatchTime(t);
        onProgress?.(t);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, onProgress]);

  // 📌 Event Handlers
  const handlePlayPause = () => setPlaying((prev) => !prev);

  const handleRewatch = () => {
    playerRef.current?.seekTo(0, "seconds");
    setPlaying(true);
  };

  const handleEnded = () => {
    setPlaying(false);
    onComplete?.();
  };

  return (
    <div className="flex gap-6">
      {/* Face tracking camera */}
      <video ref={camRef} autoPlay playsInline className="w-64 h-48 border" />

      {/* Video player */}
      <div
        className={`rounded-lg overflow-hidden ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-sm flex-1`}
      >
        <div className="relative aspect-video bg-black">
          <ReactPlayer
            ref={playerRef}
            url="/videos/videoplayback.mp4" // Use the correct relative path
            playing={playing}
            controls={false}
            width="100%"
            height="100%"
            onEnded={handleEnded}
          />
        </div>

        <div className="p-4">
          <h3
            className={`font-medium mb-3 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play / Pause */}
              <button
                onClick={handlePlayPause}
                className="flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
                <span className="ml-2">{playing ? "Pause" : "Play"}</span>
              </button>

              {/* Rewatch */}
              <button
                onClick={handleRewatch}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                <RotateCcw size={16} />
                <span className="ml-2">Rewatch</span>
              </button>
            </div>

            {/* Watch time */}
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Volume2 size={16} />
              <span>Watch time: {Math.floor(watchTime / 60)}m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
