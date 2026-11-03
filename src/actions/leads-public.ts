"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db, leads, productCategories, products } from "@/db";
import { leadFormSchema } from "@/lib/validations/lead";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSettings } from "@/lib/queries/settings";
import { fail, ok, safeAction, zodFail, type ActionResult } from "@/lib/action-result";

/**
 * Server action nhận form yêu cầu báo giá / tư vấn / liên hệ từ trang công khai.
 * - Validate bằng Zod (cùng schema với client)
 * - Honeypot: trường `website` có giá trị → coi là bot, trả về thành công giả
 * - Rate limit theo IP (binding LEAD_RATE_LIMITER của Workers, dự phòng bộ nhớ)
 * - Kiểm tra danh mục / sản phẩm còn tồn tại trước khi lưu khóa ngoại
 */
export async function submitLead(input: unknown): Promise<ActionResult> {
  return safeAction(async () => {
    const parsed = leadFormSchema.safeParse(input);
    if (!parsed.success) return zodFail(parsed.error);
    const data = parsed.data;

    if (data.website) return ok(undefined, "Đã nhận yêu cầu!");

    const ip = getClientIp(await headers());
    const limit = await checkRateLimit(`lead:${ip}`);
    if (!limit.allowed) {
      return fail(`Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.max(1, Math.ceil(limit.retryAfterSeconds / 60))} phút.`);
    }

    const [s, product, category] = await Promise.all([
      getSettings(),
      data.productId
        ? db.query.products.findFirst({ columns: { id: true, categoryId: true }, where: and(eq(products.id, data.productId), eq(products.status, "ACTIVE")) })
        : null,
      data.categoryId ? db.query.productCategories.findFirst({ columns: { id: true }, where: eq(productCategories.id, data.categoryId) }) : null,
    ]);

    await db.insert(leads).values({
      type: data.type,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      size: data.size || null,
      // Có sản phẩm thì lấy danh mục của sản phẩm để dữ liệu nhất quán
      categoryId: category?.id ?? product?.categoryId ?? null,
      productId: product?.id ?? null,
      message: data.message || null,
      source: data.source || null,
      ipAddress: ip,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/bao-gia");

    const store = s.shortName || s.companyName || "Chúng tôi";
    return ok(
      undefined,
      data.type === "CONTACT"
        ? `Đã gửi liên hệ thành công! ${store} sẽ phản hồi trong giờ làm việc.`
        : `Đã nhận yêu cầu! Nhân viên ${store} sẽ gọi lại trong giờ làm việc.`
    );
  });
}
