"use client";

import { Image, ListMusic, Palette, Plus, SlidersHorizontal, Type, Upload, X } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import type { EffectCategory, SlyntProject } from "@/types/editor";
import { ControlSection } from "./control-section";
import { RangeControl } from "./range-control";
import { SelectControl } from "./select-control";
import { ToggleControl } from "./toggle-control";

type ControlSidebarProps = {
  activeCategory: EffectCategory;
  onAssetUpload: (file: File, target: "background" | "cover" | "logo") => void;
  project: SlyntProject;
  selectedEffectId: string;
  setProject: (project: SlyntProject) => void;
};

export function ControlSidebar({
  activeCategory,
  onAssetUpload,
  project,
  selectedEffectId,
  setProject,
}: ControlSidebarProps) {
  return (
    <aside className="slynt-panel flex min-h-0 flex-col lg:sticky lg:top-[84px] lg:max-h-[calc(100vh-100px)]">
      <div className="border-b border-[var(--border-subtle)] px-4 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--text-muted)]">
          Controls
        </p>
        <h2 className="text-sm font-medium text-white">{categoryTitle(activeCategory)}</h2>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {activeCategory === "background" ? (
          <BackgroundControls onAssetUpload={onAssetUpload} project={project} setProject={setProject} />
        ) : activeCategory === "audio-reactives" ? (
          <VisualizerControls project={project} setProject={setProject} />
        ) : activeCategory === "track-progress" ? (
          <ProgressControls project={project} selectedEffectId={selectedEffectId} setProject={setProject} />
        ) : activeCategory === "playlist" ? (
          <PlaylistControls project={project} selectedEffectId={selectedEffectId} setProject={setProject} />
        ) : activeCategory === "cover" ? (
          <CoverControls onAssetUpload={onAssetUpload} project={project} setProject={setProject} />
        ) : activeCategory === "text" ? (
          <TextControls project={project} setProject={setProject} />
        ) : (
          <LogoControls onAssetUpload={onAssetUpload} project={project} selectedEffectId={selectedEffectId} setProject={setProject} />
        )}
      </div>
    </aside>
  );
}

function BackgroundControls({
  onAssetUpload,
  project,
  setProject,
}: ControlSidebarPropsSubset & { onAssetUpload: ControlSidebarProps["onAssetUpload"] }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <ControlSection icon={Palette} title="Mode">
        <SelectControl
          label="Background"
          onChange={(value) =>
            setProject({ ...project, background: { ...project.background, mode: value as SlyntProject["background"]["mode"] } })
          }
          options={["template", "gradient", "image"]}
          value={project.background.mode}
        />
        <RangeControl
          label="Overlay"
          onChange={(value) => setProject({ ...project, background: { ...project.background, overlayOpacity: value / 100 } })}
          value={Math.round(project.background.overlayOpacity * 100)}
        />
      </ControlSection>
      <ControlSection icon={Upload} title="Image">
        <AssetInput inputRef={inputRef} onChange={(file) => onAssetUpload(file, "background")} />
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] bg-[#070707] text-sm font-medium text-white transition hover:border-white/55" onClick={() => inputRef.current?.click()} type="button">
          <Upload className="h-4 w-4" />
          Upload background
        </button>
        <p className="mt-2 truncate text-xs text-[var(--text-secondary)]">{project.background.image.asset?.fileName ?? "No image selected"}</p>
      </ControlSection>
      <ControlSection icon={SlidersHorizontal} title="Image edit">
        <RangeControl label="Opacity" onChange={(value) => setProject({ ...project, background: { ...project.background, image: { ...project.background.image, opacity: value / 100 } } })} value={Math.round(project.background.image.opacity * 100)} />
        <RangeControl label="Brightness" max={180} min={40} onChange={(value) => setProject({ ...project, background: { ...project.background, image: { ...project.background.image, brightness: value / 100 } } })} value={Math.round(project.background.image.brightness * 100)} />
        <RangeControl label="Blur" max={40} suffix="px" onChange={(value) => setProject({ ...project, background: { ...project.background, image: { ...project.background.image, blur: value } } })} value={project.background.image.blur} />
      </ControlSection>
    </>
  );
}

