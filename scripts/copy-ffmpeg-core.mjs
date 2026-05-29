import { copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const sourceBase = path.dirname(require.resolve("@ffmpeg/core"));
const targetDir = path.join(projectRoot, "public", "ffmpeg");

const files = ["ffmpeg-core.js", "ffmpeg-core.wasm"];

await mkdir(targetDir, { recursive: true });

for (const fileName of files) {
  const sourcePath = path.join(sourceBase, fileName);
  const targetPath = path.join(targetDir, fileName);
  await stat(sourcePath);
  await copyFile(sourcePath, targetPath);
}
