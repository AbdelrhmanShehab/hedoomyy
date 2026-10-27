import { NextRequest } from "next/server";

// Same-origin image delivery allows the styling canvas to read Firebase pixels
// even when a bucket's browser CORS configuration does not permit it.
export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  let url: URL;
  try { url = new URL(source ?? ""); } catch { return new Response("Invalid image", { status: 400 }); }
  const allowed = url.protocol === "https:" && !url.username && !url.password && !url.port && (
    (url.hostname === "firebasestorage.googleapis.com" && /^\/v0\/b\/hedoomyy\.(firebasestorage\.app|appspot\.com)\/o\//.test(url.pathname)) ||
    (url.hostname === "storage.googleapis.com" && /^\/hedoomyy\.(firebasestorage\.app|appspot\.com)\//.test(url.pathname))
  );
  if (!allowed) return new Response("Unsupported image source", { status: 400 });
  try {
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(10000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(png|jpeg|webp|avif)(;|$)/i.test(type)) return new Response("Image unavailable", { status: 502 });
    const limit = 12 * 1024 * 1024;
    if (Number(response.headers.get("content-length")) > limit) return new Response("Image too large", { status: 413 });
    const reader = response.body?.getReader();
    if (!reader) return new Response("Image unavailable", { status: 502 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.length;
      if (length > limit) { await reader.cancel(); return new Response("Image too large", { status: 413 }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Image unavailable", { status: 502 }); }
}
