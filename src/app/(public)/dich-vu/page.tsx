import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getActiveServices } from "@/lib/queries/services";
import { buildMetadata } from "@/lib/seo";
import { listItemReveal } from "@/lib/reveal";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { PublicEmptyState } from "@/components/public/empty-state";
import { ProcessSteps } from "@/components/public/process-steps";
import { CtaSection } from "@/components/public/cta-section";
import { RevealSection } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Dịch vụ rèm cửa",
    description: "Dịch vụ trọn gói: tư vấn – đo đạc tận nơi miễn phí, lắp đặt rèm cửa chuyên nghiệp, bảo hành – bảo trì trọn đời, vệ sinh giặt rèm tại nhà, rèm công trình căn hộ – khách sạn – văn phòng.",
    path: "/dich-vu",
    image: "/images/service-lap-dat.jpg",
  });
}

export default async function ServicesPage() {
  const [s, services] = await Promise.all([getSettings(), getActiveServices()]);

  return (
    <>
      <PageHero
        title="Dịch vụ rèm cửa trọn gói"
        description="Từ đo đạc, tư vấn chọn vải đến may – lắp đặt và bảo hành, bảo trì: một đầu mối, một cam kết chất lượng cho mọi công trình lớn nhỏ."
        crumbs={[{ label: "Dịch vụ" }]}
        image="/images/service-lap-dat.jpg"
      />

      <RevealSection className="relative overflow-hidden bg-muted py-14 md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-brand-light blur-3xl" />
        <div className="container-page relative">
          {services.length > 0 ? (
            // flex-wrap + justify-center: hàng cuối thiếu thẻ vẫn được căn giữa
            <div className="flex flex-wrap justify-center gap-6">
              {services.map((sv, i) => (
                <div key={sv.id} {...listItemReveal(i, 3, "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]")}>
                  <ServiceCard service={sv} className="h-full" />
                </div>
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Dịch vụ đang được cập nhật" description="Vui lòng liên hệ hotline để được hỗ trợ." />
          )}
        </div>
      </RevealSection>

      <ProcessSteps />

      <CtaSection hotline={s.hotline} title="Cần tư vấn dịch vụ cho công trình của bạn?" description="Để lại thông tin, chúng tôi sẽ khảo sát, tư vấn và báo giá dịch vụ phù hợp – miễn phí trong nội thành." />
    </>
  );
}
