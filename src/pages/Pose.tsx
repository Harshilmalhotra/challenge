"use client";
import React, { useEffect, useRef } from "react";
import { useFacePose } from "../hooks/useFaceLandmarker";

export default function PoseTestPage() {
  const { videoRef, yawDeg, pitchDeg, zone, ready } = useFacePose();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const w = cvs.width, h = cvs.height;
      ctx.clearRect(0, 0, w, h);

      // cross
      const cx = w / 2, cy = h / 2;
      const span = Math.min(w, h) * 0.3;

      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - span, cy);
      ctx.lineTo(cx + span, cy);
      ctx.moveTo(cx, cy - span);
      ctx.lineTo(cx, cy + span);
      ctx.stroke();

      // ball position
      const bx = cx + (yawDeg / 45) * span;
      const by = cy + (pitchDeg / 45) * span;

      ctx.beginPath();
      ctx.arc(bx, by, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#ff4a4a";
      ctx.fill();

      requestAnimationFrame(draw);
    };
    draw();
  }, [yawDeg, pitchDeg]);

  return (
    <div className="relative h-screen w-screen bg-black">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        width={640}
        height={480}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/65 text-white px-4 py-2 rounded">
        {ready ? (
          <>
            Yaw: {yawDeg.toFixed(1)}° | Pitch: {pitchDeg.toFixed(1)}° → Zone:{" "}
            <b>{zone}</b>
          </>
        ) : (
          <>Initializing camera…</>
        )}
      </div>
    </div>
  );
}
