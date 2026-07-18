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
  const barsRef = useRef<number[]>([]);
  const seedsRef = useRef<number[]>([]);
  const particlesRef = useRef<Particle[]>([]);

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
      const trebleEnergy = getBandEnergy(frequencyData, 0.48, 0.92);
      const sensitivity = controlValues.sensitivity / 100;
      const intensity = controlValues.intensity / 100;
      const pulse = Math.min(1, audioEnergy * (0.65 + sensitivity * 1.45));

      context.clearRect(0, 0, width, height);
      drawHaze(context, width, height, pulse, bassEnergy, controlValues);

      if (effectId === "waveform") {
        drawWaveform(context, waveformData, width, height, pulse, controlValues);
      } else if (effectId === "particles-reactive") {
        drawParticles(
          context,
          width,
          height,
          delta,
          elapsed,
          pulse,
          bassEnergy,
          particlesRef.current,
          controlValues,
        );
      } else if (effectId === "radial-wave") {
        drawRadialWave(
          context,
          frequencyData,
          width,
          height,
          elapsed,
          pulse,
          trebleEnergy,
          controlValues,
        );
      } else {
        drawCircularBars(
          context,
          frequencyData,
          width,
          height,
          elapsed,
          pulse,
          intensity,
          barsRef.current,
          seedsRef.current,
          controlValues,
          effectId,
        );
      }

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

type Particle = {
  angle: number;
  distance: number;
  seed: number;
  speed: number;
};

