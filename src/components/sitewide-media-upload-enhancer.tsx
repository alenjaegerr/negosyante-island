"use client";

import { useEffect, useMemo, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_IMAGE_DIMENSION = 1400;
const MAX_SAFE_UPLOAD_BYTES = 3.5 * 1024 * 1024;
const FFMPEG_BASE_URL = "/ffmpeg";
const UPLOAD_STATUS_EVENT = "ni-upload-status";

type UploadStatus = {
  title: string;
  detail: string;
  fileName?: string;
};

let ffmpegPromise: Promise<FFmpeg> | null = null;

function toBytes(data: Uint8Array | string) {
  return typeof data === "string" ? new TextEncoder().encode(data) : data;
}

function isCompressibleFile(file: File) {
  return file.type.startsWith("image/") || file.type === "video/mp4";
}

function describeFile(file: File) {
  if (file.type === "video/mp4") return "Optimizing video before upload";
  if (file.type === "image/gif") return "Optimizing GIF before upload";
  if (file.type.startsWith("image/")) return "Optimizing image before upload";
  return "Preparing upload";
}

export function setUploadOverlay(status: UploadStatus | null) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<UploadStatus | null>(UPLOAD_STATUS_EVENT, { detail: status }));
}

async function getFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const baseUrl = `${FFMPEG_BASE_URL}`;

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
      });

      return ffmpeg;
    })();
  }

  return ffmpegPromise;
}

async function fileToImageBitmap(file: File) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = reject;
      element.src = url;
    });

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      draw: (context: CanvasRenderingContext2D, width: number, height: number) => {
        context.drawImage(image, 0, 0, width, height);
      },
    } as const;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function compressImage(file: File) {
  const bitmap = await fileToImageBitmap(file);
  const maxSide = Math.max(bitmap.width, bitmap.height);
  const scale = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return file;

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if ("draw" in bitmap) {
    bitmap.draw(context, width, height);
  } else {
    context.drawImage(bitmap as ImageBitmap, 0, 0, width, height);
  }

  const compressedBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.78);
  });

  if (!compressedBlob || compressedBlob.size >= file.size) return file;
  if (compressedBlob.size > MAX_SAFE_UPLOAD_BYTES) {
    throw new Error("Image is still too large after compression. Please choose a smaller image.");
  }

  return new File([compressedBlob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`, { type: "image/jpeg" });
}

async function compressGif(file: File) {
  const ffmpeg = await getFfmpeg();
  await ffmpeg.writeFile("input.gif", await fetchFile(file));
  await ffmpeg.exec([
    "-i",
    "input.gif",
    "-vf",
    "fps=10,scale='min(720,iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=32[p];[s1][p]paletteuse=dither=bayer",
    "-loop",
    "0",
    "output.gif",
  ]);

  const data = await ffmpeg.readFile("output.gif");
  const gifBytes = new Uint8Array(toBytes(data as Uint8Array | string));
  const blob = new Blob([new Uint8Array(gifBytes)], { type: "image/gif" });

  if (blob.size >= file.size) return file;
  if (blob.size > MAX_SAFE_UPLOAD_BYTES) {
    throw new Error("GIF is still too large after compression. Please trim the animation or upload a shorter GIF.");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.gif`, { type: "image/gif" });
}

async function compressVideo(file: File) {
  const ffmpeg = await getFfmpeg();
  await ffmpeg.writeFile("input.mp4", await fetchFile(file));
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vf",
    "fps=24,scale='min(960,iw)':-2:flags=lanczos",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "34",
    "-movflags",
    "+faststart",
    "-an",
    "output.mp4",
  ]);

  const data = await ffmpeg.readFile("output.mp4");
  const videoBytes = new Uint8Array(toBytes(data as Uint8Array | string));
  const blob = new Blob([new Uint8Array(videoBytes)], { type: "video/mp4" });

  if (blob.size >= file.size) return file;
  if (blob.size > MAX_SAFE_UPLOAD_BYTES) {
    throw new Error("Video is still too large after compression. Please trim it or upload a shorter clip.");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.mp4`, { type: "video/mp4" });
}

export async function compressMediaFile(file: File) {
  if (file.type === "image/svg+xml") {
    return file;
  }

  if (file.type === "image/gif") {
    return compressGif(file);
  }

  if (file.type === "video/mp4") {
    return compressVideo(file);
  }

  if (file.type.startsWith("image/")) {
    return compressImage(file);
  }

  return file;
}

export async function compressMediaFileToInput(input: HTMLInputElement, file: File, setStatus?: (status: UploadStatus | null) => void) {
  const status = {
    title: "Compressing upload",
    detail: describeFile(file),
    fileName: file.name || "upload",
  } satisfies UploadStatus;

  setStatus?.(status);
  setUploadOverlay(status);

  const compressed = await compressMediaFile(file);
  if (input.isConnected) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(compressed);
    input.files = dataTransfer.files;
  }

  return compressed;
}

export default function SitewideMediaUploadEnhancer() {
  const [status, setStatus] = useState<UploadStatus | null>(null);

  useEffect(() => {
    const onOverlayUpdate = (event: Event) => {
      setStatus((event as CustomEvent<UploadStatus | null>).detail ?? null);
    };

    window.addEventListener(UPLOAD_STATUS_EVENT, onOverlayUpdate as EventListener);
    return () => window.removeEventListener(UPLOAD_STATUS_EVENT, onOverlayUpdate as EventListener);
  }, []);

  useEffect(() => {
    const onChange = async (event: Event) => {
      const input = event.target instanceof HTMLInputElement ? event.target : null;
      if (!input) return;
      const file = input.files?.[0];
      if (!file || !isCompressibleFile(file) || input.dataset.skipGlobalMediaCompress === "true") return;

      try {
        input.dataset.mediaBusy = "1";
        await compressMediaFileToInput(input, file, setStatus);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload compression failed. Please try again.";
        window.alert(message);
        if (input.isConnected) input.value = "";
      } finally {
        input.dataset.mediaBusy = "0";
        setStatus(null);
        setUploadOverlay(null);
      }
    };

    document.addEventListener("change", onChange, true);

    return () => {
      document.removeEventListener("change", onChange, true);
    };
  }, []);

  const overlay = useMemo(() => {
    if (!status) return null;

    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md">
        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-6 text-white shadow-2xl shadow-black/40">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(0,132,209,0.45),rgba(15,23,42,0.9))]">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-200/80">{status.title}</p>
              <p className="mt-1 text-sm text-slate-200">{status.detail}</p>
              {status.fileName ? <p className="mt-2 truncate text-xs text-slate-400">{status.fileName}</p> : null}
            </div>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.25em] text-slate-400">Preparing file before upload</p>
        </div>
      </div>
    );
  }, [status]);

  return overlay;
}