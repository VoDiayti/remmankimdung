import "server-only";
import { and, count, desc, eq, gte, inArray, like, lt, ne, or, type SQL } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import type { Product, ProductCategory, ProductLine } from "@/db/types";
import { PAGE_SIZE, PRICE_RANGES, ROOM_OPTIONS } from "@/lib/constants";
import { slugify } from "@/lib/slug";

/** Các trường cần cho card sản phẩm */
export const productCardColumns = {
  id: true,
  name: true,
  slug: true,
  code: true,
  summary: true,
  material: true,
  width: true,
  priceFrom: true,
  priceTo: true,
  priceUnit: true,
  priceNote: true,
  warrantyMonths: true,
  image: true,
  isFeatured: true,
  categoryId: true,
  lineId: true,
  createdAt: true,
} as const;

const productCardWith = {
  category: { columns: { name: true, slug: true } },
  line: { columns: { name: true, slug: true } },
} as const;

export type ProductCardData = Pick<Product, keyof typeof productCardColumns> & {
  category: Pick<ProductCategory, "name" | "slug">;
  line: Pick<ProductLine, "name" | "slug"> | null;
};

export type ProductDetail = Product & { category: ProductCategory; line: ProductLine | null };

const activeProduct = eq(products.status, "ACTIVE");
const productOrder = [desc(products.isFeatured), desc(products.createdAt)];

/** Tham số lọc đọc từ URL trang /san-pham */
export type ProductFilters = {
  /** slug danh mục (`danh-muc`) */
  category?: string;
  /** slug loại rèm (`loai`) */
  line?: string;
  /** value của PRICE_RANGES (`gia`), so với priceFrom */
  price?: string;
  /** value của ROOM_OPTIONS (`phong`) */
  room?: string;
  q?: string;
  page?: number;
};

/** Chuyển tham số lọc thành điều kiện SQL (Drizzle) */
export function buildProductWhere(f: ProductFilters): SQL | undefined {
  const conditions: (SQL | undefined)[] = [activeProduct];

  if (f.category) {
    conditions.push(
      inArray(
        products.categoryId,
        db.select({ id: productCategories.id }).from(productCategories).where(and(eq(productCategories.slug, f.category), eq(productCategories.isActive, true)))
      )
    );
  }
  if (f.line) {
    conditions.push(
      inArray(products.lineId, db.select({ id: productLines.id }).from(productLines).where(and(eq(productLines.slug, f.line), eq(productLines.isActive, true))))
    );
  }

  const price = PRICE_RANGES.find((r) => r.value === f.price);
  if (price) {
    conditions.push(gte(products.priceFrom, price.min));
    if (price.max < Number.MAX_SAFE_INTEGER) conditions.push(lt(products.priceFrom, price.max));
  }

  const room = ROOM_OPTIONS.find((r) => r.value === f.room);
  if (room) conditions.push(like(products.rooms, `%"${room.value}"%`));

  const q = f.q?.trim();
  if (q) {
    const pattern = `%${q}%`;
    const terms: (SQL | undefined)[] = [like(products.name, pattern), like(products.code, pattern), like(products.material, pattern), like(products.summary, pattern)];
    // Tìm theo slug để khớp cả khi người dùng gõ không dấu ("rem cuon" → "rem-cuon")
    const s = slugify(q);
    if (s) terms.push(like(products.slug, `%${s}%`));
    conditions.push(or(...terms));
  }

  return and(...conditions);
}

/** Danh sách sản phẩm có lọc + phân trang */
export async function searchProducts(f: ProductFilters) {
  const where = buildProductWhere(f);
  const page = Math.max(1, Math.floor(f.page ?? 1));
  const [items, [{ total }]] = await Promise.all([
    db.query.products.findMany({
      where,
      columns: productCardColumns,
      with: productCardWith,
      orderBy: productOrder,
      offset: (page - 1) * PAGE_SIZE,
      limit: PAGE_SIZE,
    }),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return { items: items as ProductCardData[], total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Sản phẩm nổi bật cho trang chủ */
export async function getFeaturedProducts(limit = 6): Promise<ProductCardData[]> {
  return db.query.products.findMany({
    where: and(activeProduct, eq(products.isFeatured, true)),
    columns: productCardColumns,
    with: productCardWith,
    orderBy: productOrder,
    limit,
  });
}

/** Sản phẩm mới nhất */
export async function getLatestProducts(limit = 6): Promise<ProductCardData[]> {
  return db.query.products.findMany({ where: activeProduct, columns: productCardColumns, with: productCardWith, orderBy: [desc(products.createdAt)], limit });
}

/** Sản phẩm đang bán của một danh mục (tùy chọn theo loại rèm) */
export async function getProductsByCategory(categoryId: string, limit?: number, lineId?: string | null): Promise<ProductCardData[]> {
  return db.query.products.findMany({
    where: and(activeProduct, eq(products.categoryId, categoryId), lineId ? eq(products.lineId, lineId) : undefined),
    columns: productCardColumns,
    with: productCardWith,
    orderBy: productOrder,
    limit,
  });
}

/** Chi tiết sản phẩm (chỉ sản phẩm đang bán) kèm danh mục và loại rèm */
export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const product = await db.query.products.findFirst({ where: and(eq(products.slug, slug), activeProduct), with: { category: true, line: true } });
  return product ?? null;
}

/** Sản phẩm liên quan cùng danh mục */
export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 3): Promise<ProductCardData[]> {
  return db.query.products.findMany({
    where: and(activeProduct, eq(products.categoryId, categoryId), ne(products.id, excludeId)),
    columns: productCardColumns,
    with: productCardWith,
    orderBy: productOrder,
    limit,
  });
}

/** Dùng cho sitemap */
export async function getProductSlugs() {
  return db.query.products.findMany({ where: activeProduct, columns: { slug: true, updatedAt: true }, orderBy: productOrder });
}
