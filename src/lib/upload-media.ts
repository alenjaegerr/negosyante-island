export async function fileToDataUrl(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}