import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleCheck, Clock, Phone, Ruler, ShieldCheck, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getFeaturedProductCategories, getPriceTableGroups, getProductCategoryOptions } from "@/lib/queries/product-categories";
import { getFeaturedProducts } from "@/lib/queries/products";
import { getActiveServices } from "@/lib/queries/services";
import { getLatestPosts } from "@/lib/queries/posts";
import { getActiveBanners, getActivePartners, getActiveTestimonials } from "@/lib/queries/site-content";
import { buildMetadata } from "@/lib/seo";
import { telHref } from "@/lib/format";
import { gridRevealDelay, revealDelay } from "@/lib/reveal";
import { youtubeVideoId } from "@/components/shared/youtube";
import { Button } from "@/components/ui/button";
import { HeroSlider } from "@/components/public/hero-slider";
import { SectionHeading } from "@/components/public/section-heading";
import { PriceTableSection } from "@/components/public/price-table-section";
import { CategoryCard } from "@/components/public/category-card";
import { ProductCard } from "@/components/public/product-card";
import { ServiceCard } from "@/components/public/service-card";
import { PostCard } from "@/components/public/post-card";
import { StatsSection } from "@/components/public/stats-section";
import { ProcessSteps } from "@/components/public/process-steps";
import { TestimonialsSection } from "@/components/public/testimonials-section";
import { PartnersSection } from "@/components/public/partners-section";
import { LeadForm } from "@/components/public/lead-form";
import { PublicEmptyState } from "@/components/public/empty-state";
import { YouTubeEmbed } from "@/components/public/youtube-embed";
import { AboutSection } from "@/components/public/about-section";
import { RevealSection } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return buildMetadata(s, {
    title: s.metaTitle || `${s.shortName || s.companyName} – Rèm cửa đẹp, giá tận xưởng`,
    absoluteTitle: true,
    description: s.metaDescription,
    path: "/",
  });
}

const TRUST_POINTS = [
  { Icon: Ruler, title: "Đo đạc & tư vấn tận nơi miễn phí", text: "Mang mẫu vải đến tận nhà, đo kích thước chính xác, tư vấn kiểu rèm hợp nội thất." },
  { Icon: Wallet, title: "Giá tận xưởng, báo giá theo m² rõ ràng", text: "Xưởng may riêng, không qua trung gian; báo giá chi tiết, không phát sinh." },
  { Icon: Clock, title: "Lắp đặt trong 3 – 5 ngày", text: "May đúng kích thước thực tế, đội thi công lắp đặt gọn gàng, đúng hẹn." },
  { Icon: ShieldCheck, title: "Bảo hành đến 24 tháng, bảo trì trọn đời", text: "Bảo hành phụ kiện, thanh ray; hỗ trợ chỉnh sửa, bảo trì suốt thời gian sử dụng." },
];

/** Link "Xem tất cả …" cạnh tiêu đề section: mũi tên trượt khi rê chuột */
function SeeAllLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="link" data-reveal style={revealDelay(200)} className="group h-auto justify-start px-0 text-base font-semibold md:justify-end">
      <Link href={href}>
        {children} <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </Button>
  );
}

