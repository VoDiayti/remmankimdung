import { z } from "zod";
import { orderField, slugField } from "@/lib/validations/post";

/** Schema form Dịch vụ (tư vấn – đo đạc, lắp đặt, bảo hành, vệ sinh rèm...) */
export const serviceSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200, "Tiêu đề tối đa 200 ký tự"),
  slug: slugField,
  summary: z.string().trim().max(500, "Tóm tắt tối đa 500 ký tự"),
  content: z.string().max(500_000, "Nội dung quá dài"),
  image: z.string().trim().max(1000, "Đường dẫn ảnh quá dài"),
  /** Tên icon lucide, vd Ruler, Wrench, ShieldCheck, Sparkles (để trống = icon mặc định) */
  icon: z.string().trim().max(50, "Tên icon tối đa 50 ký tự"),
  price: z.string().trim().max(100, "Giá dịch vụ tối đa 100 ký tự"),
  duration: z.string().trim().max(100, "Thời gian tối đa 100 ký tự"),
  order: orderField,
  isActive: z.boolean({ error: "Giá trị hiển thị không hợp lệ" }),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
