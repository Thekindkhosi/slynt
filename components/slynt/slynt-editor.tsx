"use client";

import { useEffect, useMemo, useState } from "react";
import { effects } from "@/data/effects";
import type {
  AudioTrack,
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
            <PreviewStage />

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
              }}
            />
          </div>

          <ControlSidebar />
        </section>
      </div>
    </main>
  );
}
