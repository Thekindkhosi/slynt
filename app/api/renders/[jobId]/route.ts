import { readRenderJob } from "@/lib/slynt/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/renders/[jobId]">,
) {
  const { jobId } = await context.params;
  const job = await readRenderJob(jobId);

  if (!job) {
    return Response.json({ error: "Render job not found." }, { status: 404 });
  }

  return Response.json({ job });
}

