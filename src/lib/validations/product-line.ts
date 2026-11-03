import { z } from "zod";
import { orderField, slugField } from "@/lib/validations/post";

/** Schema form Loại rèm (dòng sản phẩm trong một danh mục) – dialog tạo/sửa */
export const productLineSchema = z.object({
  name: z.string().trim().min(2, "Tên loại rèm tối thiểu 2 ký tự").max(100, "Tên loại rèm tối đa 100 ký tự"),
  slug: slugField,
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  description: z.string().trim().max(300, "Mô tả tối đa 300 ký tự"),
  order: orderField,
  isActive: z.boolean({ error: "Giá trị hiển thị không hợp lệ" }),
});

export type ProductLineFormValues = z.infer<typeof productLineSchema>;
