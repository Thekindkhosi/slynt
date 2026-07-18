"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Radio, ScanLine, Shuffle } from "lucide-react";

const DURATION = 347;
const TRACKS = [
  {
    artist: "Mira Vale",
    bpm: 132,
    code: "SLYNT-2099-A",
    key: "F MIN",
    title: "Glass Transit",
  },
  {
    artist: "North Index",
    bpm: 124,
    code: "SLYNT-2099-B",
    key: "C# MIN",
    title: "Cold Signal",
  },
  {
    artist: "Orchid Machine",
    bpm: 138,
    code: "SLYNT-2099-C",
    key: "A MIN",
    title: "Static Bloom",
  },
];

export function EditorialAudioVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [seconds, setSeconds] = useState(184);
  const [mode, setMode] = useState<"field" | "mesh">("field");

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((current) => (current + 1) % DURATION);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setInterval(() => {
      setMode((current) => (current === "field" ? "mesh" : "field"));
    }, 6200);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    let animationFrame = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * ratio);
      canvas.height = Math.floor(rect.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = (time: number) => {
      const delta = Math.min(42, time - lastTime);
      lastTime = time;
      elapsed += delta * (isPlaying ? 1 : 0.16);

      const { height, width } = canvas.getBoundingClientRect();
      const beat = (Math.sin(elapsed * 0.0054) + 1) / 2;
      const transient = Math.pow((Math.sin(elapsed * 0.011) + 1) / 2, 6);

      context.clearRect(0, 0, width, height);
      drawEditorialGrid(context, width, height, elapsed);

      if (mode === "field") {
        drawPixelFrequencyField(context, width, height, elapsed, beat, transient);
      } else {
        drawWireframeMesh(context, width, height, elapsed, beat, transient);
      }

      drawTelemetry(context, width, height, elapsed, mode, beat);
      animationFrame = window.requestAnimationFrame(render);
    };

    animationFrame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [isPlaying, mode]);

  const progress = seconds / DURATION;
  const currentTrack = TRACKS[Math.floor(seconds / 116) % TRACKS.length];

  return (
    <main className="min-h-screen bg-[#030303] text-[#f4f4f1]">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="relative min-h-[58vh] overflow-hidden border-b border-white/12 lg:min-h-screen lg:border-b-0 lg:border-r">
          <canvas
            aria-label="Alternating audio reactive pixel frequency field and deformed wireframe mesh"
            className="absolute inset-0 h-full w-full"
            ref={canvasRef}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.045)_49.9%,rgba(255,255,255,0.16)_50%,rgba(255,255,255,0.045)_50.1%,transparent_100%)]" />
          <div className="absolute left-5 top-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-white/58 sm:left-8 sm:top-8">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            Live Data Composition
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/44">
                Mode / {mode === "field" ? "Pixel Frequency Field" : "Deformed Wire Mesh"}
              </p>
              <h1 className="mt-2 max-w-[11ch] text-5xl font-semibold uppercase leading-[0.9] tracking-normal sm:text-7xl xl:text-8xl">
                SLYNT
              </h1>
            </div>
            <div className="hidden w-52 grid-cols-12 gap-1 sm:grid" aria-hidden="true">
              {Array.from({ length: 48 }).map((_, index) => (
                <span
                  className="h-1 bg-white/70"
                  key={index}
                  style={{
                    opacity:
                      index / 48 < progress
                        ? 0.24 + ((index * 17) % 9) / 12
                        : 0.09,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="relative flex min-h-screen flex-col justify-between overflow-hidden px-5 py-6 sm:px-8 lg:px-10">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:100%_64px]" />
          <div className="relative">
            <div className="flex items-start justify-between gap-6 border-b border-white/14 pb-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/42">
                  Transmission
                </p>
                <div className="mt-3 font-mono text-6xl leading-none tracking-normal text-white sm:text-7xl xl:text-8xl">
                  {formatTime(seconds)}
                </div>
              </div>
              <button
                aria-label={isPlaying ? "Pause visualizer" : "Play visualizer"}
                className="grid h-11 w-11 place-items-center border border-white/25 bg-white text-black hover:bg-white/82"
                onClick={() => setIsPlaying((current) => !current)}
                type="button"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="mt-10 grid gap-8">
              <div className="aspect-square w-full max-w-[360px] border border-white/18 bg-[#070707] p-4">
                <div className="relative h-full overflow-hidden border border-white/16 bg-[radial-gradient(circle_at_62%_38%,rgba(255,255,255,0.24),transparent_19%),linear-gradient(135deg,#f7f7f4_0_1px,transparent_1px_18px),#0a0a0a]">
                  <div className="absolute inset-x-8 top-1/2 h-px bg-white/55" />
                  <div className="absolute inset-y-8 left-1/2 w-px bg-white/55" />
                  <div className="absolute bottom-5 left-5 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
                    {currentTrack.code}
                  </div>
                  <ScanLine className="absolute right-5 top-5 h-5 w-5 text-white/60" aria-hidden="true" />
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/42">
                  Now Playing
                </p>
                <h2 className="mt-3 text-4xl font-semibold uppercase leading-none tracking-normal sm:text-5xl">
                  {currentTrack.title}
                </h2>
                <p className="mt-3 text-lg uppercase tracking-[0.12em] text-white/62">
                  {currentTrack.artist}
                </p>
              </div>

              <div className="grid grid-cols-3 border-y border-white/14 py-4 font-mono text-xs uppercase tracking-[0.18em] text-white/62">
                <span>{currentTrack.bpm} BPM</span>
                <span>{currentTrack.key}</span>
                <span className="text-right">{mode === "field" ? "PX-FLD" : "WR-MSH"}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-12">
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
              <span>Playlist Index</span>
              <span>{Math.round(progress * 100).toString().padStart(2, "0")}%</span>
            </div>
            <div
              className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1"
              aria-label="Segmented track progress"
            >
              {Array.from({ length: 72 }).map((_, index) => (
                <span
                  className="h-10 border border-white/14"
                  key={index}
                  style={{
                    background:
                      index / 72 < progress
                        ? `rgba(244,244,241,${0.24 + ((index * 13) % 7) / 14})`
                        : "rgba(255,255,255,0.025)",
                  }}
                />
              ))}
            </div>
            <div className="mt-8 space-y-4">
              {TRACKS.map((track, index) => (
                <div
                  className="grid grid-cols-[1.7rem_1fr_auto] items-center gap-3 border-t border-white/10 pt-4 text-sm"
                  key={track.code}
                >
                  <span className="font-mono text-white/36">0{index + 1}</span>
                  <span>
                    <span className="block uppercase tracking-[0.1em] text-white/82">
                      {track.title}
                    </span>
                    <span className="block text-xs uppercase tracking-[0.16em] text-white/38">
                      {track.artist}
                    </span>
                  </span>
                  <Shuffle className="h-3.5 w-3.5 text-white/44" aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function drawEditorialGrid(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
) {
  context.fillStyle = "#030303";
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(255,255,255,0.07)";
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += 54) {
    context.beginPath();
    context.moveTo(x + ((elapsed * 0.01) % 54), 0);
    context.lineTo(x + ((elapsed * 0.01) % 54), height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += 54) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function drawPixelFrequencyField(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  beat: number,
  transient: number,
) {
  const columns = 46;
  const rows = 28;
  const gap = Math.max(4, width * 0.006);
  const fieldWidth = Math.min(width * 0.76, 820);
  const fieldHeight = Math.min(height * 0.56, 520);
  const cellWidth = (fieldWidth - gap * (columns - 1)) / columns;
  const cellHeight = (fieldHeight - gap * (rows - 1)) / rows;
  const originX = (width - fieldWidth) / 2;
  const originY = (height - fieldHeight) / 2 - height * 0.03;

  context.save();
  context.translate(originX, originY);

  for (let column = 0; column < columns; column += 1) {
    const bass = Math.sin(column * 0.32 + elapsed * 0.006) * 0.5 + 0.5;
    const cut = Math.pow(bass, 1.7) * rows * (0.26 + beat * 0.64);

    for (let row = 0; row < rows; row += 1) {
      const noise =
        Math.sin(column * 1.8 + row * 0.42 + elapsed * 0.003) * 0.5 + 0.5;
      const active = rows - row < cut + noise * 5 + transient * 10;
      const x = column * (cellWidth + gap);
      const y = row * (cellHeight + gap);

      context.fillStyle = active
        ? `rgba(244,244,241,${0.28 + noise * 0.46 + transient * 0.22})`
        : "rgba(255,255,255,0.055)";
      context.fillRect(x, y, cellWidth, cellHeight);
    }
  }

  context.restore();
}

function drawWireframeMesh(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  beat: number,
  transient: number,
) {
  const columns = 30;
  const rows = 19;
  const meshWidth = Math.min(width * 0.78, 900);
  const meshHeight = Math.min(height * 0.52, 480);
  const originX = (width - meshWidth) / 2;
  const originY = (height - meshHeight) / 2;
  const points: Array<Array<{ x: number; y: number }>> = [];

  for (let row = 0; row < rows; row += 1) {
    points[row] = [];
    for (let column = 0; column < columns; column += 1) {
      const px = originX + (column / (columns - 1)) * meshWidth;
      const py = originY + (row / (rows - 1)) * meshHeight;
      const centerPull = Math.sin((column - columns / 2) * 0.28 + elapsed * 0.004);
      const lift =
        Math.sin(row * 0.66 + elapsed * 0.005) * 18 +
        Math.cos(column * 0.52 + elapsed * 0.003) * 28 * beat +
        centerPull * transient * 50;

      points[row][column] = {
        x: px + Math.sin(row * 0.4 + elapsed * 0.002) * 18,
        y: py + lift,
      };
    }
  }

  context.strokeStyle = "rgba(244,244,241,0.46)";
  context.lineWidth = 1;

  for (const row of points) {
    drawPath(context, row);
  }

  for (let column = 0; column < columns; column += 1) {
    drawPath(
      context,
      points.map((row) => row[column]),
    );
  }
}

function drawPath(
  context: CanvasRenderingContext2D,
  points: Array<{ x: number; y: number }>,
) {
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.stroke();
}

function drawTelemetry(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
  mode: "field" | "mesh",
  beat: number,
) {
  context.strokeStyle = "rgba(255,255,255,0.34)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(width * 0.08, height * 0.16);
  context.lineTo(width * 0.3, height * 0.16);
  context.moveTo(width * 0.7, height * 0.84);
  context.lineTo(width * 0.92, height * 0.84);
  context.stroke();

  context.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillStyle = "rgba(255,255,255,0.46)";
  context.fillText(`DATA ${mode.toUpperCase()} ${Math.floor(elapsed % 9999)}`, width * 0.08, height * 0.16 - 12);
  context.fillText(`RMS ${(beat * 0.91).toFixed(3)}`, width * 0.7, height * 0.84 + 20);
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
