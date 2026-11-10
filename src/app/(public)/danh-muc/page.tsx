import type { Metadata } from "next";
import { Lightbulb, Phone } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getActiveProductCategories } from "@/lib/queries/product-categories";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { listItemReveal } from "@/lib/reveal";
import { PageHero } from "@/components/public/page-hero";
import { CategoryCard } from "@/components/public/category-card";
import { PublicEmptyState } from "@/components/public/empty-state";
import { CtaSection } from "@/components/public/cta-section";
import { RevealSection } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Danh mục rèm cửa",
    description: "Tất cả danh mục rèm cửa: rèm vải, rèm cuốn, rèm cầu vồng Hàn Quốc, rèm roman, rèm sáo gỗ, rèm sáo nhôm, rèm phòng tắm, rèm lá dọc văn phòng – giá tham khảo và các loại trong từng danh mục.",
    path: "/danh-muc",
  });
}

/** Chiều rộng ô theo số cột (flex-wrap + justify-center → hàng cuối thiếu thẻ vẫn căn giữa) */
const CARD_WIDTH = "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]";

export default async function CategoriesPage() {
  const [s, categories] = await Promise.all([getSettings(), getActiveProductCategories()]);
  return (
    <>
      <PageHero
        title="Danh mục rèm cửa"
        description="Mỗi danh mục gồm nhiều loại rèm với chất liệu, cơ chế và mức giá khác nhau. Chọn danh mục để xem mẫu, bảng giá tham khảo và ưu điểm của từng loại."
        crumbs={[{ label: "Danh mục rèm" }]}
      />
      <RevealSection className="relative overflow-hidden bg-muted py-14 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-brand-light blur-3xl" />
        <div className="container-page relative">
          {/* Gợi ý chọn rèm */}
          <div className="mx-auto mb-12 max-w-4xl animate-fade-up [animation-delay:300ms] motion-reduce:animate-none">
            <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-primary/15 bg-background p-5 text-center shadow-sm sm:flex-row sm:items-start sm:text-left md:p-6">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-1 bg-gradient-to-b from-cta to-primary sm:block" />
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground shadow-lg shadow-cta/30">
                <span aria-hidden="true" className="absolute inset-0 animate-soft-ping rounded-full bg-cta/50 motion-reduce:hidden" />
                <Lightbulb className="relative size-6" />
              </span>
              <div>
                <p className="font-bold text-brand-dark">Chưa biết chọn loại nào?</p>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  Rèm vải phù hợp phòng khách – phòng ngủ cần sang trọng, ấm cúng; rèm cuốn và rèm cầu vồng gọn gàng cho căn hộ, văn phòng; rèm sáo gỗ tạo điểm nhấn cho quán cà phê, phòng làm việc.
                </p>
                <a href={telHref(s.hotline)} className="group mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Phone className="size-4 animate-ring motion-reduce:animate-none" />
                  Gọi {s.hotline} để được tư vấn miễn phí
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((c, i) => (
                <div key={c.id} {...listItemReveal(i, 4, CARD_WIDTH)}>
                  <CategoryCard category={c} priority={i < 4} className="h-full" />
                </div>
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Danh mục rèm đang được cập nhật" />
          )}
        </div>
      </RevealSection>
      <CtaSection hotline={s.hotline} title="Chưa biết chọn loại rèm nào?" description="Nhân viên sẽ mang mẫu vải đến tận nhà, tư vấn kiểu rèm hợp nội thất và ngân sách của bạn – hoàn toàn miễn phí." />
    </>
  );
}
