import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarClock, Check, CircleCheck, Clock, Eye, Layers, MapPin, Palette, Phone, Ruler, Send, ShieldCheck, Sparkles, Star, Wallet } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { absoluteUrl, buildMetadata, plainText, productJsonLd } from "@/lib/seo";
import { ROOM_LABELS } from "@/lib/constants";
import { formatDate, formatNumber, formatPriceRange, parseStringList, telHref } from "@/lib/format";
import { gridRevealDelay, revealDelay } from "@/lib/reveal";
import { cn } from "@/lib/utils";
import { RichContent } from "@/components/shared/rich-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { ProductGallery } from "@/components/public/product-gallery";
import { ProductCard } from "@/components/public/product-card";
import { LeadForm } from "@/components/public/lead-form";
import { ProductQuoteBar } from "@/components/public/product-quote-bar";
import { ShareButtons } from "@/components/public/share-buttons";
import { SectionHeading } from "@/components/public/section-heading";
import { RevealSection } from "@/components/public/reveal";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, product] = await Promise.all([getSettings(), getProductBySlug(slug)]);
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  return buildMetadata(s, {
    title: product.metaTitle || product.name,
    absoluteTitle: Boolean(product.metaTitle),
    description: product.metaDescription || product.summary || plainText(product.description, 300) || `${product.name} – ${product.category.name}. ${formatPriceRange(product.priceFrom, product.priceTo, product.priceUnit)}`,
    path: `/san-pham/${product.slug}`,
    image: product.image || product.category.image,
  });
}

/** Hiện lên lần lượt lúc tải trang (CSS) cho phần đầu trang – đã nằm trong màn hình nên không chờ cuộn */
const enter = (ms: number, className?: string) => ({
  className: cn("animate-fade-up motion-reduce:animate-none", className),
  style: { animationDelay: `${ms}ms` },
});

