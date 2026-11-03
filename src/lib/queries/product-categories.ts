import "server-only";
import { cache } from "react";
import { and, asc, desc, eq } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import type { PriceUnit } from "@/db/enums";
import type { ProductCategory, ProductLine } from "@/db/types";

const activeCategory = eq(productCategories.isActive, true);
const categoryOrder = [asc(productCategories.order), asc(productCategories.name)];
const activeLine = eq(productLines.isActive, true);
const lineOrder = [asc(productLines.order), asc(productLines.name)];

/** Nạp kèm các loại rèm đang hiển thị của danh mục */
const withActiveLines = {
  lines: { where: activeLine, orderBy: lineOrder, columns: { id: true, name: true, slug: true, description: true } },
} as const;

export type CategoryLineData = Pick<ProductLine, "id" | "name" | "slug" | "description">;
export type CategoryWithLines = ProductCategory & { lines: CategoryLineData[] };

/** Tất cả danh mục rèm đang hoạt động kèm loại rèm (cache theo request) */
export const getActiveProductCategories = cache(async (): Promise<CategoryWithLines[]> =>
  db.query.productCategories.findMany({ where: activeCategory, orderBy: categoryOrder, with: withActiveLines })
);

/** Danh mục nổi bật cho trang chủ */
export async function getFeaturedProductCategories(limit = 8): Promise<CategoryWithLines[]> {
  return db.query.productCategories.findMany({
    where: and(activeCategory, eq(productCategories.isFeatured, true)),
    orderBy: categoryOrder,
    with: withActiveLines,
    limit,
  });
}

/** Chi tiết danh mục theo slug (chỉ danh mục đang hoạt động), kèm loại rèm theo thứ tự */
export async function getProductCategoryBySlug(slug: string): Promise<CategoryWithLines | null> {
  const row = await db.query.productCategories.findFirst({ where: and(eq(productCategories.slug, slug), activeCategory), with: withActiveLines });
  return row ?? null;
}

/** Danh sách { id, name } dùng cho ô chọn "Loại rèm quan tâm" trong form báo giá */
export const getProductCategoryOptions = cache(async () =>
  db.query.productCategories.findMany({ where: activeCategory, columns: { id: true, name: true }, orderBy: categoryOrder })
);

/** Danh sách { slug, name } dùng cho footer, bộ lọc sản phẩm */
export const getProductCategoryLinks = cache(async () =>
  db.query.productCategories.findMany({ where: activeCategory, columns: { id: true, slug: true, name: true }, orderBy: categoryOrder })
);

/** Dùng cho sitemap */
export async function getProductCategorySlugs() {
  return db.query.productCategories.findMany({ where: activeCategory, columns: { slug: true, updatedAt: true }, orderBy: categoryOrder });
}

export type PriceTableRow = {
  id: string;
  name: string;
  slug: string;
  code: string | null;
  material: string | null;
  width: string | null;
  priceFrom: number | null;
  priceTo: number | null;
  priceUnit: PriceUnit;
  warrantyMonths: number | null;
  isFeatured: boolean;
};

export type PriceTableGroup = {
  id: string;
  name: string;
  slug: string;
  priceNote: string | null;
  /** Tổng số sản phẩm có trong bảng giá của danh mục (có thể lớn hơn số dòng hiển thị) */
  total: number;
  rows: PriceTableRow[];
};

/**
 * Dữ liệu bảng giá theo tab danh mục ở trang chủ: mỗi danh mục đang hoạt động kèm sản phẩm ACTIVE có `showInPriceTable`.
 * Danh mục không có sản phẩm được bỏ qua. Sắp xếp: nổi bật → mới tạo.
 */
export async function getPriceTableGroups(limitPerTab = 12): Promise<PriceTableGroup[]> {
  const [cats, rows] = await Promise.all([
    db.query.productCategories.findMany({ where: activeCategory, orderBy: categoryOrder, columns: { id: true, name: true, slug: true, priceNote: true } }),
    db.query.products.findMany({
      where: and(eq(products.status, "ACTIVE"), eq(products.showInPriceTable, true)),
      columns: {
        id: true,
        name: true,
        slug: true,
        code: true,
        material: true,
        width: true,
        priceFrom: true,
        priceTo: true,
        priceUnit: true,
        warrantyMonths: true,
        isFeatured: true,
        categoryId: true,
      },
      orderBy: [desc(products.isFeatured), desc(products.createdAt)],
    }),
  ]);

  const byCategory = new Map<string, PriceTableRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.categoryId) ?? [];
    list.push({
      id: r.id,
      name: r.name,
      slug: r.slug,
      code: r.code,
      material: r.material,
      width: r.width,
      priceFrom: r.priceFrom,
      priceTo: r.priceTo,
      priceUnit: r.priceUnit,
      warrantyMonths: r.warrantyMonths,
      isFeatured: r.isFeatured,
    });
    byCategory.set(r.categoryId, list);
  }

  return cats
    .map((c) => {
      const list = byCategory.get(c.id) ?? [];
      return { id: c.id, name: c.name, slug: c.slug, priceNote: c.priceNote, total: list.length, rows: list.slice(0, limitPerTab) };
    })
    .filter((g) => g.rows.length > 0);
}
