import { z } from "zod";
import { slugField } from "@/lib/validations/post";

const text = (max: number) => z.string().trim().max(max, `Tối đa ${max} ký tự`);
const optionalText = (max: number) => text(max).optional();
/** Số tiền VNĐ nhập dạng chuỗi – cho phép "350.000" hoặc "350000"; rỗng = chưa có giá (hiện "Liên hệ") */
const moneyString = z.string().trim().regex(/^[\d.,\s]*$/, "Chỉ nhập số, vd: 350000").optional();

export const PRODUCT_STATUSES = ["ACTIVE", "HIDDEN"] as const;
export const PRICE_UNITS = ["M2", "SET", "METER"] as const;

/** "350.000" / "350 000" / "350000" → 350000; rỗng → null */
export function parseMoney(value: string | undefined | null): number | null {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

/**
 * Schema form Sản phẩm (dùng chung client + server).
 * Các trường số giữ dạng chuỗi; server action chuyển kiểu khi lưu (parseMoney, Number).
 */
export const productSchema = z
  .object({
    name: text(200).min(3, "Vui lòng nhập tên sản phẩm (tối thiểu 3 ký tự)"),
    slug: slugField,
    categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
    /** ProductLine.id; "__none__" hoặc rỗng = chưa phân loại */
    lineId: z.string().optional(),
    code: optionalText(50),
    summary: optionalText(500),
    /** HTML – mô tả chi tiết */
    description: z.string().optional(),
    material: optionalText(200),
    origin: optionalText(100),
    width: optionalText(100),
    colors: optionalText(200),
    /** Slug không gian (ROOM_OPTIONS) */
    rooms: z.array(z.string().max(50)).max(20).optional(),
    /** Mỗi dòng một đặc điểm nổi bật */
    featuresText: z.string().optional(),
    priceFrom: moneyString,
    priceTo: moneyString,
    priceUnit: z.enum(PRICE_UNITS, "Vui lòng chọn đơn vị tính"),
    priceNote: optionalText(200),
    warrantyMonths: z.string().trim().regex(/^(\d{0,3})$/, "Số tháng bảo hành phải là số nguyên").optional(),
    image: z.string().nullable().optional(),
    /** URL ảnh phụ (tối đa 12) */
    gallery: z.array(z.string().trim().max(1000)).max(12).optional(),
    status: z.enum(PRODUCT_STATUSES, "Vui lòng chọn trạng thái"),
    isFeatured: z.boolean(),
    showInPriceTable: z.boolean(),
    metaTitle: optionalText(160),
    metaDescription: optionalText(320),
  })
  .refine(
    (d) => {
      const from = parseMoney(d.priceFrom);
      const to = parseMoney(d.priceTo);
      return from == null || to == null || to >= from;
    },
    { path: ["priceTo"], message: "Giá đến phải lớn hơn hoặc bằng giá từ" }
  );

export type ProductFormValues = z.infer<typeof productSchema>;
