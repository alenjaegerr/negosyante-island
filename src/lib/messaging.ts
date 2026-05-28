const canonicalMessagingShellSlug = "alvin-s-coffee-shop";

export function buildBusinessMessageHref(slug: string, searchParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return query ? `/business/message/${slug}?${query}` : `/business/message/${slug}`;
}

export function buildMessagingShellHref(searchParams?: Record<string, string | undefined>) {
  return buildBusinessMessageHref(canonicalMessagingShellSlug, searchParams);
}
