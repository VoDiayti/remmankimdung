"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, productCategories, productLines, products } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { ROOM_OPTIONS } from "@/lib/constants";
import { NONE_VALUE } from "@/lib/validations/post";
import { parseMoney, productSchema, type ProductFormValues } from "@/lib/validations/product";

const ADMIN_PATH = "/admin/san-pham";
/** Giá trị Select "Chưa phân loại" trên form sản phẩm (Radix Select không nhận chuỗi rỗng) */
const toLineId = (v: string | undefined): string | null => (v && v !== NONE_VALUE ? v : null);
const ROOM_VALUES = new Set<string>(ROOM_OPTIONS.map((r) => r.value));

function revalidateProductPages(productSlugs: (string | undefined)[], categorySlugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/san-pham");
  revalidatePath("/danh-muc");
  revalidatePath("/bao-gia");
  revalidatePath("/sitemap.xml");
  revalidatePath(ADMIN_PATH);
  revalidatePath("/admin");
  revalidatePath("/admin/danh-muc");
  revalidatePath("/admin/loai-rem");
  for (const slug of new Set(productSlugs.filter(Boolean) as string[])) revalidatePath(`/san-pham/${slug}`);
  for (const slug of new Set(categorySlugs.filter((v): v is string => !!v))) revalidatePath(`/danh-muc/${slug}`);
}

async function resolveSlug(preferred: string | undefined, name: string, excludeId?: string) {
  const base = slugify(preferred ?? "") || slugify(name) || "san-pham";
  return uniqueSlug(base, async (slug) => {
    const found = await db.query.products.findFirst({
      columns: { id: true },
      where: and(eq(products.slug, slug), excludeId ? ne(products.id, excludeId) : undefined),
    });
    return !!found;
  });
}

/**
 * Kiểm tra danh mục tồn tại và loại rèm (nếu chọn) phải thuộc đúng danh mục đó.
 * Trả về slug danh mục khi hợp lệ, hoặc ActionResult lỗi theo trường để form hiển thị.
 */
async function validateRefs(categoryId: string, lineId: string | null): Promise<{ categorySlug: string } | ActionResult<{ id: string }>> {
  const category = await db.query.productCategories.findFirst({ columns: { slug: true }, where: eq(productCategories.id, categoryId) });
  if (!category) return fail("Danh mục không tồn tại", { categoryId: ["Danh mục không tồn tại hoặc đã bị xóa"] });
  if (lineId) {
    const line = await db.query.productLines.findFirst({ columns: { categoryId: true }, where: eq(productLines.id, lineId) });
    if (!line) return fail("Loại rèm không tồn tại", { lineId: ["Loại rèm không tồn tại hoặc đã bị xóa"] });
    if (line.categoryId !== categoryId) return fail("Loại rèm không thuộc danh mục đã chọn", { lineId: ["Loại rèm không thuộc danh mục đã chọn"] });
  }
  return { categorySlug: category.slug };
}
const isError = (r: { categorySlug: string } | ActionResult<{ id: string }>): r is ActionResult<{ id: string }> => "success" in r;

