import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db, settings } from "@/db";
import type { Setting } from "@/db/types";

/** Giá trị mặc định khi chưa seed – để website không lỗi trắng trang */
export const DEFAULT_SETTINGS: Setting = {
  id: 1,
  companyName: "Cửa hàng rèm cửa",
  shortName: "Rèm cửa",
  slogan: "Rèm đẹp cho mọi không gian",
  logo: "/logo.svg",
  taxCode: null,
  foundedYear: null,
  hotline: "0900 000 000",
  zalo: null,
  email: null,
  address: null,
  mapEmbedUrl: null,
  workingHours: null,
  facebook: null,
  youtube: null,
  tiktok: null,
  messenger: null,
  statCustomers: null,
  statYears: null,
  statProjects: null,
  statProducts: null,
  aboutShort: null,
  aboutContent: null,
  vision: null,
  mission: null,
  warrantyText: null,
  introVideoUrl: null,
  metaTitle: null,
  metaDescription: null,
  ogImage: "/og-default.jpg",
  priceTableTitle: null,
  priceTableEnabled: true,
  updatedAt: new Date(0),
};

/**
 * Lấy cài đặt chung (1 dòng, id = 1). Dùng React cache() để chỉ truy vấn 1 lần mỗi request
 * dù được gọi ở nhiều component (layout, header, footer, metadata...).
 */
export const getSettings = cache(async (): Promise<Setting> => {
  const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  return row ?? DEFAULT_SETTINGS;
});

/** URL gốc của website (dùng cho metadata, sitemap, JSON-LD) */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
