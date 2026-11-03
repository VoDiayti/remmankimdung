import { z } from "zod";
import { orderField, slugField } from "@/lib/validations/post";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) => text(max).optional();

/**
 * Schema form Danh mục sản phẩm (dùng chung client + server).
 * Mọi trường giữ dạng chuỗi/boolean; server action chuyển kiểu (số, mảng, null) khi lưu.
 */
export const productCategorySchema = z.object({
  name: text(150).min(2, "Vui lòng nhập tên danh mục"),
  slug: slugField,
  image: z.string().nullable().optional(),
  summary: optionalText(500),
  /** HTML từ trình soạn thảo */
  description: z.string().optional(),
  /** Mỗi dòng một ưu điểm */
  highlightsText: z.string().optional(),
  priceNote: optionalText(100),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
  order: orderField,
  metaTitle: optionalText(160),
  metaDescription: optionalText(320),
});

export type ProductCategoryFormValues = z.infer<typeof productCategorySchema>;
