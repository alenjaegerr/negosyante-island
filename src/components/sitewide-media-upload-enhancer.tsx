"use client";

import { useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_IMAGE_DIMENSION = 1400;
const MAX_SAFE_UPLOAD_BYTES = 3.5 * 1024 * 1024;
const FFMPEG_VERSION = "0.12.10";

let ffmpegPromise: Promise<FFmpeg> | null = null;

function toBytes(data: Uint8Array | string) {
  return typeof data === "string" ? new TextEncoder().encode(data) : data;
}

async function getFfmpeg() {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg();
      const baseUrl = `https://unpkg.com/@ffmpeg/core@${FFMPEG_VERSION}/dist/umd`;

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
        workerURL: await toBlobURL(`${baseUrl}/ffmpeg-core.worker.js`, "text/javascript"),
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

  if (!compressedBlob || compressedBlob.size >= file.size) {
    return file;
  }

  if (compressedBlob.size > MAX_SAFE_UPLOAD_BYTES) {
    throw new Error("Image is still too large after compression. Please choose a smaller image.");
  }

  return new File([compressedBlob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`, {
    type: "image/jpeg",
  });
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
  const gifBytes = toBytes(data as Uint8Array | string);
  const gifCopy = new Uint8Array(gifBytes);
  const blob = new Blob([gifCopy.buffer], { type: "image/gif" });
  if (blob.size >= file.size) {
    return file;
  }

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
  const videoBytes = toBytes(data as Uint8Array | string);
  const videoCopy = new Uint8Array(videoBytes);
  const blob = new Blob([videoCopy.buffer], { type: "video/mp4" });
  if (blob.size >= file.size) {
    return file;
  }

  if (blob.size > MAX_SAFE_UPLOAD_BYTES) {
    throw new Error("Video is still too large after compression. Please trim it or upload a shorter clip.");
  }

  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.mp4`, { type: "video/mp4" });
}

export async function maybeCompressMedia(file: File) {
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    return compressImage(file);
  }

  if (file.type === "image/gif") {
    return compressGif(file);
  }

  if (file.type === "video/mp4") {
    return compressVideo(file);
  }

  return file;
}

function getUploadFormTargets(form: HTMLFormElement) {
  return {
    imageInput: form.querySelector<HTMLInputElement>('input[name="imageFile"]'),
    gifInput: form.querySelector<HTMLInputElement>('input[name="gifFile"]'),
    videoInput: form.querySelector<HTMLInputElement>('input[name="videoFile"]'),
  };
}

export default function SitewideMediaUploadEnhancer() {
  useEffect(() => {
    const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-media-upload-form="true"]'));
    if (!forms.length) return;

    const cleanups = forms.map((form) => {
      const { imageInput, gifInput, videoInput } = getUploadFormTargets(form);
      if (!imageInput && !gifInput && !videoInput) return () => undefined;

      const onSubmit = async (event: Event) => {
        if (form.dataset.mediaUploadPending === "1") return;
        event.preventDefault();

        const formData = new FormData(form);
        const imageFile = formData.get("imageFile");
        const gifFile = formData.get("gifFile");
        const videoFile = formData.get("videoFile");

        try {
          form.dataset.mediaUploadPending = "1";

          if (imageFile instanceof File && imageFile.size > 0) {
            formData.set("imageFile", await maybeCompressMedia(imageFile));
          }

          if (gifFile instanceof File && gifFile.size > 0) {
            formData.set("gifFile", await maybeCompressMedia(gifFile));
          }

          if (videoFile instanceof File && videoFile.size > 0) {
            formData.set("videoFile", await maybeCompressMedia(videoFile));
          }

          const response = await fetch(form.action, {
            method: form.method || "post",
            body: formData,
            redirect: "follow",
          });

          if (!response.ok && !response.redirected) {
            const errorText = await response.text().catch(() => "");
            throw new Error(errorText || "Upload failed. Please try again.");
          }

          if (response.redirected) {
            window.location.assign(response.url);
            return;
          }

          if (form.dataset.refreshOnSuccess === "true") {
            window.location.reload();
            return;
          }

          window.location.assign(form.action);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed. Please try again.";
          window.alert(message);
        } finally {
          form.dataset.mediaUploadPending = "0";
        }
      };

      form.addEventListener("submit", onSubmit);
      return () => form.removeEventListener("submit", onSubmit);
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}