export type TrendingMediaPreview = {
  provider: "youtube" | "tiktok" | "instagram" | "x" | "direct";
  embedUrl: string;
  aspectClass: string;
  label: string;
  supportsLoop: boolean;
};

const clampLoopSeconds = (seconds: number) => Math.max(3, Math.min(6, seconds || 5));

const normalizeUrl = (value: string) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const getPathSegment = (url: URL, index: number) => url.pathname.split("/").filter(Boolean)[index] ?? "";

export function buildTrendingMediaPreview(videoUrl: string, loopSeconds = 5): TrendingMediaPreview | null {
  const url = normalizeUrl(videoUrl.trim());
  if (!url) return null;

  const seconds = clampLoopSeconds(loopSeconds);
  const host = url.hostname.replace(/^www\./, "");

  if (host.includes("youtube.com") || host.includes("youtu.be")) {
    const videoId =
      url.searchParams.get("v") ??
      getPathSegment(url, host.includes("youtu.be") ? 0 : host.includes("youtube.com") && url.pathname.includes("shorts") ? 1 : 0);

    if (!videoId) return null;

    return {
      provider: "youtube",
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&modestbranding=1&rel=0&start=0&end=${seconds}`,
      aspectClass: url.pathname.includes("shorts") ? "aspect-[9/16]" : "aspect-video",
      label: "YouTube loop",
      supportsLoop: true,
    };
  }

  if (host.includes("tiktok.com")) {
    const videoId =
      getPathSegment(url, 1) === "video" ? getPathSegment(url, 2) : getPathSegment(url, 2) || getPathSegment(url, 0);

    if (!videoId) return null;

    return {
      provider: "tiktok",
      embedUrl: `https://www.tiktok.com/player/v1/${videoId}?autoplay=1&loop=1&mute=1&controls=0`,
      aspectClass: "aspect-[9/16]",
      label: `TikTok loop (${seconds}s preview)`,
      supportsLoop: true,
    };
  }

  if (host.includes("instagram.com")) {
    const shortcode = getPathSegment(url, 1) || getPathSegment(url, 0);
    if (!shortcode) return null;

    const isReel = url.pathname.includes("reel") || url.pathname.includes("reels");

    return {
      provider: "instagram",
      embedUrl: `https://www.instagram.com/${isReel ? "reel" : "p"}/${shortcode}/embed/captioned/`,
      aspectClass: "aspect-[4/5]",
      label: "Instagram preview",
      supportsLoop: false,
    };
  }

  if (host.includes("x.com") || host.includes("twitter.com")) {
    const statusId = url.pathname.split("/").filter(Boolean).pop();
    if (!statusId) return null;

    return {
      provider: "x",
      embedUrl: `https://platform.twitter.com/embed/Tweet.html?id=${statusId}`,
      aspectClass: "aspect-[4/5]",
      label: "X preview",
      supportsLoop: false,
    };
  }

  if (url.pathname.match(/\.(mp4|webm|mov)$/i)) {
    return {
      provider: "direct",
      embedUrl: videoUrl,
      aspectClass: "aspect-video",
      label: "Direct video",
      supportsLoop: true,
    };
  }

  return null;
}
