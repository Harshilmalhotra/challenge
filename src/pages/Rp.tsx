"use client";
import React, { useRef } from "react";

export default function ReactPlayerTest() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    videoRef.current?.play();
  };

  const handlePause = () => {
    videoRef.current?.pause();
  };

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-3xl">
        <h1 className="text-2xl font-bold text-center mb-4">🎬 ReactPlayer Test</h1>

        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            src="/videos/videoplayback.mp4"
            controls
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleSkip(-10)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            ⏪ 10s
          </button>
          <button
            onClick={handlePlay}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ▶️ Play
          </button>
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            ⏸️ Pause
          </button>
          <button
            onClick={() => handleSkip(10)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            10s ⏩
          </button>
        </div>
      </div>
    </div>
  );
}