function drawCircularBars(
  context: CanvasRenderingContext2D,
  frequencyData: Uint8Array,
  width: number,
  height: number,
  elapsed: number,
  pulse: number,
  intensity: number,
  bars: number[],
  seeds: number[],
  controlValues: ControlValues,
  effectId: string,
) {
  const barCount = Math.round(40 + controlValues.density * 0.85);

  if (bars.length !== barCount) {
    bars.splice(0, bars.length, ...Array.from({ length: barCount }, () => 0));
    seeds.splice(
      0,
      seeds.length,
      ...Array.from({ length: barCount }, (_, index) => seededNoise(index + 1)),
    );
  }

  const centerX = width / 2;
  const centerY = height * 0.49;
  const radius = Math.min(width, height) * 0.14 * (1 + pulse * 0.16);
  const rotation =
    elapsed * 0.00008 * (effectId === "frequency-ring" ? 1.8 : 1);

  context.save();
  context.translate(centerX, centerY);
  context.rotate(rotation);

  context.strokeStyle = "rgba(245,245,247,0.24)";
  context.lineWidth = 1;
  context.beginPath();
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.stroke();

  for (let index = 0; index < barCount; index += 1) {
    const angle = (Math.PI * 2 * index) / barCount - Math.PI / 2;
    const frequencyIndex = Math.floor((index / barCount) * frequencyData.length);
    const frequencyEnergy = frequencyData[frequencyIndex] / 255;
    const seed = seeds[index] ?? 0;
    const target =
      frequencyEnergy * (0.72 + controlValues.sensitivity / 90) +
      Math.sin(elapsed * 0.004 + seed * 9) * 0.035;
    const lerpAmount = 0.045 + ((100 - controlValues.smoothing) / 100) * 0.25;

    bars[index] += (Math.max(0, target) - bars[index]) * lerpAmount;

    const energy = Math.max(0, Math.min(1, bars[index]));
    const length =
      (6 + energy * controlValues.barHeight * 0.92) * (0.55 + intensity);
    const inner = radius - (effectId === "frequency-ring" ? length * 0.18 : 0);
    const outer = radius + length;
    const sideMix = (Math.cos(angle) + 1) / 2;
    const color = mixRgb([245, 245, 240], [150, 150, 146], sideMix);

    context.strokeStyle = color;
    context.globalAlpha = 0.2 + energy * 0.72;
    context.lineWidth =
      effectId === "frequency-ring" ? 1 + energy * 0.9 : 1.3 + energy * 1.5;
    context.shadowColor = color;
    context.shadowBlur = controlValues.glowEnabled
      ? (controlValues.glowBlur * controlValues.glowIntensity * energy) / 240
      : 0;
    context.beginPath();
    context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
    context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
    context.stroke();
  }

  context.restore();
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawWaveform(
  context: CanvasRenderingContext2D,
  waveformData: Uint8Array,
  width: number,
  height: number,
  pulse: number,
  controlValues: ControlValues,
) {
  const centerY = height * 0.5;
  const amplitude = (height * 0.16 + pulse * height * 0.12) * (controlValues.intensity / 100);

  context.save();
  context.lineWidth = 1.8;
  context.shadowColor = "#f5f5f0";
  context.shadowBlur = controlValues.glowEnabled
    ? controlValues.glowBlur * (controlValues.glowIntensity / 100)
    : 0;

  for (let pass = 0; pass < 3; pass += 1) {
    context.beginPath();
    context.strokeStyle =
      pass === 0 ? "rgba(245,245,240,0.82)" : "rgba(150,150,146,0.32)";
    context.globalAlpha = pass === 0 ? 0.9 : 0.34;

    for (let index = 0; index < waveformData.length; index += 6) {
      const x = (index / (waveformData.length - 1)) * width;
      const sample = (waveformData[index] - 128) / 128;
      const y = centerY + sample * amplitude * (1 + pass * 0.42);

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.stroke();
  }

  context.restore();
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawRadialWave(
  context: CanvasRenderingContext2D,
  frequencyData: Uint8Array,
  width: number,
  height: number,
  elapsed: number,
  pulse: number,
  trebleEnergy: number,
  controlValues: ControlValues,
) {
  const centerX = width / 2;
  const centerY = height * 0.5;
  const baseRadius = Math.min(width, height) * 0.17;
  const points = Math.round(96 + controlValues.density);

  context.save();
  context.translate(centerX, centerY);
  context.shadowColor = "#f5f5f0";
  context.shadowBlur = controlValues.glowEnabled
    ? controlValues.glowBlur * (controlValues.glowIntensity / 120)
    : 0;

  for (let ring = 0; ring < 3; ring += 1) {
    context.beginPath();
    context.strokeStyle =
      ring === 0 ? "rgba(245,245,247,0.68)" : "rgba(150,150,146,0.22)";
    context.lineWidth = ring === 0 ? 1.4 : 1;
    context.globalAlpha = 0.8 - ring * 0.2;

    for (let index = 0; index <= points; index += 1) {
      const angle = (Math.PI * 2 * index) / points;
      const dataIndex = Math.floor((index / points) * frequencyData.length);
      const energy = frequencyData[dataIndex] / 255;
      const ripple =
        Math.sin(angle * (4 + ring) + elapsed * 0.003 + ring * 1.7) *
        trebleEnergy *
        18;
      const radius =
        baseRadius +
        ring * 22 +
        energy * controlValues.barHeight * 0.44 +
        pulse * 18 +
        ripple;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }

    context.closePath();
    context.stroke();
  }

  context.restore();
  context.globalAlpha = 1;
  context.shadowBlur = 0;
}

function drawParticles(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  delta: number,
  elapsed: number,
  pulse: number,
  bassEnergy: number,
  particles: Particle[],
  controlValues: ControlValues,
) {
  const count = Math.round(34 + controlValues.density * 1.3);

  while (particles.length < count) {
    const seed = seededNoise(particles.length + 4);
    particles.push({
      angle: seed * Math.PI * 2,
      distance: 18 + seededNoise(seed * 1000) * Math.min(width, height) * 0.34,
      seed,
      speed: 0.00018 + seed * 0.00034,
    });
  }
  particles.length = count;

  const centerX = width / 2;
  const centerY = height * 0.5;

  context.save();
  for (const particle of particles) {
    particle.angle += delta * particle.speed * (0.8 + controlValues.speed / 80);
    const beatDistance = particle.distance * (1 + bassEnergy * 0.8);
    const wobble = Math.sin(elapsed * 0.002 + particle.seed * 12) * 14;
    const x = centerX + Math.cos(particle.angle) * (beatDistance + wobble);
    const y = centerY + Math.sin(particle.angle) * (beatDistance + wobble);
    const size = 1.2 + pulse * 5.5 * (0.45 + particle.seed);
    const color = particle.seed > 0.55 ? "#f5f5f0" : "#9f9f9a";

    context.globalAlpha = 0.22 + pulse * 0.58;
    context.fillStyle = color;
    context.shadowColor = color;
    context.shadowBlur = controlValues.glowEnabled ? controlValues.glowBlur * 0.28 : 0;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
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

function seededNoise(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function mixRgb(
  from: [number, number, number],
  to: [number, number, number],
  amount: number,
) {
  const clamped = Math.max(0, Math.min(1, amount));
  const red = Math.round(from[0] + (to[0] - from[0]) * clamped);
  const green = Math.round(from[1] + (to[1] - from[1]) * clamped);
  const blue = Math.round(from[2] + (to[2] - from[2]) * clamped);
  return `rgb(${red}, ${green}, ${blue})`;
}
