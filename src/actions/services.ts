"use server";

import { revalidatePath } from "next/cache";
import { and, eq, ne } from "drizzle-orm";
import { db, services } from "@/db";
import { assertUser } from "@/lib/auth-guard";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";
import { slugify, uniqueSlug } from "@/lib/slug";
import { serviceSchema, type ServiceFormValues } from "@/lib/validations/service";

const ADMIN_PATH = "/admin/dich-vu";

async function serviceSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const found = await db.query.services.findFirst({
    columns: { id: true },
    where: and(eq(services.slug, slug), excludeId ? ne(services.id, excludeId) : undefined),
  });
  return found !== undefined;
}

function revalidateServicePaths(slugs: (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/dich-vu");
  revalidatePath("/sitemap.xml");
  for (const s of new Set(slugs.filter((v): v is string => !!v))) revalidatePath(`/dich-vu/${s}`);
  revalidatePath(ADMIN_PATH);
}

/** Chuyển giá trị form (chuỗi) sang dữ liệu ghi DB */
function toData(d: ServiceFormValues, slug: string) {
  return {
    title: d.title,
    slug,
    summary: d.summary || null,
    content: d.content,
    image: d.image || null,
    icon: d.icon || null,
    price: d.price || null,
    duration: d.duration || null,
    order: Number(d.order) || 0,
    isActive: d.isActive,
  };
}

export async function createService(input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const slug = await uniqueSlug(slugify(d.slug || d.title) || "dich-vu", (s) => serviceSlugExists(s));
    const [service] = await db.insert(services).values(toData(d, slug)).returning({ id: services.id, slug: services.slug });
    revalidateServicePaths([service.slug]);
    return ok({ id: service.id, slug: service.slug }, "Đã tạo dịch vụ");
  });
}

export async function updateService(id: string, input: unknown): Promise<ActionResult<{ id: string; slug: string }>> {
  return safeAction(async () => {
    await assertUser();
    const parsed = serviceSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;
    const current = await db.query.services.findFirst({ columns: { slug: true }, where: eq(services.id, id) });
    if (!current) return fail("Dịch vụ không tồn tại hoặc đã bị xóa.");
    const slug = await uniqueSlug(slugify(d.slug || d.title) || "dich-vu", (s) => serviceSlugExists(s, id));
    const [service] = await db.update(services).set(toData(d, slug)).where(eq(services.id, id)).returning({ id: services.id, slug: services.slug });
    revalidateServicePaths([current.slug, service.slug]);
    revalidatePath(`${ADMIN_PATH}/${id}`);
    return ok({ id: service.id, slug: service.slug }, "Đã lưu dịch vụ");
  });
}

export async function deleteService(id: string): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const service = await db.query.services.findFirst({ columns: { slug: true }, where: eq(services.id, id) });
    if (!service) return fail("Dịch vụ không tồn tại hoặc đã bị xóa.");
    await db.delete(services).where(eq(services.id, id));
    revalidateServicePaths([service.slug]);
    return ok(undefined, "Đã xóa dịch vụ");
  });
}

/** Bật/tắt nhanh hiển thị dịch vụ */
export async function toggleServiceActive(id: string, isActive: boolean): Promise<ActionResult> {
  return safeAction(async () => {
    await assertUser();
    const [row] = await db.update(services).set({ isActive }).where(eq(services.id, id)).returning({ slug: services.slug });
    if (!row) return fail("Dịch vụ không tồn tại hoặc đã bị xóa.");
    revalidateServicePaths([row.slug]);
    return ok(undefined, isActive ? "Đã hiển thị dịch vụ" : "Đã ẩn dịch vụ");
  });
}
