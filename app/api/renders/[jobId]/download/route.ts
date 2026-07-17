import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import {
  getRenderOutputPath,
  nodeStreamToWeb,
  readRenderJob,
} from "@/lib/slynt/storage";
import { sanitizeFileName } from "@/lib/slynt/project-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/renders/[jobId]/download">,
) {
  const { jobId } = await context.params;
  const job = await readRenderJob(jobId);

  if (!job || job.status !== "completed") {
    return Response.json({ error: "Completed render not found." }, { status: 404 });
  }

  const outputPath = getRenderOutputPath(job);
  const outputStats = await stat(outputPath).catch(() => null);

  if (!outputStats) {
    return Response.json({ error: "Render output is missing." }, { status: 404 });
  }

  const fileName = `${sanitizeFileName(job.project.name)}.mp4`;
  return new Response(nodeStreamToWeb(createReadStream(outputPath)), {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(outputStats.size),
      "Content-Type": "video/mp4",
    },
  });
}