/** Sản phẩm kèm slug danh mục (dùng để làm mới cache các trang liên quan) */
async function findProductSlugs(id: string) {
  return db.query.products.findFirst({
    columns: { slug: true, status: true },
    where: eq(products.id, id),
    with: { category: { columns: { slug: true } } },
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
function toData(v: ProductFormValues) {
  const rooms = (v.rooms ?? []).filter((r) => ROOM_VALUES.has(r));
  const gallery = Array.from(new Set((v.gallery ?? []).map((u) => u.trim()).filter(Boolean))).slice(0, 12);
  const warranty = v.warrantyMonths?.trim() ? Number(v.warrantyMonths) : null;
  return {
    name: v.name,
    categoryId: v.categoryId,
    lineId: toLineId(v.lineId),
    code: v.code || null,
    summary: v.summary || null,
    description: htmlOrNull(v.description) ?? "",
    material: v.material || null,
    origin: v.origin || null,
    width: v.width || null,
    colors: v.colors || null,
    rooms: JSON.stringify(rooms),
    features: JSON.stringify(splitLines(v.featuresText)),
    priceFrom: parseMoney(v.priceFrom),
    priceTo: parseMoney(v.priceTo),
    priceUnit: v.priceUnit,
    priceNote: v.priceNote || null,
    warrantyMonths: warranty != null && Number.isFinite(warranty) ? warranty : null,
    image: v.image || null,
    gallery: JSON.stringify(gallery),
    status: v.status,
    isFeatured: v.isFeatured,
    showInPriceTable: v.showInPriceTable,
    metaTitle: v.metaTitle || null,
    metaDescription: v.metaDescription || null,
  };
}

export async function createProduct(input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const refs = await validateRefs(parsed.data.categoryId, toLineId(parsed.data.lineId));
    if (isError(refs)) return refs;

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name);
    const [product] = await db.insert(products).values({ ...toData(parsed.data), slug }).returning({ id: products.id });
    revalidateProductPages([slug], [refs.categorySlug]);
    return ok({ id: product.id }, "Đã tạo sản phẩm");
  });
}

export async function updateProduct(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = productSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);

    const existing = await findProductSlugs(id);
    if (!existing) return fail("Không tìm thấy sản phẩm");
    const refs = await validateRefs(parsed.data.categoryId, toLineId(parsed.data.lineId));
    if (isError(refs)) return refs;

    const slug = await resolveSlug(parsed.data.slug, parsed.data.name, id);
    await db.update(products).set({ ...toData(parsed.data), slug }).where(eq(products.id, id));
    revalidateProductPages([existing.slug, slug], [existing.category.slug, refs.categorySlug]);
    revalidatePath(`${ADMIN_PATH}/${id}`);
    return ok({ id }, "Đã lưu sản phẩm");
  });
}

/** Xóa sản phẩm. Yêu cầu báo giá liên quan vẫn được giữ (productId → null). */
export async function deleteProduct(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const product = await findProductSlugs(id);
    if (!product) return fail("Không tìm thấy sản phẩm");
    await db.delete(products).where(eq(products.id, id));
    revalidateProductPages([product.slug], [product.category.slug]);
    return ok(undefined, "Đã xóa sản phẩm");
  });
}

/** Đổi nhanh trạng thái Đang bán ⇄ Ẩn */
export async function toggleProductStatus(id: string): Promise<ActionResult<{ status: "ACTIVE" | "HIDDEN" }>> {
  return safeAction(async () => {
    await assertUser();
    const product = await findProductSlugs(id);
    if (!product) return fail("Không tìm thấy sản phẩm");
    const status = product.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    await db.update(products).set({ status }).where(eq(products.id, id));
    revalidateProductPages([product.slug], [product.category.slug]);
    return ok({ status }, status === "ACTIVE" ? "Đã mở bán sản phẩm" : "Đã ẩn sản phẩm");
  });
}

export async function toggleProductFeatured(id: string, isFeatured: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const product = await findProductSlugs(id);
    if (!product) return fail("Không tìm thấy sản phẩm");
    await db.update(products).set({ isFeatured }).where(eq(products.id, id));
    revalidateProductPages([product.slug], [product.category.slug]);
    return ok(undefined, isFeatured ? "Đã đánh dấu nổi bật" : "Đã bỏ nổi bật");
  });
}

/** Bật/tắt nhanh hiển thị trong bảng giá trang chủ */
export async function toggleProductInPriceTable(id: string, showInPriceTable: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const product = await findProductSlugs(id);
    if (!product) return fail("Không tìm thấy sản phẩm");
    await db.update(products).set({ showInPriceTable }).where(eq(products.id, id));
    revalidateProductPages([product.slug], [product.category.slug]);
    return ok(undefined, showInPriceTable ? "Đã hiện trong bảng giá" : "Đã ẩn khỏi bảng giá");
  });
}
