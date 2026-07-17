"use client";

import { useEffect, useRef } from "react";

type CanvasVisualizerProps = {
  accent: string;
  density: number;
  intensity: number;
  isPlaying: boolean;
  speed: number;
};

export function CanvasVisualizer({
  accent,
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
      const centerY = height / 2;
      const bars = Math.round(36 + density * 0.72);
      const maxRadius = Math.min(width, height) * 0.34;
      const pulse = isPlaying ? Math.sin(frame * 0.055) * 0.5 + 0.5 : 0.36;

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

        context.strokeStyle = i % 5 === 0 ? "#38bdf8" : accent;
        context.globalAlpha = 0.24 + energy * 0.54;
        context.lineWidth = Math.max(1, 2 * ratio);
        context.beginPath();
        context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        context.stroke();
      }

      context.globalAlpha = 0.32;
      context.strokeStyle = "#f5f5f7";
      context.lineWidth = 1 * ratio;
      context.beginPath();
      context.arc(0, 0, maxRadius * (0.45 + pulse * 0.04), 0, Math.PI * 2);
      context.stroke();
      context.restore();

      context.globalAlpha = 0.18;
      context.strokeStyle = accent;
      context.lineWidth = 1.2 * ratio;
      for (let layer = 0; layer < 3; layer += 1) {
        context.beginPath();
        const yBase = height * (0.32 + layer * 0.16);
        for (let x = 0; x <= width; x += 8 * ratio) {
          const y =
            yBase +
            Math.sin(x * 0.008 + frame * 0.035 + layer) *
              (18 + intensity * 0.18) *
              ratio *
              (isPlaying ? 1 : 0.45);
          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }

      context.globalAlpha = 1;
      frame += isPlaying ? 1 : 0.12;
      animationId = window.requestAnimationFrame(render);
    };

    render();

    return () => window.cancelAnimationFrame(animationId);
  }, [accent, density, intensity, isPlaying, speed]);

  return <canvas className="h-full w-full" ref={canvasRef} />;
}