function VisualizerControls({ project, setProject }: ControlSidebarPropsSubset) {
  const update = (values: Partial<SlyntProject["visualizer"]>) =>
    setProject({ ...project, visualizer: { ...project.visualizer, ...values } });

  return (
    <>
      <ControlSection icon={SlidersHorizontal} title="Template">
        <SelectControl label="Template" onChange={(value) => setProject({ ...project, templateId: value as SlyntProject["templateId"] })} options={["editorial-grid", "wireframe-terrain"]} value={project.templateId} />
      </ControlSection>
      <ControlSection icon={SlidersHorizontal} title="Motion">
        <RangeControl label="Sensitivity" max={200} min={10} onChange={(value) => update({ sensitivity: value / 100 })} value={Math.round(project.visualizer.sensitivity * 100)} />
        <RangeControl label="Intensity" max={200} min={10} onChange={(value) => update({ intensity: value / 100 })} value={Math.round(project.visualizer.intensity * 100)} />
        <RangeControl label="Height" max={200} min={10} onChange={(value) => update({ height: value / 100 })} value={Math.round(project.visualizer.height * 100)} />
        <RangeControl label="Density" max={160} min={8} onChange={(value) => update({ density: value })} value={project.visualizer.density} />
        <RangeControl label="Speed" max={200} min={0} onChange={(value) => update({ speed: value / 100 })} value={Math.round(project.visualizer.speed * 100)} />
      </ControlSection>
      <ControlSection icon={Palette} title="Glow">
        <ToggleControl checked={project.visualizer.glowEnabled} label="Enable glow" onCheckedChange={(checked) => update({ glowEnabled: checked })} />
        <RangeControl label="Glow blur" max={80} suffix="px" onChange={(value) => update({ glowBlur: value })} value={project.visualizer.glowBlur} />
      </ControlSection>
    </>
  );
}

function ProgressControls({ project, selectedEffectId, setProject }: ControlSidebarPropsSubset & { selectedEffectId: string }) {
  const style = normalizeProgressStyle(selectedEffectId);
  if (style !== project.progress.style) {
    setTimeout(() => setProject({ ...project, progress: { ...project.progress, style } }), 0);
  }

  return (
    <ControlSection icon={SlidersHorizontal} title="Progress">
      <SelectControl label="Style" onChange={(value) => setProject({ ...project, progress: { ...project.progress, style: value as SlyntProject["progress"]["style"] } })} options={["minimal-line", "circular-progress", "segmented-timeline", "waveform-timeline", "time-counter"]} value={project.progress.style} />
      <ToggleControl checked={project.progress.showElapsed} label="Show elapsed" onCheckedChange={(checked) => setProject({ ...project, progress: { ...project.progress, showElapsed: checked } })} />
      <ToggleControl checked={project.progress.showRemaining} label="Show remaining" onCheckedChange={(checked) => setProject({ ...project, progress: { ...project.progress, showRemaining: checked } })} />
      <ToggleControl checked={project.progress.showChapterMarkers} label="Chapter markers" onCheckedChange={(checked) => setProject({ ...project, progress: { ...project.progress, showChapterMarkers: checked } })} />
    </ControlSection>
  );
}

