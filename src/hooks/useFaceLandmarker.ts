"use client";
import { useEffect, useRef, useState } from "react";
import vision from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3";
const { FaceLandmarker, FilesetResolver } = vision;

export type PoseZone =
  | "LEFT"
  | "RIGHT"
  | "UP"
  | "DOWN"
  | "CENTER"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT"
  | "TOP_LEFT"
  | "TOP_RIGHT";

export function useFacePose() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [yawDeg, setYawDeg] = useState(0);
  const [pitchDeg, setPitchDeg] = useState(0);
  const [zone, setZone] = useState<PoseZone>("CENTER");
  const [ready, setReady] = useState(false);

  const emaYaw = useRef(0);
  const emaPitch = useRef(0);
  const alpha = 0.5; // smoothing factor

  useEffect(() => {
    let landmarker: any = null;
    let raf = 0;
    let running = true;

    const init = async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );

      landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFacialTransformationMatrixes: true,
      });

      if (!videoRef.current) return;

      videoRef.current.style.transform = "scaleX(-1)";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
        audio: false,
      });
      videoRef.current.srcObject = stream;
      videoRef.current.onloadeddata = () => {
        setReady(true);
        loop();
      };
    };

    const loop = () => {

      if (!running || !videoRef.current || !landmarker) return;
      // Prevent MediaPipe ROI error: only process if video has non-zero dimensions
      if (
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0
      ) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const now = performance.now();
      const res = landmarker.detectForVideo(videoRef.current, now);

      if (res?.facialTransformationMatrixes?.length) {
        const m = res.facialTransformationMatrixes[0].data as Float32Array;
        const r00 = m[0], r01 = m[4], r02 = m[8];
        const r10 = m[1], r11 = m[5], r12 = m[9];
        const r20 = m[2], r21 = m[6], r22 = m[10];

        // forward vector
        const fx = r02, fy = r12, fz = r22;

        // yaw: left-right, pitch: up-down
        let yaw = Math.atan2(fx, fz);
        yaw = -yaw; // mirror correction
        let pitch = Math.atan2(-fy, Math.hypot(fx, fz));

        const yawDegInstant = (yaw * 180) / Math.PI;
        const pitchDegInstant = (pitch * 180) / Math.PI;

        // smoothing
        emaYaw.current = alpha * yawDegInstant + (1 - alpha) * emaYaw.current;
        emaPitch.current = alpha * pitchDegInstant + (1 - alpha) * emaPitch.current;

        const yawClamped = Math.max(-45, Math.min(45, emaYaw.current));
        const pitchClamped = Math.max(-45, Math.min(45, emaPitch.current));

        setYawDeg(yawClamped);
        setPitchDeg(pitchClamped);

        // zone classification
        const dead = 8; // degrees threshold for diagonals/sides
        const centerYaw = 5;   // yaw within -5 to +5
        const centerPitch = 14; // pitch within -14 to +14

        let z: PoseZone = "CENTER";
        // Center zone first
        if (
          Math.abs(yawClamped) <= centerYaw &&
          Math.abs(pitchClamped) <= centerPitch
        ) {
          z = "CENTER";
        } else if (yawClamped <= -dead && pitchClamped >= dead) {
          z = "BOTTOM_LEFT";
        } else if (yawClamped >= dead && pitchClamped >= dead) {
          z = "BOTTOM_RIGHT";
        } else if (yawClamped <= -dead && pitchClamped <= -dead) {
          z = "TOP_LEFT";
        } else if (yawClamped >= dead && pitchClamped <= -dead) {
          z = "TOP_RIGHT";
        } else if (yawClamped > dead) {
          z = "RIGHT";
        } else if (yawClamped < -dead) {
          z = "LEFT";
        } else if (pitchClamped > dead) {
          z = "DOWN";
        } else if (pitchClamped < -dead) {
          z = "UP";
        }
        setZone(z);

        // Add console logs for debugging
        console.log(
          `[FacePose] Yaw: ${yawClamped.toFixed(2)}°, Pitch: ${pitchClamped.toFixed(2)}°, Zone: ${z}`
        );
      }

      raf = requestAnimationFrame(loop);
    };

    init();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, []);

  return { videoRef, yawDeg, pitchDeg, zone, ready };
}
