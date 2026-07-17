import { saveUploadedAsset, UploadError } from "@/lib/slynt/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Upload a file field named file." }, { status: 400 });
    }

    const asset = await saveUploadedAsset(file);
    return Response.json({ asset }, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return Response.json({ error: error.message }, { status: error.status });
    }

    console.error("Asset upload failed", error);
    return Response.json({ error: "Upload failed." }, { status: 500 });
  }
}

