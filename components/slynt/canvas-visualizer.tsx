"use client";

import { useEffect, useRef } from "react";
import type { ControlValues } from "@/types/editor";

type CanvasVisualizerProps = {
  controlValues: ControlValues;
  isPlaying: boolean;
};

export function CanvasVisualizer({
  controlValues,
  isPlaying,
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef({ height: 1, ratio: 1, width: 1 });
  const barsRef = useRef<number[]>([]);
  const seedsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      const scaledWidth = Math.floor(width * ratio);
      const scaledHeight = Math.floor(height * ratio);

      if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }

      dimensionsRef.current = { height, ratio, width };
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = (time: number) => {
      const delta = Math.min(48, time - lastTime);
      lastTime = time;
      const reducedMotion = reducedMotionQuery.matches;
      elapsed += delta * (reducedMotion ? 0.04 : isPlaying ? 1 : 0.22);

      const { height, width } = dimensionsRef.current;
      const barCount = Math.round(72 + controlValues.density * 0.8);

      if (barsRef.current.length !== barCount) {
        barsRef.current = Array.from({ length: barCount }, () => 0);
        seedsRef.current = Array.from({ length: barCount }, (_, index) =>
          seededNoise(index + 1),
        );
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#050506";
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.48;
      const radius = Math.min(width, height) * 0.155;
      const timeScale = elapsed * 0.001 * (0.35 + controlValues.speed / 55);
      const beatPulse =
        (Math.sin(timeScale * 2.2) * 0.5 + 0.5) *
        (reducedMotion ? 0.03 : isPlaying ? 0.34 : 0.08) *
        (controlValues.sensitivity / 100);

      const haze = context.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        width * 0.42,
      );
      haze.addColorStop(0, "rgba(76, 29, 149, 0.20)");
      haze.addColorStop(0.48, "rgba(49, 46, 129, 0.10)");
      haze.addColorStop(1, "rgba(5, 5, 6, 0)");
      context.fillStyle = haze;
      context.fillRect(0, 0, width, height);

      context.save();
      context.globalAlpha = 0.38;
      const particleCount = reducedMotion ? 14 : 48;
      for (let i = 0; i < particleCount; i += 1) {
        const seed = i * 97.13;
        const x =
          ((Math.sin(seed) * 0.5 + 0.5) * width +
            elapsed * 0.006 * (0.04 + (i % 3) * 0.01)) %
          width;
        const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * height * 0.72;
        const size = i % 4 === 0 ? 1.4 : 0.7;
        context.fillStyle = i % 5 === 0 ? "#38bdf8" : "#8b5cf6";
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      context.save();
      context.translate(centerX, centerY);
      context.rotate(timeScale * 0.08);

      context.globalAlpha = 0.36;
      context.strokeStyle = "rgba(245, 245, 247, 0.5)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.stroke();

      for (let i = 0; i < barCount; i += 1) {
        const seed = seedsRef.current[i];
        const angle = (Math.PI * 2 * i) / barCount - Math.PI / 2;
        const baseWave =
          (Math.sin(timeScale * 2.7 + i * 0.19 + seed * 2.1) + 1) * 0.23;
        const secondaryWave =
          (Math.sin(timeScale * 5.1 + i * 0.41 + seed * 5.4) + 1) * 0.16;
        const randomVariation =
          (Math.sin(timeScale * (1.4 + seed * 2.2) + seed * 12.0) + 1) * 0.08;
        const target =
          baseWave +
          secondaryWave +
          beatPulse +
          (reducedMotion ? randomVariation * 0.2 : randomVariation);
        const lerpAmount = 0.05 + ((100 - controlValues.smoothing) / 100) * 0.26;

        barsRef.current[i] += (target - barsRef.current[i]) * lerpAmount;

        const energy = Math.max(0, Math.min(1, barsRef.current[i]));
        const length =
          (8 + energy * controlValues.barHeight * 0.74) *
          (0.45 + controlValues.intensity / 92);
        const inner = radius;
        const outer = inner + length;
        const sideMix = (Math.cos(angle) + 1) / 2;
        const color = mixRgb([139, 92, 246], [56, 189, 248], sideMix);

        context.strokeStyle = color;
        context.globalAlpha = 0.26 + energy * 0.62;
        context.lineWidth = 1.25 + energy * 1.05;
        context.shadowColor = color;
        context.shadowBlur = controlValues.glowEnabled
          ? (controlValues.glowBlur * controlValues.glowIntensity * energy) /
            420
          : 0;
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.stroke();
      }

      context.shadowBlur = 0;
      context.globalAlpha = 0.2;
      context.strokeStyle = "#f5f5f7";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(0, 0, radius * (0.74 + beatPulse * 0.08), 0, Math.PI * 2);
      context.stroke();
      context.restore();

      const floorY = height * 0.74;
      const floorGradient = context.createLinearGradient(0, floorY, 0, height);
      floorGradient.addColorStop(0, "rgba(139, 92, 246, 0.16)");
      floorGradient.addColorStop(0.46, "rgba(56, 189, 248, 0.06)");
      floorGradient.addColorStop(1, "rgba(5, 5, 6, 0)");
      context.fillStyle = floorGradient;
      context.fillRect(0, floorY, width, height - floorY);

      context.save();
      context.globalAlpha = 0.16;
      context.strokeStyle = "#a78bfa";
      context.lineWidth = 1;
      for (let line = 0; line < 8; line += 1) {
        const y = floorY + line * line * 2.5;
        context.beginPath();
        context.moveTo(width * 0.22, y);
        context.lineTo(width * 0.78, y);
        context.stroke();
      }
      context.restore();

      context.globalAlpha = 1;
      animationId = window.requestAnimationFrame(render);
    };

    animationId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [controlValues, isPlaying]);

  return (
    <canvas
      aria-label="Abstract circular audio visualizer with violet and cyan radial bars"
      className="h-full w-full"
      ref={canvasRef}
      role="img"
    >
      Abstract circular audio visualizer preview.
    </canvas>
  );
}

function seededNoise(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function mixRgb(from: [number, number, number], to: [number, number, number], amount: number) {
  const clamped = Math.max(0, Math.min(1, amount));
  const red = Math.round(from[0] + (to[0] - from[0]) * clamped);
  const green = Math.round(from[1] + (to[1] - from[1]) * clamped);
  const blue = Math.round(from[2] + (to[2] - from[2]) * clamped);
  return `rgb(${red}, ${green}, ${blue})`;
}
