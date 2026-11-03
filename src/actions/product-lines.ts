"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { productLineSchema, type ProductLineFormValues } from "@/lib/validations/product-line";

const ADMIN_PATH = "/admin/loai-rem";

async function lineSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await db.query.productLines.findFirst({
    columns: { id: true },
    where: and(eq(productLines.slug, slug), excludeId ? ne(productLines.id, excludeId) : undefined),
  });
  return found !== undefined;
}

/** Loại rèm hiện ở trang chi tiết danh mục và bộ lọc `loai` của trang sản phẩm */
function revalidateLinePages(categorySlugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/danh-muc");
  revalidatePath("/san-pham");
  for (const s of new Set(categorySlugs.filter((v): v is string => !!v))) revalidatePath(`/danh-muc/${s}`);
  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin/san-pham");
  revalidatePath("/admin/danh-muc");
}

/** Danh mục phải tồn tại – trả lỗi theo trường để form hiển thị, hoặc slug danh mục nếu hợp lệ */
async function findCategorySlug(categoryId: string) {
  const category = await db.query.productCategories.findFirst({ columns: { slug: true }, where: eq(productCategories.id, categoryId) });
  return category?.slug ?? null;
}
function categoryNotFound<T>(): ActionResult<T> {
  return fail<T>("Danh mục không tồn tại", { categoryId: ["Danh mục không tồn tại hoặc đã bị xóa"] });
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu ghi DB */
function toData(v: ProductLineFormValues, slug: string) {
  return { name: v.name, slug, categoryId: v.categoryId, description: v.description || null, order: Number(v.order) || 0, isActive: v.isActive };
}

export async function createProductLine(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = productLineSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const categorySlug = await findCategorySlug(d.categoryId);
    if (!categorySlug) return categoryNotFound<{ id: string }>();
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "loai-rem", (s) => lineSlugExists(s));
    const [line] = await db.insert(productLines).values(toData(d, slug)).returning({ id: productLines.id });
    revalidateLinePages([categorySlug]);
    return ok({ id: line.id }, "Đã tạo loại rèm");
  });
}

export async function updateProductLine(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = productLineSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const current = await db.query.productLines.findFirst({
      columns: { id: true, categoryId: true },
      where: eq(productLines.id, id),
      with: { category: { columns: { slug: true } } },
    });
    if (!current) return fail("Loại rèm không tồn tại hoặc đã bị xóa.");
    const categorySlug = await findCategorySlug(d.categoryId);
    if (!categorySlug) return categoryNotFound<{ id: string }>();
    const slug = await uniqueSlug(slugify(d.slug || d.name) || "loai-rem", (s) => lineSlugExists(s, id));
    const updateLine = db.update(productLines).set(toData(d, slug)).where(eq(productLines.id, id));
    if (current.categoryId !== d.categoryId) {
      // Đổi danh mục của loại rèm → sản phẩm đang gắn loại này nhưng thuộc danh mục cũ sẽ lệch danh mục; gỡ liên kết để dữ liệu nhất quán
      await db.batch([updateLine, db.update(products).set({ lineId: null }).where(and(eq(products.lineId, id), ne(products.categoryId, d.categoryId)))]);
    } else {
      await updateLine;
    }
    revalidateLinePages([current.category?.slug, categorySlug]);
    return ok({ id }, "Đã lưu loại rèm");
  });
}

/**
 * Xóa loại rèm. Sản phẩm đang gắn loại này KHÔNG bị xóa, chỉ được đặt lineId = null (chưa phân loại)
 * – làm trong cùng một batch để dữ liệu nhất quán.
 */
export async function deleteProductLine(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const line = await db.query.productLines.findFirst({
      columns: { id: true },
      where: eq(productLines.id, id),
      with: { category: { columns: { slug: true } } },
    });
    if (!line) return fail("Loại rèm không tồn tại hoặc đã bị xóa.");
    await db.batch([
      db.update(products).set({ lineId: null }).where(eq(products.lineId, id)),
      db.delete(productLines).where(eq(productLines.id, id)),
    ]);
    revalidateLinePages([line.category?.slug]);
    return ok(undefined, "Đã xóa loại rèm");
  });
}

/** Bật/tắt nhanh hiển thị loại rèm */
export async function toggleProductLineActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [row] = await db.update(productLines).set({ isActive }).where(eq(productLines.id, id)).returning({ categoryId: productLines.categoryId });
    if (!row) return fail("Loại rèm không tồn tại hoặc đã bị xóa.");
    revalidateLinePages([await findCategorySlug(row.categoryId)]);
    return ok(undefined, isActive ? "Đã hiển thị loại rèm" : "Đã ẩn loại rèm");
  });
}
