import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import type { PriceUnit } from "@/db/enums";
import { PRICE_UNIT_LABELS } from "@/lib/constants";

export function formatDate(date: Date | string | null | undefined, pattern = "dd/MM/yyyy"): string {
  if (!date) return "";
  return format(new Date(date), pattern, { locale: vi });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, "HH:mm dd/MM/yyyy");
}

export function timeAgo(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: vi });
}

/** 28000000 → "28 triệu" ; 28500000 → "28,5 triệu" */
export function formatVndMillions(vnd: number | null | undefined): string {
  if (!vnd) return "";
  const m = vnd / 1_000_000;
  return `${Number.isInteger(m) ? m : m.toFixed(1).replace(".", ",")} triệu`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n == null) return "";
  return new Intl.NumberFormat("vi-VN").format(n);
}

/** Rút gọn văn bản thuần (dùng cho mô tả ngắn / meta description) */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Chuẩn hóa số điện thoại Việt Nam về dạng 0xxxxxxxxx */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits;
}

/** Link gọi điện: "0912 345 678" → "tel:0912345678" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** Link Zalo: số điện thoại → https://zalo.me/0912345678 */
export function zaloHref(phone: string): string {
  return `https://zalo.me/${phone.replace(/\D/g, "")}`;
}

/** Đọc mảng chuỗi lưu dạng JSON trong SQLite (vd highlights của danh mục; rooms, features, gallery của sản phẩm) */
export function parseStringList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return value.split("\n").map((v) => v.trim()).filter(Boolean);
  }
}

/** 350000 → "350.000 đ" */
export function formatVnd(vnd: number | null | undefined): string {
  if (vnd == null) return "";
  return `${new Intl.NumberFormat("vi-VN").format(vnd)} đ`;
}

/**
 * Chuỗi giá tham khảo của sản phẩm:
 * "350.000 – 520.000 đ/m²" · "Từ 350.000 đ/bộ" (chỉ có giá từ) · "Liên hệ" (chưa có giá)
 */
export function formatPriceRange(priceFrom: number | null | undefined, priceTo: number | null | undefined, unit: PriceUnit = "M2"): string {
  const suffix = PRICE_UNIT_LABELS[unit] ?? "đ";
  const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n);
  if (priceFrom == null && priceTo == null) return "Liên hệ";
  if (priceFrom != null && priceTo != null && priceTo !== priceFrom) return `${fmt(priceFrom)} – ${fmt(priceTo)} ${suffix}`;
  if (priceFrom != null && priceTo == null) return `Từ ${fmt(priceFrom)} ${suffix}`;
  return `${fmt((priceFrom ?? priceTo) as number)} ${suffix}`;
}
