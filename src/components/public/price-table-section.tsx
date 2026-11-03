import { SectionHeading } from "@/components/public/section-heading";
import { PriceTableTabs } from "@/components/public/price-table-tabs";
import type { PriceTableGroup } from "@/lib/queries/product-categories";

/** Khối "bảng giá theo danh mục" trên trang chủ (tiêu đề và bật/tắt chỉnh trong Admin → Cài đặt chung) */
export function PriceTableSection({ title, groups }: { title: string; groups: PriceTableGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <section className="bg-background py-14 md:py-20" id="bang-gia">
      <div className="container-page">
        <SectionHeading
          label="Bảng giá"
          title={title}
          description="Chọn danh mục để xem giá tham khảo theo m² hoặc theo bộ của từng mẫu rèm – đã gồm phụ kiện cơ bản, chưa gồm công lắp đặt. Giá chính thức được báo sau khi đo đạc thực tế."
          className="mb-8 md:mb-10"
        />
        <PriceTableTabs groups={groups} />
      </div>
    </section>
  );
}
