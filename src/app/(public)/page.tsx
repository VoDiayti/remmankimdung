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

      {/* Điểm tin cậy */}
      <section className="relative z-10 -mt-10 md:-mt-12">
        <div className="container-page">
          <ul className="grid gap-4 rounded-2xl border bg-card p-4 shadow-lg sm:grid-cols-2 lg:grid-cols-4 md:p-6">
            {TRUST_POINTS.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-primary">
                  <p.Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold leading-snug">{p.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Bảng giá theo danh mục (tab) – bật/tắt & tiêu đề trong Admin → Cài đặt chung */}
      {s.priceTableEnabled && <PriceTableSection title={s.priceTableTitle || "Bảng giá rèm cửa tham khảo"} groups={priceTable} />}

      {/* Giới thiệu ngắn */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-xl">
              <Image src="/images/about-showroom.jpg" alt={`Showroom rèm cửa ${storeName}`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden w-56 overflow-hidden rounded-2xl border-4 border-background shadow-xl sm:block md:-right-6">
              <div className="relative aspect-[4/3]">
                <Image src="/images/about-lap-dat.jpg" alt="Kỹ thuật viên lắp đặt rèm cửa" fill sizes="224px" className="object-cover" />
              </div>
            </div>
            {s.statYears && (
              <div className="absolute -left-2 top-6 rounded-2xl bg-cta px-4 py-3 text-cta-foreground shadow-lg md:-left-6">
                <p className="text-3xl font-extrabold leading-none">{s.statYears}+</p>
                <p className="text-xs font-medium">năm kinh nghiệm</p>
              </div>
            )}
          </div>
          <div>
            <SectionHeading align="left" label="Về chúng tôi" title={s.companyName} className="mb-5" />
            {s.aboutShort && <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{s.aboutShort}</p>}
            {s.warrantyText && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/15 bg-brand-light p-4">
                <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold text-brand-dark">Cam kết bảo hành</p>
                  <p className="text-sm text-muted-foreground">{s.warrantyText}</p>
                </div>
              </div>
            )}
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {["Xưởng may riêng, giá tận gốc", "Hơn 500 mẫu vải – chất liệu có sẵn", "Thi công đúng hẹn, dọn dẹp sạch sẽ", "Bảo trì trọn đời sản phẩm"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm font-medium">
                  <CircleCheck className="size-5 shrink-0 text-emerald-600" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base">
                <Link href="/gioi-thieu">
                  Tìm hiểu thêm <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <a href={telHref(s.hotline)}>
                  <Phone className="size-5" /> {s.hotline}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Video giới thiệu (chỉ khi có link trong Cài đặt): vắt ngang ranh giới nền trắng và nền nhạt */}
      {videoId && (
        <div className="bg-[linear-gradient(to_bottom,var(--background)_50%,var(--brand-light)_50%)]">
          <div className="container-page">
            <YouTubeEmbed videoId={videoId} title={`Video giới thiệu ${s.companyName}`} className="mx-auto max-w-3xl border-4 border-background shadow-2xl" />
          </div>
        </div>
      )}

      {/* Danh mục rèm */}
      <section className="bg-brand-light py-14 md:py-20">
        <div className="container-page">
          <SectionHeading
            label="Danh mục"
            title="Danh mục rèm cửa"
            description="Rèm vải, rèm cuốn, rèm cầu vồng, rèm roman, rèm sáo gỗ – nhôm, rèm văn phòng… Mỗi danh mục đều có nhiều loại và mức giá để bạn lựa chọn."
          />
          {categories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {categories.map((c, i) => (
                <CategoryCard key={c.id} category={c} priority={i < 4} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Danh mục rèm đang được cập nhật" />
          )}
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="h-12 bg-background px-6 text-base">
              <Link href="/danh-muc">
                Xem tất cả danh mục <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
            <SectionHeading align="left" label="Sản phẩm" title="Mẫu rèm nổi bật" description="Những mẫu rèm được khách hàng chọn nhiều nhất – chất liệu đẹp, giá tốt, có sẵn vải." className="mb-0" />
            <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold md:justify-end">
              <Link href="/san-pham">
                Xem tất cả sản phẩm <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="Sản phẩm đang được cập nhật" description="Hãy để lại thông tin để được tư vấn mẫu rèm phù hợp." />
          )}
        </div>
      </section>

      {/* Dịch vụ */}
      {services.length > 0 && (
        <section className="bg-brand-light py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Dịch vụ" title="Dịch vụ trọn gói từ đo đạc đến bảo hành" className="mb-0" />
              <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold md:justify-end">
                <Link href="/dich-vu">
                  Xem tất cả dịch vụ <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {services.slice(0, 4).map((sv) => (
                <ServiceCard key={sv.id} service={sv} />
              ))}
            </div>
          </div>
        </section>
      )}

      <StatsSection statCustomers={s.statCustomers} statYears={s.statYears} statProjects={s.statProjects} statProducts={s.statProducts} />

      <ProcessSteps />

      <TestimonialsSection testimonials={testimonials} />

      {/* Tin tức */}
      {posts.length > 0 && (
        <section className="bg-background py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Tin tức" title="Kinh nghiệm chọn rèm & công trình mới" className="mb-0" />
              <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold md:justify-end">
                <Link href="/tin-tuc">
                  Xem tất cả tin tức <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Form báo giá nhanh */}
      <section id="bao-gia" className="relative overflow-hidden bg-brand-dark py-14 text-white md:py-20">
        <Image src="/images/cta-bg.jpg" alt="" fill sizes="100vw" className="object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/95 to-primary/70" />
        <div className="container-page relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-300">Nhận báo giá</p>
            <h2 className="mt-2 text-2xl font-bold md:text-4xl">Đo đạc tận nơi miễn phí – báo giá trong giờ làm việc</h2>
            <p className="mt-4 text-white/85 md:text-lg">
              Để lại số điện thoại, nhân viên sẽ gọi lại xác nhận lịch đo đạc, mang mẫu vải đến tận nhà và gửi báo giá chi tiết theo m². Hoàn toàn miễn phí, không ràng buộc.
            </p>
            <ul className="mt-6 space-y-3">
              {["Tư vấn kiểu rèm, chất liệu hợp nội thất và ngân sách", "Đo kích thước cửa chính xác, báo giá không phát sinh", "May tại xưởng, lắp đặt trong 3 – 5 ngày", s.warrantyText || "Bảo hành đến 24 tháng, bảo trì trọn đời"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <CircleCheck className="mt-0.5 size-5 shrink-0 text-amber-300" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <a href={telHref(s.hotline)} className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur hover:bg-white/15">
              <span className="flex size-11 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-white/70">Hoặc gọi ngay hotline</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
          </div>
          <div className="rounded-3xl bg-background p-6 text-foreground shadow-2xl sm:p-8">
            <LeadForm type="QUOTE" categories={categoryOptions} variant="compact" storeName={storeName} title="Nhận báo giá miễn phí" description="Điền thông tin, chúng tôi sẽ gọi lại trong giờ làm việc." />
          </div>
        </div>
      </section>

      <PartnersSection partners={partners} />
    </>
  );
}