export default async function HomePage() {
  const [s, banners, categories, products, services, posts, testimonials, partners, categoryOptions, priceTable] = await Promise.all([
    getSettings(),
    getActiveBanners(),
    getFeaturedProductCategories(8),
    getFeaturedProducts(6),
    getActiveServices(),
    getLatestPosts(4),
    getActiveTestimonials(6),
    getActivePartners(),
    getProductCategoryOptions(),
    getPriceTableGroups(),
  ]);
  const videoId = youtubeVideoId(s.introVideoUrl);
  const storeName = s.shortName || s.companyName;

  const heroBanners =
    banners.length > 0
      ? banners
      : [
          {
            id: "default",
            title: s.slogan || s.companyName,
            subtitle: s.aboutShort,
            image: "/images/hero-1.jpg",
            ctaText: "Nhận báo giá",
            ctaLink: "/bao-gia",
            ctaText2: "Xem mẫu rèm",
            ctaLink2: "/san-pham",
          },
        ];

  return (
    <>
      <HeroSlider banners={heroBanners} hotline={s.hotline} />

      {/* Điểm tin cậy: lần lượt hiện lên khi tải trang, từng ô nổi lên khi rê chuột */}
      <section className="relative z-10 -mt-10 md:-mt-12">
        <div className="container-page">
          <ul className="grid gap-1 rounded-2xl border border-border/60 bg-card/95 p-2 shadow-xl shadow-brand-dark/10 backdrop-blur sm:grid-cols-2 md:p-3 lg:grid-cols-4 lg:divide-x lg:divide-border/60">
            {TRUST_POINTS.map((p, i) => (
              <li key={p.title} className="animate-fade-up motion-reduce:animate-none lg:px-1.5" style={{ animationDelay: `${300 + i * 120}ms` }}>
                <div className="group flex h-full gap-3.5 rounded-xl p-3 transition-all duration-300 hover:-translate-y-1 hover:bg-brand-light/70 md:p-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
                    <p.Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold leading-snug text-brand-dark transition-colors duration-300 group-hover:text-primary">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bảng giá theo danh mục (tab) – bật/tắt & tiêu đề trong Admin → Cài đặt chung */}
      {s.priceTableEnabled && <PriceTableSection title={s.priceTableTitle || "Bảng giá rèm cửa tham khảo"} groups={priceTable} />}

      {/* Giới thiệu ngắn */}
      <AboutSection
        companyName={s.companyName}
        aboutShort={s.aboutShort}
        warrantyText={s.warrantyText}
        statYears={s.statYears}
        statCustomers={s.statCustomers}
        hotline={s.hotline}
        storeName={storeName}
      />

      {/* Video giới thiệu (chỉ khi có link trong Cài đặt): vắt ngang ranh giới nền trắng và nền nhạt */}
      {videoId && (
        <RevealSection className="bg-[linear-gradient(to_bottom,var(--background)_50%,var(--brand-light)_50%)]">
          <div className="container-page">
            <div data-reveal="zoom">
              <YouTubeEmbed videoId={videoId} title={`Video giới thiệu ${s.companyName}`} className="mx-auto max-w-3xl border-4 border-background shadow-2xl" />
            </div>
          </div>
        </RevealSection>
      )}

      {/* Danh mục rèm */}
      <RevealSection className="relative overflow-hidden bg-brand-light py-16 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-white/70 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-6 right-0 h-48 w-56 bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-20" />
        <div className="container-page relative">
          <SectionHeading
            label="Danh mục"
            title="Danh mục rèm cửa"
            description="Rèm vải, rèm cuốn, rèm cầu vồng, rèm roman, rèm sáo gỗ – nhôm, rèm văn phòng… Mỗi danh mục đều có nhiều loại và mức giá để bạn lựa chọn."
          />
          {categories.length > 0 ? (
            // flex-wrap + justify-center: hàng cuối thiếu thẻ vẫn được căn giữa
            <div className="flex flex-wrap justify-center gap-6">
              {categories.map((c, i) => (
                <div
                  key={c.id}
                  data-reveal
                  style={gridRevealDelay(i)}
                  className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]"
                >
                  <CategoryCard category={c} priority={i < 4} className="h-full" />
                </div>
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Danh mục rèm đang được cập nhật" />
          )}
          <div data-reveal className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="group h-12 bg-background px-6 text-base hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
              <Link href="/danh-muc">
                Xem tất cả danh mục <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </RevealSection>

      {/* Sản phẩm nổi bật */}
      <RevealSection className="bg-background py-16 md:py-24">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <SectionHeading align="left" label="Sản phẩm" title="Mẫu rèm nổi bật" description="Những mẫu rèm được khách hàng chọn nhiều nhất – chất liệu đẹp, giá tốt, có sẵn vải." className="mb-0" />
            <SeeAllLink href="/san-pham">Xem tất cả sản phẩm</SeeAllLink>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <div key={p.id} data-reveal style={gridRevealDelay(i, 3, 120)}>
                  <ProductCard product={p} className="h-full" />
                </div>
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Sản phẩm đang được cập nhật" description="Hãy để lại thông tin để được tư vấn mẫu rèm phù hợp." />
          )}
        </div>
      </RevealSection>

      {/* Dịch vụ */}
      {services.length > 0 && (
        <RevealSection className="relative overflow-hidden bg-brand-light py-16 md:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/70 blur-3xl" />
          <div className="container-page relative">
            <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Dịch vụ" title="Dịch vụ trọn gói từ đo đạc đến bảo hành" className="mb-0" />
              <SeeAllLink href="/dich-vu">Xem tất cả dịch vụ</SeeAllLink>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 4).map((sv, i) => (
                <div key={sv.id} data-reveal style={gridRevealDelay(i)}>
                  <ServiceCard service={sv} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      <StatsSection statCustomers={s.statCustomers} statYears={s.statYears} statProjects={s.statProjects} statProducts={s.statProducts} />

      <ProcessSteps />

      <TestimonialsSection testimonials={testimonials} />

      {/* Tin tức */}
      {posts.length > 0 && (
        <RevealSection className="bg-background py-16 md:py-24">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Tin tức" title="Kinh nghiệm chọn rèm & công trình mới" className="mb-0" />
              <SeeAllLink href="/tin-tuc">Xem tất cả tin tức</SeeAllLink>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((p, i) => (
                <div key={p.id} data-reveal style={gridRevealDelay(i)}>
                  <PostCard post={p} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* Form báo giá nhanh */}
      {/* Cột trái trượt vào từ trái, form trượt vào từ phải; form có viền sáng phập phồng */}
      <RevealSection id="bao-gia" className="relative overflow-hidden bg-brand-dark py-16 text-white md:py-24">
        <Image src="/images/cta-bg.jpg" alt="" fill sizes="100vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-primary/70" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-96 animate-glow rounded-full bg-cta/20 blur-3xl motion-reduce:animate-none" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 left-1/4 size-96 animate-glow rounded-full bg-primary/40 blur-3xl [animation-delay:-3.5s] motion-reduce:animate-none" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p data-reveal className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-amber-300">
              <span aria-hidden="true" data-reveal="grow" style={revealDelay(250)} className="h-0.5 w-8 origin-left rounded-full bg-amber-300" />
              Nhận báo giá
            </p>
            <h2 data-reveal style={revealDelay(80)} className="mt-3 text-balance text-2xl font-bold md:text-4xl">
              Đo đạc tận nơi miễn phí – báo giá trong giờ làm việc
            </h2>
            <p data-reveal style={revealDelay(160)} className="mt-4 text-white/85 md:text-lg">
              Để lại số điện thoại, nhân viên sẽ gọi lại xác nhận lịch đo đạc, mang mẫu vải đến tận nhà và gửi báo giá chi tiết theo m². Hoàn toàn miễn phí, không ràng buộc.
            </p>
            <ul className="mt-6 space-y-3">
              {["Tư vấn kiểu rèm, chất liệu hợp nội thất và ngân sách", "Đo kích thước cửa chính xác, báo giá không phát sinh", "May tại xưởng, lắp đặt trong 3 – 5 ngày", s.warrantyText || "Bảo hành đến 24 tháng, bảo trì trọn đời"].map((t, i) => (
                <li key={t} data-reveal="left" style={revealDelay(250 + i * 100)} className="flex items-start gap-2.5">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-amber-300" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <div data-reveal style={revealDelay(650)}>
              <a
                href={telHref(s.hotline)}
                className="group mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/50 hover:bg-white/15 hover:shadow-xl hover:shadow-black/20"
              >
                <span className="relative flex size-11 items-center justify-center rounded-full bg-cta text-cta-foreground">
                  <span aria-hidden="true" className="absolute inset-0 animate-soft-ping rounded-full bg-cta/60 motion-reduce:hidden" />
                  <Phone className="relative size-5 animate-ring motion-reduce:animate-none" />
                </span>
                <span>
                  <span className="block text-xs text-white/70">Hoặc gọi ngay hotline</span>
                  <span className="block text-xl font-bold transition-colors group-hover:text-amber-300">{s.hotline}</span>
                </span>
              </a>
            </div>
          </div>
          <div data-reveal="right" style={revealDelay(200)} className="relative">
            <div aria-hidden="true" className="absolute -inset-1.5 animate-pulse rounded-[1.9rem] bg-gradient-to-br from-cta via-amber-300/60 to-primary opacity-60 blur-lg [animation-duration:4s] motion-reduce:animate-none" />
            <div className="relative rounded-3xl bg-background p-6 text-foreground shadow-2xl sm:p-8">
              <LeadForm type="QUOTE" categories={categoryOptions} variant="compact" storeName={storeName} title="Nhận báo giá miễn phí" description="Điền thông tin, chúng tôi sẽ gọi lại trong giờ làm việc." />
            </div>
          </div>
        </div>
      </RevealSection>

      <PartnersSection partners={partners} />
    </>
  );
}
