import type { Metadata } from "next";
import Image from "next/image";
import { Award, Building, CircleCheck, Eye, Layers, ShieldCheck, Target, Users } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { formatNumber } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Gallery } from "@/components/public/gallery";
import { ProcessSteps } from "@/components/public/process-steps";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: "Giới thiệu",
    description: s.aboutShort || `Giới thiệu về ${s.companyName} – xưởng may rèm cửa, showroom mẫu vải, đo đạc tận nơi miễn phí, lắp đặt nhanh, bảo hành dài hạn.`,
    path: "/gioi-thieu",
    image: "/images/about-showroom.jpg",
  });
}

const SHOWROOM_POINTS = [
  "Showroom trưng bày hơn 500 mẫu vải, rèm cuốn, rèm cầu vồng, sáo gỗ – nhôm lắp sẵn để bạn trải nghiệm thực tế",
  "Xưởng may riêng với máy may công nghiệp, bàn cắt khổ lớn – kiểm soát chất lượng từng đường may",
  "Đội kỹ thuật đo đạc, lắp đặt được đào tạo bài bản, trang bị đầy đủ dụng cụ chuyên dụng",
  "Kho phụ kiện, thanh ray, mô-tơ rèm tự động sẵn hàng – thay thế nhanh khi bảo hành",
];

const GALLERY = [
  { src: "/images/about-showroom.jpg", alt: "Showroom trưng bày mẫu rèm", caption: "Showroom mẫu vải & rèm lắp sẵn" },
  { src: "/images/about-lap-dat.jpg", alt: "Kỹ thuật viên lắp đặt rèm", caption: "Lắp đặt tại nhà khách hàng" },
  { src: "/images/service-tu-van.jpg", alt: "Tư vấn chọn mẫu vải", caption: "Tư vấn mẫu vải tận nơi" },
  { src: "/images/service-ve-sinh.jpg", alt: "Vệ sinh rèm", caption: "Vệ sinh – bảo trì rèm" },
  { src: "/images/cta-bg.jpg", alt: "Công trình rèm đã hoàn thiện", caption: "Công trình đã bàn giao" },
];

export default async function AboutPage() {
  const s = await getSettings();
  const shortName = s.shortName || s.companyName;

  const stats = [
    { label: "Khách hàng tin chọn", value: s.statCustomers, Icon: Users },
    { label: "Năm kinh nghiệm", value: s.statYears, Icon: Award },
    { label: "Công trình đã thi công", value: s.statProjects, Icon: Building },
    { label: "Mẫu rèm có sẵn", value: s.statProducts, Icon: Layers },
  ].filter((x) => x.value);

  return (
    <>
      <PageHero title={`Giới thiệu về ${shortName}`} description={s.slogan} crumbs={[{ label: "Giới thiệu" }]} image="/images/about-showroom.jpg" size="large" />

      {/* Tổng quan */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading align="left" label="Chúng tôi là ai" title={s.companyName} className="mb-5" />
            {s.aboutShort && <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{s.aboutShort}</p>}
            {stats.length > 0 && (
              <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((x) => (
                  <div key={x.label} className="rounded-2xl border bg-card p-4 text-center">
                    <x.Icon className="mx-auto size-5 text-primary" />
                    <dd className="mt-2 text-2xl font-extrabold text-brand-dark md:text-3xl">{formatNumber(x.value)}+</dd>
                    <dt className="mt-0.5 text-xs text-muted-foreground md:text-sm">{x.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
            <Image src="/images/about-showroom.jpg" alt={`Showroom ${shortName}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Tầm nhìn – Sứ mệnh */}
      {(s.vision || s.mission) && (
        <section className="bg-brand-light py-14 md:py-20">
          <div className="container-page">
            <SectionHeading label="Định hướng" title="Tầm nhìn & Sứ mệnh" />
            <div className="grid gap-6 md:grid-cols-2">
              {s.vision && (
                <div className="rounded-2xl border bg-card p-7 shadow-sm">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <Eye className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-brand-dark">Tầm nhìn</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.vision}</p>
                </div>
              )}
              {s.mission && (
                <div className="rounded-2xl border bg-card p-7 shadow-sm">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-cta text-cta-foreground">
                    <Target className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-brand-dark">Sứ mệnh</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">{s.mission}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Nội dung chi tiết + cam kết bảo hành */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {s.aboutContent ? <RichContent html={s.aboutContent} className="prose-lg prose-h2:text-brand-dark" /> : <p className="text-muted-foreground">Nội dung giới thiệu đang được cập nhật.</p>}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-primary/15 bg-brand-light p-6">
              <ShieldCheck className="size-9 text-primary" />
              <h3 className="mt-3 text-lg font-bold text-brand-dark">Cam kết bảo hành</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.warrantyText || "Bảo hành phụ kiện, thanh ray đến 24 tháng; bảo trì – chỉnh sửa trọn đời sản phẩm."}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {s.foundedYear && (
                  <li>
                    <span className="text-muted-foreground">Năm thành lập: </span>
                    <strong>{s.foundedYear}</strong>
                  </li>
                )}
                {s.taxCode && (
                  <li>
                    <span className="text-muted-foreground">Mã số thuế: </span>
                    <strong>{s.taxCode}</strong>
                  </li>
                )}
                {s.address && (
                  <li>
                    <span className="text-muted-foreground">Showroom – xưởng: </span>
                    {s.address}
                  </li>
                )}
                {s.workingHours && (
                  <li>
                    <span className="text-muted-foreground">Giờ làm việc: </span>
                    {s.workingHours}
                  </li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Showroom & xưởng */}
      <section className="bg-muted py-14 md:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
              <Image src="/images/service-tu-van.jpg" alt="Tư vấn mẫu vải tại showroom" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
              <Image src="/images/about-lap-dat.jpg" alt="Kỹ thuật viên lắp đặt rèm" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
            </div>
          </div>
          <div>
            <SectionHeading align="left" label="Showroom & xưởng may" title="Xem mẫu thật, giá tận xưởng" description="Khách hàng có thể đến showroom trải nghiệm trực tiếp hoặc để nhân viên mang bộ mẫu vải đến tận nhà – mọi sản phẩm đều được may tại xưởng riêng." className="mb-6" />
            <ul className="space-y-3">
              {SHOWROOM_POINTS.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProcessSteps />

      {/* Hình ảnh */}
      <section className="bg-brand-light py-14 md:py-20">
        <div className="container-page">
          <SectionHeading label="Hình ảnh" title="Showroom, xưởng & công trình" />
          <Gallery images={GALLERY} />
        </div>
      </section>

      <CtaSection hotline={s.hotline} />
    </>
  );
}
