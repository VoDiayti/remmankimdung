import "server-only";
import { cache } from "react";
import { and, asc, eq } from "drizzle-orm";
import { db, productLines } from "@/db";

const activeLine = eq(productLines.isActive, true);
const lineOrder = [asc(productLines.order), asc(productLines.name)];

export type LineLink = { id: string; slug: string; name: string; categoryId: string };

/** Tất cả loại rèm đang hiển thị { id, slug, name, categoryId } – dùng cho bộ lọc phụ thuộc danh mục */
export const getActiveLineLinks = cache(async (): Promise<LineLink[]> =>
  db.query.productLines.findMany({ where: activeLine, columns: { id: true, slug: true, name: true, categoryId: true }, orderBy: lineOrder })
);

/** Loại rèm theo slug (chỉ loại đang hiển thị) kèm danh mục */
export async function getLineBySlug(slug: string) {
  const row = await db.query.productLines.findFirst({ where: and(eq(productLines.slug, slug), activeLine), with: { category: true } });
  return row ?? null;
}
