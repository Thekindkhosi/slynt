import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  isSafeAssetId,
  mapRenderResolution,
  parseStoredProject,
} from "../lib/slynt/project-utils";
import { assetReferenceSchema } from "../lib/slynt/project-schema";
import {
  formatSmpte,
  formatTime,
  getCurrentChapter,
  getNextChapter,
  parseClockTime,
} from "../lib/slynt/time";
import { getAssetRecord, saveUploadedAsset } from "../lib/slynt/storage";

assert.equal(formatTime(65), "1:05");
assert.equal(formatTime(3661), "1:01:01");
assert.equal(formatSmpte(1.5, 30), "00:00:01:15");
assert.equal(parseClockTime("02:15"), 135);
assert.equal(parseClockTime("01:02:03"), 3723);
assert.equal(parseClockTime("nope"), null);

const chapters = [
  { id: "a", title: "Intro", artist: "", startTimeSeconds: 0 },
  { id: "b", title: "Main", artist: "", startTimeSeconds: 60 },
  { id: "c", title: "Outro", artist: "", startTimeSeconds: 120 },
];

assert.equal(getCurrentChapter(chapters, 80)?.id, "b");
assert.equal(getNextChapter(chapters, 80)?.id, "c");
assert.deepEqual(mapRenderResolution("1920x1080"), {
  height: 1080,
  width: 1920,
});
assert.equal(parseStoredProject("{bad json").version, 1);
assert.equal(isSafeAssetId("abcDEF123456"), true);
assert.equal(isSafeAssetId("../secret"), false);
assert.equal(
  assetReferenceSchema.safeParse({
    fileName: "a.mp3",
    id: "abcDEF123456",
    mimeType: "audio/mpeg",
    url: "/api/assets/abcDEF123456",
  }).success,
  true,
);

runStorageTests()
  .then(() => {
    console.log("slynt utility tests passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

async function runStorageTests() {
  const originalDataDir = process.env.SLYNT_DATA_DIR;
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "slynt-test-"));
  process.env.SLYNT_DATA_DIR = tempDataDir;

  try {
    const asset = await saveUploadedAsset(
      new File([Buffer.from("fake audio")], "fixture.mp3", {
        type: "audio/mpeg",
      }),
    );
    const record = await getAssetRecord(asset.id);

    assert.equal(record?.id, asset.id);
    assert.equal(record?.fileName, "fixture.mp3");
    assert.equal(record?.mimeType, "audio/mpeg");
    assert.equal(record?.stats.size, 10);
  } finally {
    if (originalDataDir === undefined) {
      delete process.env.SLYNT_DATA_DIR;
    } else {
      process.env.SLYNT_DATA_DIR = originalDataDir;
    }

    await rm(tempDataDir, { force: true, recursive: true });
  }
}
