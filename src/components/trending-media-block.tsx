"use client";

import Image from "next/image";
import { isDirectVideoUrl } from "@/lib/trending-media";

type TrendingMediaBlockProps = {
  title: string;
  imageUrl?: string | null;
  gifUrl?: string | null;
  videoUrl?: string | null;
  className?: string;
  mediaClassName?: string;
  showBorder?: boolean;
};

export function TrendingMediaBlock({
  title,
  imageUrl,
  gifUrl,
  videoUrl,
  className,
  mediaClassName,
  showBorder = true,
}: TrendingMediaBlockProps) {
  const hasImage = Boolean(imageUrl);
  const hasGif = Boolean(gifUrl);
  const videoSrc = videoUrl && isDirectVideoUrl(videoUrl) ? videoUrl : null;
  const hasVideo = Boolean(videoSrc);
  const showThumbnail = hasImage && (hasGif || hasVideo);

  const mediaNode = (() => {
    if (hasVideo && videoSrc) {
      return (
        <video src={videoSrc} autoPlay muted loop playsInline controls className="h-full w-full object-cover" />
      );
    }

    if (hasGif && gifUrl) {
      return (
        <Image
          src={gifUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          unoptimized
        />
      );
    }

    if (hasImage && imageUrl) {
      return (
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      );
    }

    return null;
  })();

  if (!mediaNode) return null;

  return (
    <div
      className={[
        "relative overflow-hidden",
        showBorder ? "border" : "",
        showBorder ? "border-[color:var(--ni-border)]" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["relative", mediaClassName ?? ""].filter(Boolean).join(" ")}>
        {mediaNode}
        {showThumbnail && imageUrl ? (
          <div className="absolute inset-0 ni-thumb-hide">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