function PlaylistControls({ project, selectedEffectId, setProject }: ControlSidebarPropsSubset & { selectedEffectId: string }) {
  const mode = normalizePlaylistMode(selectedEffectId);
  const updateChapter = (id: string, values: Partial<SlyntProject["playlist"]["chapters"][number]>) =>
    setProject({ ...project, playlist: { ...project.playlist, chapters: project.playlist.chapters.map((chapter) => chapter.id === id ? { ...chapter, ...values } : chapter) } });

  return (
    <>
      <ControlSection icon={ListMusic} title="Display">
        <SelectControl label="Mode" onChange={(value) => setProject({ ...project, playlist: { ...project.playlist, displayMode: value as SlyntProject["playlist"]["displayMode"] } })} options={["hidden", "current-track", "compact-queue", "side-queue", "up-next"]} value={project.playlist.displayMode === mode ? project.playlist.displayMode : mode} />
      </ControlSection>
      {project.playlist.chapters.map((chapter, index) => (
        <ControlSection icon={ListMusic} key={chapter.id} title={`Chapter ${index + 1}`}>
          <TextInput label="Title" onChange={(title) => updateChapter(chapter.id, { title })} value={chapter.title} />
          <TextInput label="Artist" onChange={(artist) => updateChapter(chapter.id, { artist })} value={chapter.artist} />
          <RangeControl label="Start" max={Math.max(1, Math.round(project.canvas.durationInSeconds))} suffix="s" onChange={(startTimeSeconds) => updateChapter(chapter.id, { startTimeSeconds })} value={Math.round(chapter.startTimeSeconds)} />
        </ControlSection>
      ))}
      <button className="flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] text-sm text-white" onClick={() => setProject({ ...project, playlist: { ...project.playlist, chapters: [...project.playlist.chapters, { id: crypto.randomUUID(), title: "New chapter", artist: project.track.artist, startTimeSeconds: Math.min(project.canvas.durationInSeconds, project.playlist.chapters.length * 60) }] } })} type="button">
        <Plus className="h-4 w-4" /> Add chapter
      </button>
    </>
  );
}

function CoverControls({ onAssetUpload, project, setProject }: ControlSidebarPropsSubset & { onAssetUpload: ControlSidebarProps["onAssetUpload"] }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <ControlSection icon={Upload} title="Cover">
        <AssetInput inputRef={inputRef} onChange={(file) => onAssetUpload(file, "cover")} />
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] bg-[#070707] text-sm font-medium text-white transition hover:border-white/55" onClick={() => inputRef.current?.click()} type="button">
          <Upload className="h-4 w-4" /> Upload cover
        </button>
        {project.track.cover ? <button className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] text-xs text-white" onClick={() => setProject({ ...project, track: { ...project.track, cover: null } })} type="button"><X className="h-3.5 w-3.5" /> Remove cover</button> : null}
      </ControlSection>
      <TrackControls project={project} setProject={setProject} />
    </>
  );
}

function TextControls({ project, setProject }: ControlSidebarPropsSubset) {
  return (
    <ControlSection icon={Type} title="Typography">
      <TextInput label="Title" onChange={(title) => setProject({ ...project, typography: { ...project.typography, title }, track: { ...project.track, title } })} value={project.typography.title} />
      <TextInput label="Artist" onChange={(artist) => setProject({ ...project, typography: { ...project.typography, artist }, track: { ...project.track, artist } })} value={project.typography.artist} />
      <TextInput label="Custom text" onChange={(customText) => setProject({ ...project, typography: { ...project.typography, customText } })} value={project.typography.customText} />
      <ToggleControl checked={project.typography.showTitle} label="Show title" onCheckedChange={(checked) => setProject({ ...project, typography: { ...project.typography, showTitle: checked } })} />
      <ToggleControl checked={project.typography.showArtist} label="Show artist" onCheckedChange={(checked) => setProject({ ...project, typography: { ...project.typography, showArtist: checked } })} />
      <ToggleControl checked={project.typography.showCustomText} label="Show custom" onCheckedChange={(checked) => setProject({ ...project, typography: { ...project.typography, showCustomText: checked } })} />
      <RangeControl label="Title scale" max={200} min={50} onChange={(value) => setProject({ ...project, typography: { ...project.typography, titleScale: value / 100 } })} value={Math.round(project.typography.titleScale * 100)} />
    </ControlSection>
  );
}

