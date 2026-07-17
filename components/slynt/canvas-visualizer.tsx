"use client";

import { useEffect, useRef } from "react";

type CanvasVisualizerProps = {
  density: number;
  intensity: number;
  isPlaying: boolean;
  speed: number;
};

export function CanvasVisualizer({
  density,
  intensity,
  isPlaying,
  speed,
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
    let frame = 0;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * ratio));
      const height = Math.max(1, Math.floor(rect.height * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.clearRect(0, 0, width, height);
      context.fillStyle = "#050506";
      context.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height * 0.48;
      const bars = Math.round(60 + density * 0.52);
      const maxRadius = Math.min(width, height) * 0.24;
      const pulse = isPlaying ? Math.sin(frame * 0.055) * 0.5 + 0.5 : 0.36;

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
      context.globalAlpha = 0.46;
      for (let i = 0; i < 42; i += 1) {
        const seed = i * 97.13;
        const x =
          ((Math.sin(seed) * 0.5 + 0.5) * width +
            frame * (0.04 + (i % 3) * 0.01)) %
          width;
        const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * height * 0.72;
        const size = (i % 4 === 0 ? 1.4 : 0.7) * ratio;
        context.fillStyle = i % 5 === 0 ? "#38bdf8" : "#8b5cf6";
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();

      context.save();
      context.translate(centerX, centerY);
      context.rotate(frame * 0.0018 * (speed / 42));

      for (let i = 0; i < bars; i += 1) {
        const angle = (Math.PI * 2 * i) / bars;
        const wave =
          Math.sin(frame * 0.045 + i * 0.72) * 0.5 +
          Math.cos(frame * 0.028 + i * 0.33) * 0.5;
        const energy = (wave + 1.1) / 2.2;
        const length = 16 * ratio + energy * intensity * 0.82 * ratio;
        const inner = maxRadius * (0.52 + pulse * 0.035);
        const outer = inner + length;

        const isRightSide = Math.cos(angle) > 0;
        context.strokeStyle = isRightSide ? "#38bdf8" : "#8b5cf6";
        context.globalAlpha = 0.28 + energy * 0.58;
        context.lineWidth = Math.max(1, 1.7 * ratio);
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.stroke();
      }

      context.globalAlpha = 0.24;
      context.strokeStyle = "#f5f5f7";
      context.lineWidth = 1 * ratio;
      context.beginPath();
      context.arc(0, 0, maxRadius * (0.45 + pulse * 0.04), 0, Math.PI * 2);
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
      context.lineWidth = 1 * ratio;
      for (let line = 0; line < 8; line += 1) {
        const y = floorY + line * line * 2.5 * ratio;
        context.beginPath();
        context.moveTo(width * 0.22, y);
        context.lineTo(width * 0.78, y);
        context.stroke();
      }
      context.restore();

      context.globalAlpha = 1;
      frame += isPlaying ? 1 : 0.12;
      animationId = window.requestAnimationFrame(render);
    };

    render();

    return () => window.cancelAnimationFrame(animationId);
  }, [density, intensity, isPlaying, speed]);

  return <canvas className="h-full w-full" ref={canvasRef} />;
}
