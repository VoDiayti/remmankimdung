import { revealDelay } from "@/lib/reveal";
import { RevealSection } from "@/components/public/reveal";
import { SectionHeading } from "@/components/public/section-heading";
import { PriceTableTabs } from "@/components/public/price-table-tabs";
import type { PriceTableGroup } from "@/lib/queries/product-categories";

/** Khối "bảng giá theo danh mục" trên trang chủ (tiêu đề và bật/tắt chỉnh trong Admin → Cài đặt chung) */
export function PriceTableSection({ title, groups }: { title: string; groups: PriceTableGroup[] }) {
  if (groups.length === 0) return null;
  return (
    <RevealSection id="bang-gia" className="relative overflow-hidden bg-background py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 size-96 rounded-full bg-brand-light blur-3xl" />
      <div className="container-page relative">
        <SectionHeading
          label="Bảng giá"
          title={title}
          description="Chọn danh mục để xem giá tham khảo theo m² hoặc theo bộ của từng mẫu rèm – đã gồm phụ kiện cơ bản, chưa gồm công lắp đặt. Giá chính thức được báo sau khi đo đạc thực tế."
          className="mb-8 md:mb-10"
        />
        <div data-reveal style={revealDelay(250)}>
          <PriceTableTabs groups={groups} />
        </div>
      </div>
    </RevealSection>
  );
}
