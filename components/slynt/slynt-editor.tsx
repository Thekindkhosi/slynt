"use client";

import { useEffect, useMemo, useState } from "react";
import { effects, exportPresets } from "@/data/effects";
import type { EffectCategory, EffectValues } from "@/types/editor";
import { ControlSidebar } from "./control-sidebar";
import { EffectsBrowser } from "./effects-browser";
import { PreviewStage } from "./preview-stage";
import { TopNavigation } from "./top-navigation";

export function SlyntEditor() {
  const [activeCategory, setActiveCategory] = useState<EffectCategory>("Core");
  const [selectedEffectId, setSelectedEffectId] = useState(effects[0].id);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(42);
  const [effectValues, setEffectValues] = useState<EffectValues>({
    intensity: effects[0].intensity,
    motion: effects[0].motion,
    bloom: effects[0].bloom,
    density: effects[0].density,
  });
  const [exportPreset, setExportPreset] = useState(exportPresets[1]);
  const [transparent, setTransparent] = useState(false);
  const [loop, setLoop] = useState(true);

  const selectedEffect = useMemo(
    () => effects.find((effect) => effect.id === selectedEffectId) ?? effects[0],
    [selectedEffectId],
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
      setProgress((current) => (current >= 100 ? 0 : current + 0.35));
    }, 120);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1720px] flex-col px-4 py-3 sm:px-6 lg:px-8">
        <TopNavigation />

        <section className="grid flex-1 gap-4 py-4 xl:grid-cols-[minmax(0,1fr)_390px] lg:grid-cols-[minmax(0,1fr)_350px]">
          <div className="flex min-w-0 flex-col gap-4">
            <PreviewStage
              effect={selectedEffect}
              effectValues={effectValues}
              isPlaying={isPlaying}
              loop={loop}
              progress={progress}
              setIsPlaying={setIsPlaying}
              setLoop={setLoop}
              setProgress={setProgress}
            />

            <EffectsBrowser
              activeCategory={activeCategory}
              effects={filteredEffects}
              selectedEffectId={selectedEffectId}
              setActiveCategory={setActiveCategory}
              setSelectedEffect={(effect) => {
                setSelectedEffectId(effect.id);
                setEffectValues({
                  intensity: effect.intensity,
                  motion: effect.motion,
                  bloom: effect.bloom,
                  density: effect.density,
                });
              }}
            />
          </div>

          <ControlSidebar
            effect={selectedEffect}
            effectValues={effectValues}
            exportPreset={exportPreset}
            loop={loop}
            setEffectValues={setEffectValues}
            setExportPreset={setExportPreset}
            setLoop={setLoop}
            setTransparent={setTransparent}
            transparent={transparent}
          />
        </section>
      </div>
    </main>
  );
}
