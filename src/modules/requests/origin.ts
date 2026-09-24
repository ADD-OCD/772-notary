function normalizedOrigin(value: string) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function publicRequestOrigin(request: Request) {
  const host = request.headers.get("host");
  if (!host || host.includes(",") || /[\s/@\\]/.test(host)) return null;

  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  if (forwardedProtocol && !["http", "https"].includes(forwardedProtocol)) return null;

  const protocol = forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);
  return normalizedOrigin(`${protocol}://${host}`);
}

export function requestOriginIsAllowed(request: Request) {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  const origin = normalizedOrigin(originHeader);
  if (!origin) return false;

  const internalOrigin = new URL(request.url).origin;
  return origin === internalOrigin || origin === publicRequestOrigin(request);
}