function LogoControls({ onAssetUpload, project, selectedEffectId, setProject }: ControlSidebarPropsSubset & { onAssetUpload: ControlSidebarProps["onAssetUpload"]; selectedEffectId: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const placement = normalizeLogoPlacement(selectedEffectId);
  return (
    <>
      <ControlSection icon={Upload} title="Logo">
        <AssetInput inputRef={inputRef} onChange={(file) => onAssetUpload(file, "logo")} />
        <button className="flex h-11 w-full items-center justify-center gap-2 rounded-[7px] border border-[var(--border)] bg-[#070707] text-sm font-medium text-white transition hover:border-white/55" onClick={() => inputRef.current?.click()} type="button"><Upload className="h-4 w-4" /> Upload logo</button>
      </ControlSection>
      <ControlSection icon={Image} title="Placement">
        <SelectControl label="Placement" onChange={(value) => setProject({ ...project, logo: { ...project.logo, placement: value as SlyntProject["logo"]["placement"] } })} options={["hidden", "center", "bottom-left", "bottom-right", "watermark"]} value={project.logo.placement === placement ? project.logo.placement : placement} />
        <RangeControl label="Opacity" onChange={(value) => setProject({ ...project, logo: { ...project.logo, opacity: value / 100 } })} value={Math.round(project.logo.opacity * 100)} />
        <RangeControl label="Scale" max={200} min={10} onChange={(value) => setProject({ ...project, logo: { ...project.logo, scale: value / 100 } })} value={Math.round(project.logo.scale * 100)} />
      </ControlSection>
    </>
  );
}

function TrackControls({ project, setProject }: ControlSidebarPropsSubset) {
  return (
    <ControlSection icon={Type} title="Track">
      <TextInput label="Track title" onChange={(title) => setProject({ ...project, track: { ...project.track, title }, typography: { ...project.typography, title } })} value={project.track.title} />
      <TextInput label="Artist" onChange={(artist) => setProject({ ...project, track: { ...project.track, artist }, typography: { ...project.typography, artist } })} value={project.track.artist} />
    </ControlSection>
  );
}

function AssetInput({ inputRef, onChange }: { inputRef: React.RefObject<HTMLInputElement | null>; onChange: (file: File) => void }) {
  return <input accept="image/*" className="sr-only" onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) onChange(file); event.target.value = ""; }} ref={inputRef} type="file" />;
}

function TextInput({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  const id = `input-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <label className="mb-3 block text-xs text-[var(--text-secondary)]" htmlFor={id}>
      {label}
      <input className="mt-2 h-10 w-full rounded-[7px] border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-sm text-white outline-none focus:border-white/70" id={id} onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

type ControlSidebarPropsSubset = Pick<ControlSidebarProps, "project" | "setProject">;

function categoryTitle(category: EffectCategory) {
  return category.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" ");
}

function normalizeProgressStyle(effectId: string): SlyntProject["progress"]["style"] {
  return ["minimal-line", "circular-progress", "segmented-timeline", "waveform-timeline", "time-counter"].includes(effectId) ? effectId as SlyntProject["progress"]["style"] : "minimal-line";
}

function normalizePlaylistMode(effectId: string): SlyntProject["playlist"]["displayMode"] {
  return effectId === "playlist-hidden" ? "hidden" : ["current-track", "compact-queue", "side-queue", "up-next"].includes(effectId) ? effectId as SlyntProject["playlist"]["displayMode"] : "current-track";
}

function normalizeLogoPlacement(effectId: string): SlyntProject["logo"]["placement"] {
  const map: Record<string, SlyntProject["logo"]["placement"]> = {
    "bottom-left-logo": "bottom-left",
    "bottom-right-logo": "bottom-right",
    "center-logo": "center",
    "logo-hidden": "hidden",
    watermark: "watermark",
  };
  return map[effectId] ?? "hidden";
}
