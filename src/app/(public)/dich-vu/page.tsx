import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/settings";
import { getActiveServices } from "@/lib/queries/services";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { PublicEmptyState } from "@/components/public/empty-state";
import { ProcessSteps } from "@/components/public/process-steps";
import { CtaSection } from "@/components/public/cta-section";

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

      <section className="bg-muted py-14 md:py-20">
        <div className="container-page">
          {services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((sv) => (
                <ServiceCard key={sv.id} service={sv} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Dịch vụ đang được cập nhật" description="Vui lòng liên hệ hotline để được hỗ trợ." />
          )}
        </div>
      </section>

      <ProcessSteps />

      <CtaSection hotline={s.hotline} title="Cần tư vấn dịch vụ cho công trình của bạn?" description="Để lại thông tin, chúng tôi sẽ khảo sát, tư vấn và báo giá dịch vụ phù hợp – miễn phí trong nội thành." />
    </>
  );
}
