"use client";

import { useEffect, useMemo, useState } from "react";
import { effects } from "@/data/effects";
import type {
  AudioTrack,
  ControlValues,
  EffectCategory,
  ExportValues,
  SceneValues,
} from "@/types/editor";
import { ControlSidebar } from "./control-sidebar";
import { EffectsBrowser } from "./effects-browser";
import { PreviewStage } from "./preview-stage";
import { TopNavigation } from "./top-navigation";

export function SlyntEditor() {
  const [activeCategory, setActiveCategory] =
    useState<EffectCategory>("background");
  const [selectedBackground, setSelectedBackground] = useState("nebula");
  const [selectedVisualizer, setSelectedVisualizer] = useState("spectrum-bars");
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<EffectCategory, string>
  >({
    background: "nebula",
    "audio-reactives": "spectrum-bars",
    "track-progress": "minimal-line",
    playlist: "playlist-hidden",
    cover: "cover-hidden",
    text: "track-title",
    logo: "logo-hidden",
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(67);
  const [duration, setDuration] = useState(204);
  const [volume, setVolume] = useState(70);
  const [audioTrack, setAudioTrack] = useState<AudioTrack | null>(null);
  const [controlValues, setControlValues] = useState<ControlValues>({
    intensity: 75,
    sensitivity: 65,
    barHeight: 80,
    speed: 58,
    smoothing: 70,
    density: 60,
    glowEnabled: true,
    glowIntensity: 60,
    glowBlur: 28,
  });
  const [exportValues, setExportValues] = useState<ExportValues>({
    resolution: "1280 × 720 (HD)",
    frameRate: "30 FPS",
    aspectRatio: "16:9",
    videoFormat: "MP4",
    quality: "High",
  });
  const [sceneValues, setSceneValues] = useState<SceneValues>({
    backgroundBrightness: 52,
    cameraMovement: 18,
    motionAmount: 58,
    particleDensity: 42,
    sceneBlur: 12,
  });
  const [transparent, setTransparent] = useState(false);

  const selectedEffect = useMemo(
    () =>
      effects.find((effect) => effect.id === selectedVisualizer) ?? effects[0],
    [selectedVisualizer],
  );

  const inspectedEffect = useMemo(
    () =>
      effects.find((effect) => effect.id === selectedByCategory[activeCategory]) ??
      selectedEffect,
    [activeCategory, selectedByCategory, selectedEffect],
  );

  const filteredEffects = useMemo(
    () => effects.filter((effect) => effect.category === activeCategory),
    [activeCategory],
  );

  useEffect(() => {
    return () => {
      if (audioTrack) {
        URL.revokeObjectURL(audioTrack.url);
      }
    };
  }, [audioTrack]);

  const handleAudioUpload = (file: File) => {
    const track = {
      name: file.name,
      url: URL.createObjectURL(file),
    };

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioTrack(track);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-3 py-3 sm:px-5 lg:px-6 xl:px-8">
        <TopNavigation
          audioTrack={audioTrack}
          exportValues={exportValues}
          onAudioUpload={handleAudioUpload}
        />

        <section className="grid flex-1 grid-cols-1 gap-4 py-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="flex min-w-0 flex-col gap-4">
            <PreviewStage
              audioTrack={audioTrack}
              currentTime={currentTime}
              duration={duration}
              controlValues={controlValues}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              setCurrentTime={setCurrentTime}
              setDuration={setDuration}
              setVolume={setVolume}
              selectedBackground={selectedBackground}
              selectedVisualizer={selectedVisualizer}
              volume={volume}
            />

            <EffectsBrowser
              activeCategory={activeCategory}
              effects={filteredEffects}
              selectedEffectId={selectedByCategory[activeCategory]}
              setActiveCategory={setActiveCategory}
              setSelectedEffect={(effect) => {
                setSelectedByCategory((current) => ({
                  ...current,
                  [effect.category]: effect.id,
                }));

                if (effect.category === "background") {
                  setSelectedBackground(effect.id);
                  return;
                }

                if (effect.category === "audio-reactives") {
                  setSelectedVisualizer(effect.id);
                }
              }}
            />
          </div>

          <ControlSidebar
            activeCategory={activeCategory}
            controlValues={controlValues}
            effect={inspectedEffect}
            exportValues={exportValues}
            sceneValues={sceneValues}
            setControlValues={setControlValues}
            setExportValues={setExportValues}
            setSceneValues={setSceneValues}
            selectedVisualizer={selectedVisualizer}
            setSelectedVisualizer={(id) => {
              setSelectedVisualizer(id);
              setSelectedByCategory((current) => ({
                ...current,
                "audio-reactives": id,
              }));
            }}
            setTransparent={setTransparent}
            transparent={transparent}
          />
        </section>
      </div>
    </main>
  );
}
