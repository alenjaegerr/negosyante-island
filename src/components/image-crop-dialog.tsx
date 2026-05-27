"use client";

import { useEffect, useMemo, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

type ImageCropDialogProps = {
  open: boolean;
  title: string;
  description: string;
  file: File | null;
  aspect: number;
  outputWidth: number;
  outputHeight: number;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
};

async function loadImage(src: string) {
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("image-load-failed")));
    image.src = src;
  });
}

async function getCroppedFile(sourceUrl: string, crop: Area, file: File, outputWidth: number, outputHeight: number) {
  const image = await loadImage(sourceUrl);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas-context-unavailable");

  context.imageSmoothingQuality = "high";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputWidth, outputHeight);

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("image-conversion-failed");

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

export default function ImageCropDialog({
  open,
  title,
  description,
  file,
  aspect,
  outputWidth,
  outputHeight,
  onCancel,
  onConfirm,
}: ImageCropDialogProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !file) {
      setImageUrl(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setBusy(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file, open]);

  const canSave = useMemo(() => open && !!file && !!imageUrl && !!croppedAreaPixels && !busy, [busy, croppedAreaPixels, file, imageUrl, open]);

  if (!open || !file || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[color:var(--ni-border)] px-5 py-4">
          <div>
            <p className="font-roboto-mono text-[11px] uppercase tracking-[0.28em] text-[var(--ni-muted)]">Crop image</p>
            <h2 className="mt-1 font-reddit text-xl font-extrabold tracking-figma-tight text-[color:var(--ni-text-strong)]">{title}</h2>
            <p className="mt-1 text-sm text-[color:var(--ni-text)]">{description}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[color:var(--ni-border)] px-3 py-1.5 text-sm font-semibold text-[color:var(--ni-text-strong)] hover:border-[var(--ni-brand)]"
          >
            Cancel
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="relative min-h-[420px] bg-black">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              cropShape="rect"
              showGrid={false}
              objectFit="cover"
            />
          </div>

          <div className="border-t border-[color:var(--ni-border)] bg-[var(--ni-surface-2)] p-5 lg:border-l lg:border-t-0">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[color:var(--ni-text-strong)]" htmlFor="crop-zoom">
                  Zoom
                </label>
                <input
                  id="crop-zoom"
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(event) => setZoom(Number(event.target.value))}
                  className="mt-2 w-full"
                />
              </div>

              <div className="rounded-2xl border border-[color:var(--ni-border)] bg-[var(--ni-surface-1)] p-4 text-sm text-[color:var(--ni-text)]">
                <p className="font-semibold text-[color:var(--ni-text-strong)]">Output</p>
                <p className="mt-1">{outputWidth} × {outputHeight}px JPEG</p>
                <p className="mt-2 text-xs text-[var(--ni-muted)]">Drag to reposition the crop area, then zoom to fit the frame.</p>
              </div>

              <button
                type="button"
                disabled={!canSave}
                onClick={async () => {
                  if (!croppedAreaPixels || busy) return;
                  setBusy(true);
                  try {
                    const croppedFile = await getCroppedFile(imageUrl, croppedAreaPixels, file, outputWidth, outputHeight);
                    await onConfirm(croppedFile);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="w-full rounded-full bg-[var(--ni-brand-cta)] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Applying crop..." : "Use crop"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}