import { createReadStream } from "node:fs";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { AssetReference, SlyntProject } from "./project-schema";
import { isSafeAssetId, sanitizeFileName } from "./project-utils";

export type RenderJobStatus =
  | "queued"
  | "rendering"
  | "completed"
  | "failed";

export type RenderJob = {
  id: string;
  status: RenderJobStatus;
  progress: number;
  stage: string;
  project: SlyntProject;
  createdAt: string;
  updatedAt: string;
  outputFileName: string;
  error?: string;
};

const audioMimeTypes = new Set([
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
]);

const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const supportedAssetMimeTypes = new Set([
  ...audioMimeTypes,
  ...imageMimeTypes,
]);

export const maxAssetSizeBytes = 1024 * 1024 * 600;

export function getDataRoot() {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    process.env.SLYNT_DATA_DIR ?? ".slynt-data",
  );
}

export function getAssetsDir() {
  return path.join(getDataRoot(), "assets");
}

export function getJobsDir() {
  return path.join(getDataRoot(), "jobs");
}

export function getRendersDir() {
  return path.join(getDataRoot(), "renders");
}

export async function ensureDataDirs() {
  await Promise.all([
    mkdir(getAssetsDir(), { recursive: true }),
    mkdir(getJobsDir(), { recursive: true }),
    mkdir(getRendersDir(), { recursive: true }),
  ]);
}

export async function saveUploadedAsset(file: File): Promise<AssetReference> {
  if (!supportedAssetMimeTypes.has(file.type)) {
    throw new UploadError(415, "Unsupported file type.");
  }

  if (file.size <= 0 || file.size > maxAssetSizeBytes) {
    throw new UploadError(413, "File is empty or too large.");
  }

  await ensureDataDirs();
  const id = randomUUID().replace(/-/g, "");
  const fileName = sanitizeFileName(file.name);
  const extension = extensionForMime(file.type, fileName);
  const diskName = `${id}${extension}`;
  const diskPath = path.join(getAssetsDir(), diskName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(diskPath, bytes);
  await writeFile(
    `${diskPath}.json`,
    JSON.stringify(
      {
        id,
        fileName,
        mimeType: file.type,
        size: file.size,
        diskName,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  return { id, fileName, mimeType: file.type, url: `/api/assets/${id}` };
}

export async function getAssetRecord(assetId: string) {
  if (!isSafeAssetId(assetId)) {
    return null;
  }

  const assetsDir = getAssetsDir();
  const entries = await readdir(assetsDir).catch(() => []);
  const metadataName = entries.find(
    (entry) => entry.startsWith(`${assetId}.`) && entry.endsWith(".json"),
  );

  if (!metadataName) {
    return null;
  }

  const metadataPath = path.join(assetsDir, metadataName);
  const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as {
    id: string;
    fileName: string;
    mimeType: string;
    diskName: string;
  };
  const filePath = path.resolve(assetsDir, metadata.diskName);

  if (!filePath.startsWith(path.resolve(assetsDir))) {
    return null;
  }

  return { ...metadata, filePath, stats: await stat(filePath) };
}

export async function createRenderJob(project: SlyntProject) {
  await ensureDataDirs();
  const now = new Date().toISOString();
  const id = randomUUID().replace(/-/g, "");
  const outputFileName = `${id}.mp4`;
  const job: RenderJob = {
    id,
    status: "queued",
    progress: 0,
    stage: "Queued. Run npm run dev:all if the worker is not active.",
    project,
    createdAt: now,
    updatedAt: now,
    outputFileName,
  };

  await writeRenderJob(job);
  return job;
}

export async function readRenderJob(jobId: string) {
  if (!isSafeAssetId(jobId)) {
    return null;
  }

  const jobPath = path.join(getJobsDir(), `${jobId}.json`);
  try {
    return JSON.parse(await readFile(jobPath, "utf8")) as RenderJob;
  } catch {
    return null;
  }
}

export async function writeRenderJob(job: RenderJob) {
  await ensureDataDirs();
  job.updatedAt = new Date().toISOString();
  await writeFile(
    path.join(getJobsDir(), `${job.id}.json`),
    JSON.stringify(job, null, 2),
  );
}

export async function listQueuedJobs() {
  await ensureDataDirs();
  const files = await readdir(getJobsDir());
  const jobs = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map((file) => readRenderJob(file.replace(/\.json$/, ""))),
  );

  return jobs
    .filter((job): job is RenderJob => Boolean(job))
    .filter((job) => job.status === "queued")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getRenderOutputPath(job: RenderJob) {
  return path.join(getRendersDir(), job.outputFileName);
}

export function nodeStreamToWeb(stream: ReturnType<typeof createReadStream>) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("data", (chunk: string | Buffer) =>
        controller.enqueue(
          typeof chunk === "string" ? Buffer.from(chunk) : chunk,
        ),
      );
      stream.on("end", () => controller.close());
      stream.on("error", (error) => controller.error(error));
    },
    cancel() {
      stream.destroy();
    },
  });
}

export class UploadError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

function extensionForMime(mimeType: string, fileName: string) {
  const existing = path.extname(fileName).toLowerCase();
  if (existing && existing.length <= 8) {
    return existing;
  }

  const map: Record<string, string> = {
    "audio/mpeg": ".mp3",
    "audio/wav": ".wav",
    "audio/x-wav": ".wav",
    "audio/mp4": ".m4a",
    "audio/aac": ".aac",
    "audio/ogg": ".ogg",
    "audio/webm": ".webm",
    "audio/flac": ".flac",
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  return map[mimeType] ?? ".bin";
}
