"use client";
import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  FaceLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type FaceZone =
  | "CENTER"
  | "UP"
  | "DOWN"
  | "LEFT"
  | "RIGHT"
  | "UP-LEFT"
  | "UP-RIGHT"
  | "DOWN-LEFT"
  | "DOWN-RIGHT";

export function useFaceLandmarker() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [zone, setZone] = useState<FaceZone>("CENTER");
  const [angle, setAngle] = useState<{ yaw: number; pitch: number; roll: number }>({
    yaw: 0,
    pitch: 0,
    roll: 0,
  });
  const [landmarks, setLandmarks] = useState<any[]>([]);

  useEffect(() => {
    let landmarker: FaceLandmarker | null = null;
    let animationFrame: number;
    let running = true;

    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/face_landmarker.task", // <-- make sure model is here
        },
        runningMode: "VIDEO",
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFacialTransformationMatrixes: true,
      });

      if (videoRef.current) {
        videoRef.current.style.transform = "scaleX(-1)";
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
        videoRef.current.srcObject = stream;

        videoRef.current.onloadeddata = () => {
          videoRef.current?.play();
          loop();
        };
      }
    };

    const loop = () => {
      if (!running || !landmarker || !videoRef.current) return;

      const now = performance.now();
      const res: FaceLandmarkerResult = landmarker.detectForVideo(
        videoRef.current,
        now
      );

      if (res.faceLandmarks?.length) {
        setLandmarks(res.faceLandmarks[0]);

        if (res.facialTransformationMatrixes?.length) {
          const m = res.facialTransformationMatrixes[0].data;
          // Rotation matrix
          const r00 = m[0], r01 = m[1], r02 = m[2];
          const r10 = m[4], r11 = m[5], r12 = m[6];
          const r20 = m[8], r21 = m[9], r22 = m[10];

          const pitch = Math.atan2(-r20, Math.sqrt(r00 * r00 + r10 * r10));
          const yaw = Math.atan2(r10, r00);
          const roll = Math.atan2(r21, r22);

          const deg = {
            yaw: (yaw * 180) / Math.PI,
            pitch: (pitch * 180) / Math.PI,
            roll: (roll * 180) / Math.PI,
          };
          setAngle(deg);

          // Map yaw/pitch into zones
          const tol = 15;
          let detected: FaceZone = "CENTER";
          if (deg.pitch > tol) detected = "DOWN";
          else if (deg.pitch < -tol) detected = "UP";
          if (deg.yaw > tol) detected = "RIGHT";
          else if (deg.yaw < -tol) detected = "LEFT";
          if (deg.yaw > tol && deg.pitch < -tol) detected = "UP-RIGHT";
          if (deg.yaw < -tol && deg.pitch < -tol) detected = "UP-LEFT";
          if (deg.yaw > tol && deg.pitch > tol) detected = "DOWN-RIGHT";
          if (deg.yaw < -tol && deg.pitch > tol) detected = "DOWN-LEFT";

          setZone(detected);
        }
      }

      animationFrame = requestAnimationFrame(loop);
    };

    init();

    return () => {
      running = false;
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return { zone, angle, landmarks, videoRef };
}
