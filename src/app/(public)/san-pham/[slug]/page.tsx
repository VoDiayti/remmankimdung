import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarClock, CircleCheck, Eye, Layers, MapPin, Palette, Phone, Ruler, Send, ShieldCheck, Star } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { absoluteUrl, buildMetadata, plainText, productJsonLd } from "@/lib/seo";
import { ROOM_LABELS } from "@/lib/constants";
import { formatDate, formatNumber, formatPriceRange, parseStringList, telHref } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { JsonLd } from "@/components/public/json-ld";
import { Gallery } from "@/components/public/gallery";
import { ProductCard } from "@/components/public/product-card";
import { LeadForm } from "@/components/public/lead-form";
import { ProductQuoteBar } from "@/components/public/product-quote-bar";
import { ShareButtons } from "@/components/public/share-buttons";
import { SectionHeading } from "@/components/public/section-heading";

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

  return (
    <>
      <JsonLd data={productJsonLd(s, { ...product, gallery })} />

      <div className="border-b bg-muted/60">
        <div className="container-page py-4">
          <Breadcrumbs items={[{ label: "Danh mục rèm", href: "/danh-muc" }, { label: product.category.name, href: `/danh-muc/${product.category.slug}` }, { label: product.name }]} />
        </div>
      </div>

      <section className="bg-background py-8 md:py-12">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          {/* Nội dung chính */}
          <div className="space-y-8 lg:col-span-2">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <Badge asChild className="bg-brand-light text-primary hover:bg-primary hover:text-primary-foreground">
                  <Link href={`/danh-muc/${product.category.slug}`}>{product.category.name}</Link>
                </Badge>
                {product.line && (
                  <Badge asChild variant="outline">
                    <Link href={`/san-pham?danh-muc=${product.category.slug}&loai=${product.line.slug}`}>{product.line.name}</Link>
                  </Badge>
                )}
                {product.code && <Badge variant="outline" className="font-mono">{product.code}</Badge>}
                {product.isFeatured && (
                  <Badge className="gap-1 bg-cta text-cta-foreground">
                    <Star className="size-3 fill-current" /> Nổi bật
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold leading-tight text-brand-dark md:text-4xl">{product.name}</h1>
              {product.summary && <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{product.summary}</p>}
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-4" /> Cập nhật {formatDate(product.updatedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="size-4" /> {formatNumber(product.viewCount)} lượt xem
                </span>
              </p>
            </header>

            {images.length > 0 && <Gallery images={images} />}

            {/* Giá + thông số */}
            <div className="rounded-2xl border bg-card p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Giá tham khảo</p>
                  <p className="mt-1 text-3xl font-extrabold text-primary md:text-4xl">{price}</p>
                  {product.priceNote && <p className="mt-1 text-sm text-muted-foreground">{product.priceNote}</p>}
                </div>
                {(product.warrantyMonths || s.warrantyText) && (
                  <p className="inline-flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                    <span>{product.warrantyMonths ? `Bảo hành ${product.warrantyMonths} tháng` : s.warrantyText}</span>
                  </p>
                )}
              </div>

              {specs.length > 0 && (
                <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                  {specs.map((x) => (
                    <div key={x.label} className="flex gap-3 rounded-xl border bg-background p-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-primary">
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

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 flex-1 bg-cta text-base font-semibold text-cta-foreground hover:bg-cta-hover">
                  <a href="#bao-gia">
                    <Send className="size-5" /> Nhận báo giá mẫu này
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 flex-1 text-base">
                  <a href={telHref(s.hotline)}>
                    <Phone className="size-5" /> Gọi {s.hotline}
                  </a>
                </Button>
              </div>
            </div>

            {features.length > 0 && (
              <section className="rounded-2xl border border-primary/15 bg-brand-light p-6">
                <h2 className="text-xl font-bold text-brand-dark md:text-2xl">Đặc điểm nổi bật</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {product.description && (
              <section>
                <h2 className="mb-3 text-xl font-bold text-brand-dark md:text-2xl">Mô tả sản phẩm</h2>
                <RichContent html={product.description} />
              </section>
            )}

            <div className="border-t pt-6">
              <ShareButtons url={url} title={product.name} />
            </div>
          </div>

          {/* Cột phải */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div id="bao-gia" className="scroll-mt-28 rounded-2xl border-2 border-cta/30 bg-card p-6 shadow-lg">
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
            <a href={telHref(s.hotline)} className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-brand-dark">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-primary-foreground/80">Hotline tư vấn – báo giá</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
            <Link href={`/danh-muc/${product.category.slug}`} className="group relative block overflow-hidden rounded-2xl bg-brand-dark text-white">
              <div className="relative p-5">
                <p className="text-xs uppercase tracking-wider text-amber-300">Tìm hiểu danh mục</p>
                <p className="mt-1 text-xl font-bold">{product.category.name}</p>
                {product.category.summary && <p className="mt-2 line-clamp-2 text-sm text-white/85">{product.category.summary}</p>}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                  Xem các mẫu khác <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-muted py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Sản phẩm liên quan" title={`Mẫu ${product.category.name.toLowerCase()} khác`} className="mb-0" />
              <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold">
                <Link href={`/san-pham?danh-muc=${product.category.slug}`}>
                  Xem tất cả <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Chừa chỗ cho thanh báo giá cố định trên di động */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <ProductQuoteBar hotline={s.hotline} price={price} />
    </>
  );
}
