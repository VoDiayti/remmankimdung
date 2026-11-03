import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { db, services } from "@/db";

const activeService = eq(services.isActive, true);
const serviceOrder = [asc(services.order), desc(services.createdAt)];

/** Dịch vụ đang hiển thị (cache theo request – dùng ở footer và trang chủ) */
export const getActiveServices = cache(async () => db.query.services.findMany({ where: activeService, orderBy: serviceOrder }));

export async function getServiceBySlug(slug: string) {
  const row = await db.query.services.findFirst({ where: and(eq(services.slug, slug), activeService) });
  return row ?? null;
}

/** Dịch vụ khác (gợi ý ở cuối trang chi tiết) */
export async function getOtherServices(excludeId: string, limit = 3) {
  return db.query.services.findMany({ where: and(activeService, ne(services.id, excludeId)), orderBy: serviceOrder, limit });
}

/** Dùng cho sitemap */
export async function getServiceSlugs() {
  return db.query.services.findMany({ where: activeService, columns: { slug: true, updatedAt: true } });
}
