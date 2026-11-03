import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Phone, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getOtherServices, getServiceBySlug } from "@/lib/queries/services";
import { getProductCategoryOptions } from "@/lib/queries/product-categories";
import { buildMetadata, plainText } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { PageHero } from "@/components/public/page-hero";
import { InfoItem } from "@/components/public/info-item";
import { LeadForm } from "@/components/public/lead-form";
import { ServiceCard, serviceIcon } from "@/components/public/service-card";
import { SectionHeading } from "@/components/public/section-heading";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, service] = await Promise.all([getSettings(), getServiceBySlug(slug)]);
  if (!service) return { title: "Không tìm thấy dịch vụ" };
  return buildMetadata(s, {
    title: service.title,
    description: service.summary || plainText(service.content, 300),
    path: `/dich-vu/${service.slug}`,
    image: service.image,
  });
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, service] = await Promise.all([getSettings(), getServiceBySlug(slug)]);
  if (!service) notFound();
  const [others, categories] = await Promise.all([getOtherServices(service.id, 3), getProductCategoryOptions()]);
  const Icon = serviceIcon(service.icon);
  const storeName = s.shortName || s.companyName;

  return (
    <>
      <PageHero title={service.title} description={service.summary} crumbs={[{ label: "Dịch vụ", href: "/dich-vu" }, { label: service.title }]} image={service.image} size="large" />

      <section className="relative z-10 -mt-8 md:-mt-10">
        <div className="container-page">
          <div className="grid gap-3 rounded-2xl border bg-card p-3 shadow-lg sm:grid-cols-3 md:gap-4 md:p-4">
            <InfoItem icon={Icon} label="Dịch vụ" value={service.title} className="border-0 bg-muted/60" />
            <InfoItem icon={Clock} label="Thời gian thực hiện" value={service.duration} className="border-0 bg-muted/60" />
            <InfoItem icon={Wallet} label="Chi phí" value={service.price} highlight className="border-0 bg-orange-50/80" />
          </div>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {service.content ? <RichContent html={service.content} className="prose-lg prose-h2:text-brand-dark" /> : <p className="text-muted-foreground">Nội dung dịch vụ đang được cập nhật.</p>}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div id="bao-gia" className="scroll-mt-28 rounded-2xl border bg-card p-6 shadow-sm">
              <LeadForm type="CONSULTATION" categories={categories} storeName={storeName} title="Đăng ký dịch vụ" description={`Để lại thông tin để đặt lịch “${service.title}”. Nhân viên sẽ gọi lại xác nhận trong giờ làm việc.`} submitLabel="Đặt lịch ngay" />
            </div>
            <a href={telHref(s.hotline)} className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-brand-dark">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-primary-foreground/80">Gọi hotline đặt lịch</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="bg-brand-light py-14 md:py-20">
          <div className="container-page">
            <SectionHeading label="Dịch vụ khác" title="Có thể bạn quan tâm" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((sv) => (
                <ServiceCard key={sv.id} service={sv} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection hotline={s.hotline} />
    </>
  );
}
