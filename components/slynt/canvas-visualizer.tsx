"use client";

import { useEffect, useRef } from "react";
import type { AudioAnalyserRef, ControlValues } from "@/types/editor";

type CanvasVisualizerProps = {
  audioAnalyserRef: AudioAnalyserRef;
  controlValues: ControlValues;
  effectId: string;
  isPlaying: boolean;
};

export function CanvasVisualizer({
  audioAnalyserRef,
  controlValues,
  effectId,
  isPlaying,
}: CanvasVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dimensionsRef = useRef({ height: 1, ratio: 1, width: 1 });

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
    const frequencyData = new Uint8Array(1024);
    const waveformData = new Uint8Array(1024);
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
      const motionScale = reducedMotion ? 0.08 : isPlaying ? 1 : 0.24;
      elapsed += delta * motionScale;

      const analyser = audioAnalyserRef.current;
      const frequencyLength = analyser?.frequencyBinCount ?? frequencyData.length;

      if (analyser) {
        if (frequencyData.length !== frequencyLength) {
          return;
        }
        analyser.smoothingTimeConstant = 0.45 + controlValues.smoothing / 220;
        analyser.getByteFrequencyData(frequencyData);
        analyser.getByteTimeDomainData(waveformData);
      } else {
        fillIdleAudioData(frequencyData, waveformData, elapsed, isPlaying);
      }

      const { height, width } = dimensionsRef.current;
      const audioEnergy = getAverageEnergy(frequencyData);
      const bassEnergy = getBandEnergy(frequencyData, 0.02, 0.16);
      const sensitivity = controlValues.sensitivity / 100;
      const intensity = controlValues.intensity / 100;
      const pulse = Math.min(1, audioEnergy * (0.65 + sensitivity * 1.45));

      context.clearRect(0, 0, width, height);
      drawHaze(context, width, height, pulse, bassEnergy, controlValues);

      drawGridSpectrum(
        context,
        frequencyData,
        width,
        height,
        elapsed,
        pulse,
        intensity,
        controlValues,
        effectId,
      );

      animationId = window.requestAnimationFrame(render);
    };

    animationId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [audioAnalyserRef, controlValues, effectId, isPlaying]);

  return (
    <canvas
      aria-label="Audio reactive visualizer"
      className="h-full w-full"
      ref={canvasRef}
      role="img"
    >
      Audio reactive preview.
    </canvas>
  );
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawGridSpectrum(
  context: CanvasRenderingContext2D,
  frequencyData: Uint8Array,
  width: number,
  height: number,
  elapsed: number,
  pulse: number,
  intensity: number,
  controlValues: ControlValues,
  effectId: string,
) {
  const columns = Math.max(12, Math.round(controlValues.density / 3));
  const rows =
    effectId === "frequency-ring" || effectId === "particles-reactive" ? 14 : 12;
  const gridWidth = width * 0.74;
  const gridHeight = height * 0.5;
  const gap = Math.max(4, width * 0.006);
  const cellWidth = (gridWidth - gap * (columns - 1)) / columns;
  const cellHeight = (gridHeight - gap * (rows - 1)) / rows;
  const originX = (width - gridWidth) / 2;
  const originY = height * 0.22;
  const scanX =
    originX +
    ((elapsed * (0.00008 + controlValues.speed * 0.00004)) % 1) * gridWidth;

  context.save();
  context.translate(originX, originY);
  context.shadowColor = "#f5f5f0";
  context.shadowBlur = controlValues.glowEnabled
    ? controlValues.glowBlur * (controlValues.glowIntensity / 180)
    : 0;
  context.strokeStyle = "rgba(255,255,255,0.16)";
  context.fillStyle = "rgba(255,255,255,0.03)";
  roundRect(context, -14, -14, gridWidth + 28, gridHeight + 28, 8);
  context.fill();
  context.stroke();

  for (let column = 0; column < columns; column += 1) {
    const sampleIndex = Math.floor((column / columns) * frequencyData.length);
    const sample = frequencyData[sampleIndex] / 255;
    const wave =
      effectId === "waveform" || effectId === "radial-wave"
        ? Math.max(0, Math.sin(column * 0.42 + elapsed * 0.004)) * 0.16
        : 0;
    const level = Math.min(
      1,
      sample * (0.7 + controlValues.sensitivity / 80) * intensity + wave,
    );
    const activeRows = Math.max(1, Math.round(level * rows));

    for (let row = 0; row < rows; row += 1) {
      const active = rows - row <= activeRows;
      const x = column * (cellWidth + gap);
      const y = row * (cellHeight + gap);
      const distanceToScan = Math.abs(originX + x - scanX) / Math.max(1, gridWidth);
      const scanBoost = Math.max(0, 0.18 - distanceToScan);
      const transientBoost =
        effectId === "particles-reactive" && (column + row + Math.floor(elapsed / 42)) % 9 === 0
          ? pulse * 0.36
          : 0;

      context.globalAlpha = active
        ? Math.min(0.95, 0.28 + sample * 0.54 + scanBoost + transientBoost)
        : 0.07 + scanBoost * 0.3;
      context.fillStyle = active ? "#f5f5f0" : "rgba(255,255,255,0.16)";
      roundRect(context, x, y, cellWidth, cellHeight, 2);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.12)";
      context.stroke();
    }
  }

  context.restore();
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawHaze(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  pulse: number,
  bassEnergy: number,
  controlValues: ControlValues,
) {
  const centerX = width / 2;
  const centerY = height * 0.48;
  const haze = context.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    width * (0.22 + bassEnergy * 0.24),
  );

  haze.addColorStop(0, `rgba(245,245,240,${0.1 + pulse * 0.22})`);
  haze.addColorStop(0.52, `rgba(150,150,146,${0.04 + pulse * 0.12})`);
  haze.addColorStop(1, "rgba(5,5,6,0)");
  context.globalAlpha = controlValues.intensity / 100;
  context.fillStyle = haze;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 1;
}

function fillIdleAudioData(
  frequencyData: Uint8Array,
  waveformData: Uint8Array,
  elapsed: number,
  isPlaying: boolean,
) {
  const motion = isPlaying ? 1 : 0.35;

  for (let index = 0; index < frequencyData.length; index += 1) {
    const wave =
      Math.sin(elapsed * 0.003 + index * 0.09) * 0.5 +
      Math.sin(elapsed * 0.0014 + index * 0.021) * 0.5;
    frequencyData[index] = Math.max(0, Math.min(255, (26 + wave * 18) * motion));
    waveformData[index] = Math.max(
      0,
      Math.min(255, 128 + Math.sin(elapsed * 0.004 + index * 0.05) * 22 * motion),
    );
  }
}

function getAverageEnergy(data: Uint8Array) {
  let total = 0;

  for (let index = 0; index < data.length; index += 1) {
    total += data[index];
  }

  return total / data.length / 255;
}

function getBandEnergy(data: Uint8Array, start: number, end: number) {
  const first = Math.floor(data.length * start);
  const last = Math.max(first + 1, Math.floor(data.length * end));
  let total = 0;

  for (let index = first; index < last; index += 1) {
    total += data[index];
  }

  return total / (last - first) / 255;
}