/** Tiêu đề khối nội dung: vạch vàng + chữ */
function BlockTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold text-brand-dark md:text-2xl">
      <span aria-hidden="true" className="h-6 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-cta to-amber-300" />
      {children}
    </h2>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, product] = await Promise.all([getSettings(), getProductBySlug(slug)]);
  if (!product) notFound();
  const related = await getRelatedProducts(product.categoryId, product.id, 3);

  const gallery = parseStringList(product.gallery);
  const features = parseStringList(product.features);
  const rooms = parseStringList(product.rooms).map((r) => ROOM_LABELS[r] ?? r);
  const price = formatPriceRange(product.priceFrom, product.priceTo, product.priceUnit);
  const url = absoluteUrl(`/san-pham/${product.slug}`);
  const storeName = s.shortName || s.companyName;
  const images = [product.image, ...gallery].filter((v): v is string => Boolean(v)).map((src, i) => ({ src, alt: i === 0 ? product.name : `${product.name} – ảnh ${i + 1}` }));

  const specs = [
    { Icon: Layers, label: "Chất liệu", value: product.material },
    { Icon: MapPin, label: "Xuất xứ", value: product.origin },
    { Icon: Ruler, label: "Khổ – kích thước", value: product.width },
    { Icon: Palette, label: "Màu sắc", value: product.colors },
    { Icon: CircleCheck, label: "Không gian phù hợp", value: rooms.length ? rooms.join(", ") : null },
    { Icon: ShieldCheck, label: "Bảo hành", value: product.warrantyMonths ? `${product.warrantyMonths} tháng` : null },
  ].filter((x) => x.value);

  // Cam kết chung khi đặt rèm (giống dải cam kết ở trang chủ)
  const commitments = [
    { Icon: Ruler, text: "Đo đạc & tư vấn tận nơi miễn phí" },
    { Icon: Wallet, text: "Giá tận xưởng, báo giá theo m²" },
    { Icon: Clock, text: "May & lắp đặt trong 3 – 5 ngày" },
    { Icon: ShieldCheck, text: product.warrantyMonths ? `Bảo hành ${product.warrantyMonths} tháng, bảo trì trọn đời` : "Bảo hành dài hạn, bảo trì trọn đời" },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(s, { ...product, gallery })} />

      <div className="border-b bg-gradient-to-r from-brand-light/70 via-muted/50 to-background">
        <div {...enter(0, "container-page py-4")}>
          <Breadcrumbs items={[{ label: "Danh mục rèm", href: "/danh-muc" }, { label: product.category.name, href: `/danh-muc/${product.category.slug}` }, { label: product.name }]} />
        </div>
      </div>

      {/* overflow-x-clip (không dùng overflow-hidden): cắt quầng màu tràn ngang mà vẫn giữ cột phải dính khi cuộn (sticky) */}
      <RevealSection className="relative overflow-x-clip bg-background py-8 md:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 top-0 size-[28rem] rounded-full bg-brand-light/70 blur-3xl" />
        <div className="container-page relative grid gap-10 lg:grid-cols-3">
          {/* Nội dung chính */}
          <div className="space-y-8 lg:col-span-2">
            <header>
              <div {...enter(80, "flex flex-wrap items-center gap-2")}>
                <Badge asChild className="bg-brand-light text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                  <Link href={`/danh-muc/${product.category.slug}`}>{product.category.name}</Link>
                </Badge>
                {product.line && (
                  <Badge asChild variant="outline" className="transition-colors hover:border-primary hover:text-primary">
                    <Link href={`/san-pham?danh-muc=${product.category.slug}&loai=${product.line.slug}`}>{product.line.name}</Link>
                  </Badge>
                )}
                {product.code && (
                  <Badge variant="outline" className="font-mono">
                    {product.code}
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="gap-1 bg-cta text-cta-foreground shadow-sm shadow-cta/30">
                    <Star className="size-3 fill-current" /> Nổi bật
                  </Badge>
                )}
              </div>
              <h1 {...enter(160, "mt-3 text-balance text-2xl font-bold leading-tight text-brand-dark md:text-4xl")}>
                {product.name}
              </h1>
              <span aria-hidden="true" className="mt-4 block h-1.5 w-20 origin-left animate-grow-x rounded-full bg-gradient-to-r from-cta to-amber-300 [animation-delay:450ms] motion-reduce:animate-none" />
              {product.summary && (
                <p {...enter(240, "mt-4 text-base leading-relaxed text-muted-foreground md:text-lg")}>
                  {product.summary}
                </p>
              )}
              <p {...enter(300, "mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground")}>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-4" /> Cập nhật {formatDate(product.updatedAt)}
                </span>
                {product.viewCount > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="size-4" /> {formatNumber(product.viewCount)} lượt xem
                  </span>
                )}
              </p>
            </header>

            {images.length > 0 && (
              <div {...enter(350)}>
                <ProductGallery images={images} />
              </div>
            )}

            {/* Giá + thông số */}
            <div {...enter(450, "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-lg shadow-brand-dark/5 md:p-6")}>
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cta via-amber-300 to-primary" />
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-light blur-2xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="size-3.5 text-cta" /> Giá tham khảo
                  </p>
                  <p className="mt-1 bg-gradient-to-r from-primary to-brand-dark bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">{price}</p>
                  {product.priceNote && <p className="mt-1 text-sm text-muted-foreground">{product.priceNote}</p>}
                </div>
                {(product.warrantyMonths || s.warrantyText) && (
                  <p className="inline-flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <span>{product.warrantyMonths ? `Bảo hành ${product.warrantyMonths} tháng` : s.warrantyText}</span>
                  </p>
                )}
              </div>

              {specs.length > 0 && (
                <dl className="relative mt-5 grid gap-3 sm:grid-cols-2">
                  {specs.map((x) => (
                    <div
                      key={x.label}
                      className="group flex gap-3 rounded-xl border bg-background p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-primary transition-all duration-300 group-hover:-rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                        <x.Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{x.label}</dt>
                        <dd className="mt-0.5 text-sm font-semibold leading-snug">{x.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              )}

              <div className="relative mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group relative h-12 flex-1 overflow-hidden bg-cta text-base font-semibold text-cta-foreground shadow-lg shadow-cta/30 hover:-translate-y-0.5 hover:bg-cta-hover hover:shadow-xl"
                >
                  <a href="#bao-gia">
                    <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
                    <Send className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> Nhận báo giá mẫu này
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 flex-1 text-base hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary">
                  <a href={telHref(s.hotline)}>
                    <Phone className="size-5 animate-ring text-primary motion-reduce:animate-none" /> Gọi {s.hotline}
                  </a>
                </Button>
              </div>
            </div>

            {/* Cam kết khi đặt rèm */}
            <ul className="grid gap-3 sm:grid-cols-2">
              {commitments.map((c, i) => (
                <li key={c.text} data-reveal style={gridRevealDelay(i, 4, 80)}>
                  <div className="group flex h-full items-center gap-3 rounded-xl border border-primary/10 bg-brand-light/50 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-brand-light hover:shadow-md">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm transition-all duration-300 group-hover:rotate-6 group-hover:bg-primary group-hover:text-primary-foreground">
                      <c.Icon className="size-4" />
                    </span>
                    {c.text}
                  </div>
                </li>
              ))}
            </ul>

            {features.length > 0 && (
              <section data-reveal className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-brand-light via-brand-light to-background p-6">
                <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-6 h-28 w-32 bg-[radial-gradient(var(--color-primary)_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-20" />
                <BlockTitle>Đặc điểm nổi bật</BlockTitle>
                <ul className="relative mt-5 grid gap-3 sm:grid-cols-2">
                  {features.map((f, i) => (
                    <li key={f} data-reveal style={revealDelay(150 + i * 80)}>
                      <div className="group flex h-full items-start gap-3 rounded-xl bg-background/80 px-3.5 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                          <Check className="size-4" strokeWidth={3} />
                        </span>
                        <span className="font-medium">{f}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {product.description && (
              <section data-reveal>
                <BlockTitle>Mô tả sản phẩm</BlockTitle>
                <RichContent html={product.description} className="mt-4" />
              </section>
            )}

            <div data-reveal className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
              <p className="text-sm font-semibold text-brand-dark">Chia sẻ mẫu rèm này</p>
              <ShareButtons url={url} title={product.name} />
            </div>
          </div>

          {/* Cột phải: form báo giá (viền sáng phập phồng), hotline, danh mục */}
          <aside {...enter(400, "space-y-6 lg:sticky lg:top-24 lg:self-start")}>
            <div id="bao-gia" className="relative scroll-mt-28">
              <div aria-hidden="true" className="absolute -inset-1 animate-pulse rounded-[1.4rem] bg-gradient-to-br from-cta/70 via-amber-200/50 to-primary/60 opacity-50 blur-lg [animation-duration:4s] motion-reduce:animate-none" />
              <div className="relative rounded-2xl border-2 border-cta/30 bg-card p-6 shadow-xl">
                <LeadForm
                  type="QUOTE"
                  productId={product.id}
                  productName={product.name}
                  defaultCategoryId={product.categoryId}
                  storeName={storeName}
                  title="Nhận báo giá mẫu này"
                  description="Gửi kích thước cửa (nếu có), nhân viên sẽ báo giá sơ bộ và hẹn lịch đo đạc tận nơi miễn phí."
                  submitLabel="Gửi yêu cầu báo giá"
                />
              </div>
            </div>
            <a
              href={telHref(s.hotline)}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-primary to-brand-dark p-5 text-primary-foreground shadow-lg shadow-brand-dark/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <span aria-hidden="true" className="absolute inset-0 animate-soft-ping rounded-full bg-cta/60 motion-reduce:hidden" />
                <Phone className="relative size-5 animate-ring motion-reduce:animate-none" />
              </span>
              <span>
                <span className="block text-xs text-primary-foreground/80">Hotline tư vấn – báo giá</span>
                <span className="block text-xl font-bold transition-colors group-hover:text-amber-300">{s.hotline}</span>
              </span>
            </a>
            <Link href={`/danh-muc/${product.category.slug}`} className="group relative block overflow-hidden rounded-2xl bg-brand-dark text-white shadow-lg">
              {product.category.image && (
                <Image
                  src={product.category.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover opacity-40 transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/80 to-brand-dark/40" />
              <div className="relative p-5">
                <p className="text-xs uppercase tracking-wider text-amber-300">Tìm hiểu danh mục</p>
                <p className="mt-1 text-xl font-bold">{product.category.name}</p>
                {product.category.summary && <p className="mt-2 line-clamp-2 text-sm text-white/85">{product.category.summary}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                  Xem các mẫu khác <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </aside>
        </div>
      </RevealSection>

      {related.length > 0 && (
        <RevealSection className="relative overflow-hidden bg-muted py-14 md:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-brand-light blur-3xl" />
          <div className="container-page relative">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Sản phẩm liên quan" title={`Mẫu ${product.category.name.toLowerCase()} khác`} className="mb-0" />
              <Button asChild variant="link" data-reveal style={revealDelay(200)} className="group h-auto justify-start px-0 text-base font-semibold">
                <Link href={`/san-pham?danh-muc=${product.category.slug}`}>
                  Xem tất cả <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <div key={p.id} data-reveal style={gridRevealDelay(i, 3, 120)}>
                  <ProductCard product={p} className="h-full" />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* Chừa chỗ cho thanh báo giá cố định trên di động */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <ProductQuoteBar hotline={s.hotline} price={price} />
    </>
  );
}
