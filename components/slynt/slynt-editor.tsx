"use client";

import { useEffect, useMemo, useState } from "react";
import { effects } from "@/data/effects";
import type {
  AudioTrack,
  BackgroundValues,
  EffectCategory,
  ExportValues,
} from "@/types/editor";
import { ControlSidebar } from "./control-sidebar";
import { EffectsBrowser } from "./effects-browser";
import { PlaybackControls } from "./playback-controls";
import { PreviewStage } from "./preview-stage";
import { TopNavigation } from "./top-navigation";

export function SlyntEditor() {
  const [activeCategory, setActiveCategory] =
    useState<EffectCategory>("background");
  const [selectedByCategory, setSelectedByCategory] = useState<
    Record<EffectCategory, string>
  >({
    background: "gradient",
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
  const [backgroundValues, setBackgroundValues] = useState<BackgroundValues>({
    mode: "gradient",
    image: {
      brightness: 100,
      blur: 0,
      contrast: 100,
      fit: "cover",
      name: "",
      opacity: 100,
      positionX: 50,
      positionY: 50,
      scale: 100,
      url: "",
    },
    gradient: {
      activeStopId: "violet-core",
      stops: [
        {
          id: "violet-core",
          blur: 18,
          color: "#8b5cf6",
          positionX: 42,
          positionY: 38,
          size: 52,
        },
        {
          id: "cyan-edge",
          blur: 22,
          color: "#38bdf8",
          positionX: 70,
          positionY: 62,
          size: 36,
        },
        {
          id: "rose-floor",
          blur: 28,
          color: "#f43f5e",
          positionX: 24,
          positionY: 76,
          size: 28,
        },
      ],
    },
  });
  const [exportValues] = useState<ExportValues>({
    resolution: "1280 × 720 (HD)",
    frameRate: "30 FPS",
    aspectRatio: "16:9",
    videoFormat: "MP4",
    quality: "High",
  });
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

  useEffect(() => {
    const imageUrl = backgroundValues.image.url;

    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [backgroundValues.image.url]);

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

  const handleBackgroundImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);

    setBackgroundValues((current) => ({
      ...current,
      mode: "image",
      image: {
        ...current.image,
        name: file.name,
        url: imageUrl,
      },
    }));
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
            <PreviewStage backgroundValues={backgroundValues} />

            <PlaybackControls
              audioTrack={audioTrack}
              currentTime={currentTime}
              duration={duration}
              setCurrentTime={setCurrentTime}
              setDuration={setDuration}
              setIsPlaying={setIsPlaying}
              setVolume={setVolume}
              isPlaying={isPlaying}
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
                if (
                  effect.category === "background" &&
                  (effect.id === "image" || effect.id === "gradient")
                ) {
                  const mode = effect.id === "image" ? "image" : "gradient";
                  setBackgroundValues((current) => ({
                    ...current,
                    mode,
                  }));
                }
              }}
            />
          </div>

          <ControlSidebar
            activeCategory={activeCategory}
            backgroundValues={backgroundValues}
            onBackgroundImageUpload={handleBackgroundImageUpload}
            setBackgroundValues={setBackgroundValues}
          />
        </section>
      </div>
    </main>
  );
}
