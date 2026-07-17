"use client";

import { useEffect, useMemo, useState } from "react";
import { effects } from "@/data/effects";
import type { ControlValues, EffectCategory, ExportValues } from "@/types/editor";
import { ControlSidebar } from "./control-sidebar";
import { EffectsBrowser } from "./effects-browser";
import { PreviewStage } from "./preview-stage";
import { TopNavigation } from "./top-navigation";

export function SlyntEditor() {
  const [activeCategory, setActiveCategory] =
    useState<EffectCategory>("background");
  const [selectedBackground, setSelectedBackground] = useState("nebula");
  const [selectedVisualizer, setSelectedVisualizer] = useState("spectrum");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(67);
  const [duration] = useState(204);
  const [volume] = useState(70);
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
  });
  const [transparent, setTransparent] = useState(false);
  const [loop, setLoop] = useState(true);

  const selectedEffect = useMemo(
    () =>
      effects.find((effect) => effect.id === selectedVisualizer) ?? effects[0],
    [selectedVisualizer],
  );

  const filteredEffects = useMemo(
    () => effects.filter((effect) => effect.category === activeCategory),
    [activeCategory],
  );

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentTime((current) => (current >= duration ? 0 : current + 1));
    }, 120);

    return () => window.clearInterval(interval);
  }, [duration, isPlaying]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 py-3 sm:px-6 lg:px-8">
        <TopNavigation />

        <section className="grid flex-1 gap-4 py-4 xl:grid-cols-[minmax(0,1fr)_390px] lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="flex min-w-0 flex-col gap-4">
            <PreviewStage
              currentTime={currentTime}
              duration={duration}
              controlValues={controlValues}
              isPlaying={isPlaying}
              loop={loop}
              setIsPlaying={setIsPlaying}
              setLoop={setLoop}
              setCurrentTime={setCurrentTime}
              selectedBackground={selectedBackground}
              selectedVisualizer={selectedVisualizer}
              volume={volume}
            />

            <EffectsBrowser
              activeCategory={activeCategory}
              effects={filteredEffects}
              selectedEffectId={
                activeCategory === "background"
                  ? selectedBackground
                  : selectedVisualizer
              }
              setActiveCategory={setActiveCategory}
              setSelectedEffect={(effect) => {
                if (effect.category === "background") {
                  setSelectedBackground(effect.id);
                  return;
                }

                setSelectedVisualizer(effect.id);
              }}
            />
          </div>

          <ControlSidebar
            controlValues={controlValues}
            effect={selectedEffect}
            exportValues={exportValues}
            setControlValues={setControlValues}
            setExportValues={setExportValues}
            setTransparent={setTransparent}
            transparent={transparent}
          />
        </section>
      </div>
    </main>
  );
}
