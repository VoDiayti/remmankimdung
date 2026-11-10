import type { Metadata } from "next";
import Image from "next/image";
import { Award, Building, CalendarDays, Check, Clock, Eye, FileText, Layers, MapPin, ShieldCheck, Target, Users } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { buildMetadata } from "@/lib/seo";
import { gridRevealDelay, revealDelay } from "@/lib/reveal";
import { RichContent } from "@/components/shared/rich-content";
import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Gallery } from "@/components/public/gallery";
import { ProcessSteps } from "@/components/public/process-steps";
import { CtaSection } from "@/components/public/cta-section";
import { CountUp, RevealSection } from "@/components/public/reveal";

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

const DOTS = "bg-[radial-gradient(var(--color-primary)_1.6px,transparent_1.6px)] [background-size:14px_14px]";

/** Thẻ Tầm nhìn / Sứ mệnh: nổi lên khi rê chuột, vạch màu chạy mép trên, icon lớn mờ làm nền */
function DirectionCard({ title, text, Icon, tone }: { title: string; text: string; Icon: typeof Eye; tone: "primary" | "cta" }) {
  return (
    <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-brand-dark/10 md:p-8">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-cta via-amber-300 to-primary transition-transform duration-500 group-hover:scale-x-100" />
      <Icon aria-hidden="true" className="absolute -bottom-6 -right-6 size-36 text-brand-light transition-transform duration-700 group-hover:-rotate-12 group-hover:scale-110" />
      <span
        className={
          tone === "primary"
            ? "relative flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
            : "relative flex size-12 items-center justify-center rounded-2xl bg-cta text-cta-foreground shadow-lg shadow-cta/30 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
        }
      >
        <Icon className="size-6" />
      </span>
      <h3 className="relative mt-4 text-xl font-bold text-brand-dark">{title}</h3>
      <p className="relative mt-2 leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

export default async function AboutPage() {
  const s = await getSettings();
  const shortName = s.shortName || s.companyName;

  const stats = [
    { label: "Khách hàng tin chọn", value: s.statCustomers, Icon: Users },
    { label: "Năm kinh nghiệm", value: s.statYears, Icon: Award },
    { label: "Công trình đã thi công", value: s.statProjects, Icon: Building },
    { label: "Mẫu rèm có sẵn", value: s.statProducts, Icon: Layers },
  ].filter((x): x is typeof x & { value: number } => Boolean(x.value));

  const facts = [
    s.foundedYear && { Icon: CalendarDays, label: "Năm thành lập", value: String(s.foundedYear) },
    s.taxCode && { Icon: FileText, label: "Mã số thuế", value: s.taxCode },
    s.address && { Icon: MapPin, label: "Showroom – xưởng", value: s.address },
    s.workingHours && { Icon: Clock, label: "Giờ làm việc", value: s.workingHours },
  ].filter((x): x is { Icon: typeof MapPin; label: string; value: string } => Boolean(x));

  return (
    <>
      <PageHero title={`Giới thiệu về ${shortName}`} description={s.slogan} crumbs={[{ label: "Giới thiệu" }]} image="/images/about-showroom.jpg" size="large" />

      {/* Tổng quan: chữ + số liệu đếm lên, ảnh mở như kéo rèm */}
      <RevealSection className="relative overflow-hidden bg-background py-16 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 size-[28rem] rounded-full bg-brand-light blur-3xl" />
        <div className="container-page relative grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading align="left" label="Chúng tôi là ai" title={s.companyName} className="mb-5" />
            {s.aboutShort && (
              <p data-reveal style={revealDelay(200)} className="text-base leading-relaxed text-muted-foreground md:text-lg">
                {s.aboutShort}
              </p>
            )}
            {stats.length > 0 && (
              <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((x, i) => (
                  <li key={x.label} data-reveal="zoom" style={gridRevealDelay(i, 4, 100, 250)}>
                    <div className="group h-full rounded-2xl border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-brand-dark/10">
                      <span className="mx-auto flex size-10 items-center justify-center rounded-xl bg-brand-light text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                        <x.Icon className="size-5" />
                      </span>
                      <p className="mt-3 text-2xl font-extrabold tabular-nums text-brand-dark md:text-3xl">
                        <CountUp to={x.value} delay={300 + i * 100} />+
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{x.label}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div aria-hidden="true" data-reveal="fade" className={`absolute -right-3 -top-7 h-28 w-40 opacity-35 md:-right-8 ${DOTS}`} />
            <div
              aria-hidden="true"
              data-reveal="fade"
              style={revealDelay(600)}
              className="absolute inset-0 hidden translate-x-5 translate-y-5 rounded-3xl border-2 border-primary/25 sm:block"
            />
            <div data-reveal="curtain" className="relative">
              <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-brand-dark/20">
                <div data-curtain-zoom className="absolute inset-0">
                  <Image
                    src="/images/about-showroom.jpg"
                    alt={`Showroom ${shortName}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                </div>
                <span aria-hidden="true" className="curtain-panel absolute inset-y-0 left-0 w-1/2 origin-left" />
                <span aria-hidden="true" className="curtain-panel absolute inset-y-0 right-0 w-1/2 origin-right" />
              </div>
            </div>
            {s.foundedYear ? (
              <div data-reveal="zoom" style={revealDelay(900)} className="absolute -bottom-6 left-4 md:left-8">
                <div className="animate-float motion-reduce:animate-none">
                  <div className="flex items-center gap-3 rounded-2xl bg-cta px-4 py-3 text-cta-foreground shadow-xl shadow-cta/30 ring-4 ring-background">
                    <CalendarDays className="size-7 shrink-0" strokeWidth={1.75} />
                    <div>
                      <p className="text-xs font-semibold">Thành lập từ</p>
                      <p className="text-2xl font-extrabold leading-none tabular-nums">{s.foundedYear}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </RevealSection>

      {/* Tầm nhìn – Sứ mệnh: trượt vào từ hai bên */}
      {(s.vision || s.mission) && (
        <RevealSection className="relative overflow-hidden bg-brand-light py-16 md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 size-96 animate-glow rounded-full bg-white/70 blur-3xl motion-reduce:animate-none" />
          <div className="container-page relative">
            <SectionHeading label="Định hướng" title="Tầm nhìn & Sứ mệnh" />
            <div className="grid gap-6 md:grid-cols-2">
              {s.vision && (
                <div data-reveal="left" style={revealDelay(150)}>
                  <DirectionCard title="Tầm nhìn" text={s.vision} Icon={Eye} tone="primary" />
                </div>
              )}
              {s.mission && (
                <div data-reveal="right" style={revealDelay(250)}>
                  <DirectionCard title="Sứ mệnh" text={s.mission} Icon={Target} tone="cta" />
                </div>
              )}
            </div>
          </div>
        </RevealSection>
      )}

      {/* Nội dung chi tiết + cam kết bảo hành */}
      <RevealSection className="bg-background py-16 md:py-24">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div data-reveal className="lg:col-span-2">
            {s.aboutContent ? <RichContent html={s.aboutContent} className="prose-lg prose-h2:text-brand-dark" /> : <p className="text-muted-foreground">Nội dung giới thiệu đang được cập nhật.</p>}
          </div>
          <aside data-reveal="right" style={revealDelay(150)} className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-brand-light via-brand-light to-background p-6 shadow-sm">
              <div aria-hidden="true" className={`absolute -right-4 -top-4 h-24 w-28 opacity-25 ${DOTS}`} />
              <span className="relative flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <span aria-hidden="true" className="absolute inset-0 animate-soft-ping rounded-full bg-primary/40 motion-reduce:hidden" />
                <ShieldCheck className="relative size-6" />
              </span>
              <h3 className="relative mt-4 text-lg font-bold text-brand-dark">Cam kết bảo hành</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.warrantyText || "Bảo hành phụ kiện, thanh ray đến 24 tháng; bảo trì – chỉnh sửa trọn đời sản phẩm."}
              </p>
              {facts.length > 0 && (
                <ul className="relative mt-5 space-y-3 border-t border-primary/10 pt-5 text-sm">
                  {facts.map((f) => (
                    <li key={f.label} className="flex items-start gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                        <f.Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block text-xs text-muted-foreground">{f.label}</span>
                        <span className="font-semibold text-foreground">{f.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </RevealSection>

      {/* Showroom & xưởng: hai ảnh trượt vào và bay nhẹ, các ý chính hiện lần lượt */}
      <RevealSection className="relative overflow-hidden bg-muted py-16 md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative grid grid-cols-2 gap-4">
            <div aria-hidden="true" className="absolute -bottom-8 -left-8 size-48 animate-glow rounded-full bg-cta/20 blur-3xl motion-reduce:animate-none" />
            <div data-reveal="left" className="relative">
              <div className="animate-float [animation-delay:-3s] motion-reduce:animate-none">
                <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl">
                  <Image
                    src="/images/service-tu-van.jpg"
                    alt="Tư vấn mẫu vải tại showroom"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
            <div data-reveal="left" style={revealDelay(150)} className="relative mt-10">
              <div className="animate-float motion-reduce:animate-none">
                <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl">
                  <Image
                    src="/images/about-lap-dat.jpg"
                    alt="Kỹ thuật viên lắp đặt rèm"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
              </div>
            </div>
          </div>
          <div>
            <SectionHeading
              align="left"
              label="Showroom & xưởng may"
              title="Xem mẫu thật, giá tận xưởng"
              description="Khách hàng có thể đến showroom trải nghiệm trực tiếp hoặc để nhân viên mang bộ mẫu vải đến tận nhà – mọi sản phẩm đều được may tại xưởng riêng."
              className="mb-6"
            />
            <ul className="space-y-2">
              {SHOWROOM_POINTS.map((t, i) => (
                <li key={t} data-reveal style={revealDelay(250 + i * 100)}>
                  <div className="group -mx-3 flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-background hover:shadow-sm">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Check className="size-4" strokeWidth={3} />
                    </span>
                    <span>{t}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </RevealSection>

      <ProcessSteps />

      {/* Hình ảnh */}
      <RevealSection className="bg-brand-light py-16 md:py-24">
        <div className="container-page">
          <SectionHeading label="Hình ảnh" title="Showroom, xưởng & công trình" />
          <Gallery images={GALLERY} />
        </div>
      </RevealSection>

      <CtaSection hotline={s.hotline} />
    </>
  );
}
