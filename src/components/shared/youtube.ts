/**
 * Lấy ID video từ link YouTube (watch?v=, youtu.be/, /embed/, /shorts/, /live/) hoặc chuỗi ID 11 ký tự.
 * Trả null khi không nhận ra – dùng để ẩn khối video khi cài đặt để trống/sai.
 */
export function youtubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const value = url.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return pick(u.pathname.slice(1));
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = u.searchParams.get("v");
      if (v) return pick(v);
      const m = u.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    // không phải URL hợp lệ
  }
  return null;
}

function pick(candidate: string): string | null {
  const id = candidate.split(/[/?&#]/)[0];
  return /^[\w-]{11}$/.test(id) ? id : null;
}
