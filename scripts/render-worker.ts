import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "node:path";
import {
  getRenderOutputPath,
  listQueuedJobs,
  readRenderJob,
  writeRenderJob,
} from "../lib/slynt/storage";

const pollMs = 2500;
let serveUrlPromise: Promise<string> | null = null;

async function main() {
  console.log("SLYNT render worker started. Waiting for queued jobs.");
  while (true) {
    try {
      await assertAppReachable();
      const queued = await listQueuedJobs();
      for (const job of queued) {
        await renderJob(job.id);
      }
    } catch (error) {
      console.error("Worker loop error", safeError(error));
    }

    await sleep(pollMs);
  }
}

async function assertAppReachable() {
  const origin = process.env.SLYNT_APP_ORIGIN ?? "http://localhost:3000";
  try {
    await fetch(origin, { method: "HEAD" });
  } catch {
    await sleep(1500);
  }
}

async function getServeUrl() {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint: path.resolve(process.cwd(), "remotion", "index.ts"),
      onProgress: (progress) => {
        const percent = Math.round(progress * 100);
        if (percent % 20 === 0) {
          console.log(`Bundling Remotion project: ${percent}%`);
        }
      },
    });
  }

  return serveUrlPromise;
}

async function renderJob(jobId: string) {
  const job = await readRenderJob(jobId);
  if (!job || job.status !== "queued") {
    return;
  }

  try {
    job.status = "rendering";
    job.stage = "Bundling Remotion composition";
    job.progress = 0.02;
    await writeRenderJob(job);

    const serveUrl = await getServeUrl();
    const origin = process.env.SLYNT_APP_ORIGIN ?? "http://localhost:3000";
    const project = absolutizeAssetUrls(job.project, origin);
    const inputProps = { project };

    job.stage = "Resolving composition metadata";
    job.progress = 0.06;
    await writeRenderJob(job);

    const composition = await selectComposition({
      id: "SlyntComposition",
      inputProps,
      serveUrl,
      timeoutInMilliseconds: 120_000,
    });

    job.stage = "Rendering MP4 frames";
    await writeRenderJob(job);

    await renderMedia({
      codec: "h264",
      composition,
      enforceAudioTrack: true,
      inputProps,
      logLevel: "warn",
      onProgress: async (progress) => {
        const latest = await readRenderJob(jobId);
        if (!latest) {
          return;
        }
        latest.status = "rendering";
        latest.progress = Math.max(0.08, Math.min(0.99, progress.progress));
        latest.stage =
          progress.stitchStage === "muxing"
            ? "Muxing audio and video"
            : `Rendering ${progress.renderedFrames} frames`;
        await writeRenderJob(latest);
      },
      outputLocation: getRenderOutputPath(job),
      overwrite: true,
      serveUrl,
    });

    const done = await readRenderJob(jobId);
    if (done) {
      done.status = "completed";
      done.progress = 1;
      done.stage = "Completed";
      await writeRenderJob(done);
    }
  } catch (error) {
    const failed = await readRenderJob(jobId);
    if (failed) {
      failed.status = "failed";
      failed.stage = "Render failed";
      failed.error = safeError(error);
      await writeRenderJob(failed);
    }
    console.error(`Render job ${jobId} failed`, error);
  }
}

function absolutizeAssetUrls<T>(value: T, origin: string): T {
  if (Array.isArray(value)) {
    return value.map((item) => absolutizeAssetUrls(item, origin)) as T;
  }

  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === "url" && typeof nested === "string" && nested.startsWith("/")) {
        next[key] = new URL(nested, origin).toString();
      } else {
        next[key] = absolutizeAssetUrls(nested, origin);
      }
    }
    return next as T;
  }

  return value;
}

function safeError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

void main();
