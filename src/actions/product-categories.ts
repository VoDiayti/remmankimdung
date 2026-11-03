"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, ne } from "drizzle-orm";
import { db, productCategories, products } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { productCategorySchema, type ProductCategoryFormValues } from "@/lib/validations/product-category";

const ADMIN_PATH = "/admin/danh-muc";

/** Danh mục xuất hiện ở trang chủ (tab bảng giá, khối danh mục), trang danh mục, bộ lọc sản phẩm */
function revalidateCategoryPages(slugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/danh-muc");
  revalidatePath("/san-pham");
  revalidatePath("/bao-gia");
  revalidatePath("/sitemap.xml");
  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin/loai-rem");
  revalidatePath("/admin/san-pham");
  for (const slug of new Set(slugs.filter(Boolean) as string[])) revalidatePath(`/danh-muc/${slug}`);
}

/** Tạo slug duy nhất (bỏ qua bản ghi đang sửa) */
async function resolveSlug(preferred: string | undefined, name: string, excludeId?: string) {
  const base = slugify(preferred ?? "") || slugify(name) || "danh-muc";
  return uniqueSlug(base, async (slug) => {
    const found = await db.query.productCategories.findFirst({
      columns: { id: true },
      where: and(eq(productCategories.slug, slug), excludeId ? ne(productCategories.id, excludeId) : undefined),
    });
    return !!found;
  });
}

/** Textarea mỗi dòng một mục → String[] */
function splitLines(text: string | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** HTML chỉ có đoạn trống (<p></p>) → null */
function htmlOrNull(html: string | undefined): string | null {
  if (!html) return null;
  const empty = /^(\s*<p[^>]*>(\s|<br\s*\/?>|&nbsp;)*<\/p>\s*)*$/i.test(html);
  return empty ? null : html;
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu ghi DB */
function toData(v: ProductCategoryFormValues) {
  return {
    name: v.name,
    image: v.image || null,
    summary: v.summary || null,
    description: htmlOrNull(v.description) ?? "",
    highlights: JSON.stringify(splitLines(v.highlightsText)),
    priceNote: v.priceNote || null,
    isFeatured: v.isFeatured,
    isActive: v.isActive,
    order: v.order ? Number(v.order) : 0,
    metaTitle: v.metaTitle || null,
    metaDescription: v.metaDescription || null,
  };
}

export async function createProductCategory(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = productCategorySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name);
    const [category] = await db.insert(productCategories).values({ ...toData(parsed.data), slug }).returning({ id: productCategories.id });
    revalidateCategoryPages([slug]);
    return ok({ id: category.id }, "Đã tạo danh mục rèm");
  });
}

export async function updateProductCategory(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = productCategorySchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const existing = await db.query.productCategories.findFirst({ columns: { slug: true }, where: eq(productCategories.id, id) });
    if (!existing) return fail("Không tìm thấy danh mục rèm");

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, id);
    await db.update(productCategories).set({ ...toData(parsed.data), slug }).where(eq(productCategories.id, id));
    revalidateCategoryPages([existing.slug, slug]);
    revalidatePath(`${ADMIN_PATH}/${id}`);
    return ok({ id }, "Đã lưu danh mục rèm");
  });
}

/**
 * Xóa danh mục. Sản phẩm tham chiếu danh mục bằng FK `restrict` nên phải từ chối khi còn sản phẩm;
 * loại rèm thuộc danh mục bị xóa theo (FK cascade), yêu cầu báo giá chỉ mất liên kết (set null).
 */
export async function deleteProductCategory(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const category = await db.query.productCategories.findFirst({ columns: { slug: true }, where: eq(productCategories.id, id) });
    if (!category) return fail("Không tìm thấy danh mục rèm");

    const [{ productCount }] = await db.select({ productCount: count() }).from(products).where(eq(products.categoryId, id));
    if (productCount > 0) {
      return fail(`Danh mục đang có ${productCount} sản phẩm, hãy xóa hoặc chuyển sản phẩm sang danh mục khác trước`);
    }
    await db.delete(productCategories).where(eq(productCategories.id, id));
    revalidateCategoryPages([category.slug]);
    return ok(undefined, "Đã xóa danh mục rèm");
  });
}

export async function toggleProductCategoryActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [category] = await db.update(productCategories).set({ isActive }).where(eq(productCategories.id, id)).returning({ slug: productCategories.slug });
    if (!category) return fail("Không tìm thấy danh mục rèm");
    revalidateCategoryPages([category.slug]);
    return ok(undefined, isActive ? "Đã hiển thị danh mục" : "Đã ẩn danh mục");
  });
}

export async function toggleProductCategoryFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [category] = await db.update(productCategories).set({ isFeatured }).where(eq(productCategories.id, id)).returning({ slug: productCategories.slug });
    if (!category) return fail("Không tìm thấy danh mục rèm");
    revalidateCategoryPages([category.slug]);
    return ok(undefined, isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
  });
}
