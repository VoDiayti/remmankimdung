import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getActiveProductCategories } from "@/lib/queries/product-categories";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/public/page-hero";
import { CategoryCard } from "@/components/public/category-card";
import { PublicEmptyState } from "@/components/public/empty-state";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Danh mục rèm cửa",
    description: "Tất cả danh mục rèm cửa: rèm vải, rèm cuốn, rèm cầu vồng Hàn Quốc, rèm roman, rèm sáo gỗ, rèm sáo nhôm, rèm phòng tắm, rèm lá dọc văn phòng – giá tham khảo và các loại trong từng danh mục.",
    path: "/danh-muc",
  });
}

export default async function CategoriesPage() {
  const [s, categories] = await Promise.all([getSettings(), getActiveProductCategories()]);
  return (
    <>
      <PageHero
        title="Danh mục rèm cửa"
        description="Mỗi danh mục gồm nhiều loại rèm với chất liệu, cơ chế và mức giá khác nhau. Chọn danh mục để xem mẫu, bảng giá tham khảo và ưu điểm của từng loại."
        crumbs={[{ label: "Danh mục rèm" }]}
      />
      <section className="bg-muted py-14 md:py-20">
        <div className="container-page">
          <p className="mx-auto mb-10 max-w-3xl text-center text-muted-foreground md:text-lg">
            Chưa biết chọn loại nào? Rèm vải phù hợp phòng khách – phòng ngủ cần sang trọng, ấm cúng; rèm cuốn và rèm cầu vồng gọn gàng cho căn hộ, văn phòng; rèm sáo gỗ tạo điểm nhấn cho quán cà phê, phòng làm việc. Gọi hotline để được tư vấn miễn phí.
          </p>
          {categories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((c, i) => (
                <CategoryCard key={c.id} category={c} priority={i < 4} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Danh mục rèm đang được cập nhật" />
          )}
        </div>
      </section>
      <CtaSection hotline={s.hotline} title="Chưa biết chọn loại rèm nào?" description="Nhân viên sẽ mang mẫu vải đến tận nhà, tư vấn kiểu rèm hợp nội thất và ngân sách của bạn – hoàn toàn miễn phí." />
    </>
  );
}
