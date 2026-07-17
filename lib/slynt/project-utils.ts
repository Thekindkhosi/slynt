import { createDefaultProject } from "./project-defaults";
import {
  renderResolutionSchema,
  slyntProjectSchema,
  type SlyntProject,
} from "./project-schema";

const STORAGE_KEY = "slynt.project.v1";

export function parseStoredProject(value: string | null): SlyntProject {
  if (!value) {
    return createDefaultProject();
  }

  try {
    const parsed = slyntProjectSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : createDefaultProject();
  } catch {
    return createDefaultProject();
  }
}

export function loadProjectFromStorage(): SlyntProject {
  if (typeof window === "undefined") {
    return createDefaultProject();
  }

  return parseStoredProject(window.localStorage.getItem(STORAGE_KEY));
}

export function saveProjectToStorage(project: SlyntProject) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
}

export function clearProjectStorage() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function mapRenderResolution(resolution: SlyntProject["export"]["resolution"]) {
  const parsed = renderResolutionSchema.parse(resolution);
  const [width, height] = parsed.split("x").map((value) => Number(value));
  return { width, height };
}

export function projectToRenderProject(project: SlyntProject): SlyntProject {
  const { width, height } = mapRenderResolution(project.export.resolution);
  return {
    ...project,
    canvas: {
      ...project.canvas,
      width,
      height,
      fps: project.export.fps,
      durationInSeconds: Math.max(
        1,
        project.audio.durationInSeconds || project.canvas.durationInSeconds,
      ),
    },
  };
}

export function sanitizeFileName(fileName: string) {
  const base = fileName
    .replace(/[\\/:"*?<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);

  return base || "asset";
}

export function isSafeAssetId(value: string) {
  return /^[a-zA-Z0-9_-]{12,80}$/.test(value);
}

