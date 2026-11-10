/**
 * Chỉ dùng khi chạy `next dev`: đợi binding Cloudflare (D1, R2…) sẵn sàng rồi Next.js mới nhận request.
 *
 * `initOpenNextCloudflareForDev()` trong next.config.ts chạy bất đồng bộ; khi binding để `"remote": true`
 * (dùng D1/R2 thật – xem wrangler.jsonc) nó cần vài giây để mở kết nối tới Cloudflare. Request tới sớm hơn
 * (vd. tab trình duyệt tự tải lại khi vừa khởi động) sẽ lỗi:
 *   "`getCloudflareContext` has been called without having called `initOpenNextCloudflareForDev`".
 * Next.js chờ `register()` chạy xong mới phục vụ request → chờ ở đây là đủ.
 * Production (Cloudflare Workers) và `next build`: NODE_ENV = production → bỏ qua ngay.
 */
export async function register() {
  if (process.env.NODE_ENV !== "development" || process.env.NEXT_RUNTIME !== "nodejs") return;

  const g = globalThis as typeof globalThis & Record<PropertyKey, unknown>;
  // Cùng điều kiện OpenNext dùng để chọn tiến trình khởi tạo context (tiến trình xử lý request có AsyncLocalStorage)
  if (!g.AsyncLocalStorage) return;

  const contextKey = Symbol.for("__cloudflare-context__"); // khoá OpenNext gắn context lên globalThis
  const timeoutMs = 60_000;
  const start = Date.now();
  while (!g[contextKey]) {
    if (Date.now() - start > timeoutMs) {
      console.warn(
        `⚠ Sau ${timeoutMs / 1000}s vẫn chưa kết nối được binding Cloudflare. Nếu wrangler.jsonc đang để "remote": true, ` +
          "hãy kiểm tra mạng và đăng nhập lại bằng `npx wrangler login`."
      );
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
