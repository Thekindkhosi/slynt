import { projectToRenderProject } from "@/lib/slynt/project-utils";
import { slyntProjectSchema } from "@/lib/slynt/project-schema";
import { createRenderJob } from "@/lib/slynt/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = slyntProjectSchema.safeParse(body.project);

    if (!parsed.success) {
      return Response.json(
        { error: "Project is invalid.", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    if (!parsed.data.audio.asset || parsed.data.audio.durationInSeconds <= 0) {
      return Response.json(
        { error: "Upload and analyze audio before exporting." },
        { status: 400 },
      );
    }

    const job = await createRenderJob(projectToRenderProject(parsed.data));
    return Response.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Render job creation failed", error);
    return Response.json({ error: "Could not create render job." }, { status: 500 });
  }
}

