import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Độ trễ (ms) cho hiệu ứng xuất hiện `data-reveal` (xem components/public/reveal.tsx) – để các phần tử lần lượt hiện ra.
 * Module thường (không "use client") nên gọi được trong Server Component.
 */
export const revealDelay = (ms: number) => ({ "--reveal-delay": `${ms}ms` }) as CSSProperties;

/** Độ trễ theo vị trí trong lưới: lặp lại sau mỗi `perRow` thẻ để hàng sau không phải chờ quá lâu */
export const gridRevealDelay = (index: number, perRow = 4, step = 100, base = 0) => revealDelay(base + (index % perRow) * step);

/**
 * Props cho ô bọc mỗi thẻ trong lưới danh sách ở đầu trang (sản phẩm, dịch vụ, tin tức…):
 * hàng đầu thường đã nằm trong màn hình lúc tải → chạy hiệu ứng CSS ngay từ lần vẽ đầu (không nháy);
 * các hàng sau dùng `data-reveal` để hiện khi cuộn tới (cần nằm trong <RevealSection>).
 */
export function listItemReveal(index: number, perRow: number, className?: string) {
  if (index < perRow) {
    return {
      className: cn("animate-fade-up motion-reduce:animate-none", className),
      style: { animationDelay: `${250 + index * 100}ms` } as CSSProperties,
    };
  }
  return { "data-reveal": "", className, style: gridRevealDelay(index, perRow) };
}
