import { createReadStream } from "node:fs";
import { getAssetRecord, nodeStreamToWeb } from "@/lib/slynt/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/assets/[assetId]">,
) {
  const { assetId } = await context.params;
  const record = await getAssetRecord(assetId);

  if (!record) {
    return Response.json({ error: "Asset not found." }, { status: 404 });
  }

  const size = record.stats.size;
  const range = request.headers.get("range");
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "no-store",
    "Content-Type": record.mimeType,
  });

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      return rangeNotSatisfiable(size);
    }

    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : size - 1;

    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start ||
      start >= size
    ) {
      return rangeNotSatisfiable(size);
    }

    const boundedEnd = Math.min(end, size - 1);
    const length = boundedEnd - start + 1;
    headers.set("Content-Length", String(length));
    headers.set("Content-Range", `bytes ${start}-${boundedEnd}/${size}`);

    return new Response(
      nodeStreamToWeb(createReadStream(record.filePath, { start, end: boundedEnd })),
      { headers, status: 206 },
    );
  }

  headers.set("Content-Length", String(size));
  return new Response(nodeStreamToWeb(createReadStream(record.filePath)), {
    headers,
    status: 200,
  });
}

function rangeNotSatisfiable(size: number) {
  return new Response(null, {
    headers: { "Content-Range": `bytes */${size}` },
    status: 416,
  });
}

