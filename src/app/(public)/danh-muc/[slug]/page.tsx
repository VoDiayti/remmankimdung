import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CircleCheck, Phone, Tag } from "lucide-react";
import { getSettings } from "@/lib/queries/settings";
import { getActiveProductCategories, getProductCategoryBySlug, getProductCategoryOptions } from "@/lib/queries/product-categories";
import { getProductsByCategory } from "@/lib/queries/products";
import { buildMetadata } from "@/lib/seo";
import { parseStringList, telHref } from "@/lib/format";
import { RichContent } from "@/components/shared/rich-content";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { ProductCard } from "@/components/public/product-card";
import { CategoryCard } from "@/components/public/category-card";
import { LeadForm } from "@/components/public/lead-form";
import { SectionHeading } from "@/components/public/section-heading";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [s, category] = await Promise.all([getSettings(), getProductCategoryBySlug(slug)]);
  if (!category) return { title: "Không tìm thấy danh mục" };
  return buildMetadata(s, {
    title: category.metaTitle || `${category.name} – mẫu & bảng giá`,
    absoluteTitle: Boolean(category.metaTitle),
    description: category.metaDescription || category.summary,
    path: `/danh-muc/${category.slug}`,
    image: category.image,
  });
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const [s, category] = await Promise.all([getSettings(), getProductCategoryBySlug(slug)]);
  if (!category) notFound();
  const [products, allCategories, categoryOptions] = await Promise.all([getProductsByCategory(category.id), getActiveProductCategories(), getProductCategoryOptions()]);

  const highlights = parseStringList(category.highlights);
  const storeName = s.shortName || s.companyName;

  // Nhóm sản phẩm theo loại rèm; sản phẩm chưa phân loại vào "Sản phẩm khác"
  const groups = category.lines
    .map((line) => ({ id: line.id, slug: line.slug, name: line.name, description: line.description, items: products.filter((p) => p.lineId === line.id) }))
    .filter((g) => g.items.length > 0);
  const lineIds = new Set(category.lines.map((l) => l.id));
  const others = products.filter((p) => !p.lineId || !lineIds.has(p.lineId));
  if (others.length > 0) groups.push({ id: "khac", slug: "san-pham-khac", name: groups.length > 0 ? "Sản phẩm khác" : `Mẫu ${category.name.toLowerCase()}`, description: null, items: others });

  const related = allCategories.filter((c) => c.id !== category.id).slice(0, 4);

  return (
    <>
      <PageHero
        title={category.name}
        description={category.summary}
        crumbs={[{ label: "Danh mục rèm", href: "/danh-muc" }, { label: category.name }]}
        image={category.image}
        size="large"
      >
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {category.priceNote && (
            <span className="inline-flex items-center gap-2 rounded-full bg-cta px-4 py-2 text-sm font-bold text-cta-foreground">
              <Tag className="size-4" /> {category.priceNote}
            </span>
          )}
          <Button asChild size="lg" className="h-12 border border-white/60 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur hover:bg-white hover:text-brand-dark">
            <a href="#bao-gia">
              Nhận báo giá {category.name.toLowerCase()} <ArrowRight className="size-5" />
            </a>
          </Button>
        </div>
        {groups.length > 1 && (
          <nav aria-label="Loại rèm" className="mt-6 flex flex-wrap gap-2">
            {groups.map((g) => (
              <Link key={g.id} href={`#${g.slug}`} className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition-colors hover:bg-white hover:text-brand-dark">
                {g.name} <span className="rounded-full bg-white/20 px-1.5 text-xs font-bold tabular-nums">{g.items.length}</span>
              </Link>
            ))}
          </nav>
        )}
      </PageHero>

      {/* Ưu điểm + mô tả */}
      <section className="bg-background py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            {highlights.length > 0 && (
              <div className="rounded-2xl border border-primary/15 bg-brand-light p-6 md:p-8">
                <h2 className="text-xl font-bold text-brand-dark md:text-2xl">Vì sao chọn {category.name.toLowerCase()}?</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5">
                      <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                      <span className="font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {category.description ? (
              <RichContent html={category.description} className="prose-lg prose-h2:text-brand-dark" />
            ) : (
              !highlights.length && <p className="text-muted-foreground">Nội dung danh mục đang được cập nhật.</p>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div id="bao-gia" className="scroll-mt-28 rounded-2xl border bg-card p-6 shadow-sm">
              <LeadForm
                type="QUOTE"
                categories={categoryOptions}
                defaultCategoryId={category.id}
                storeName={storeName}
                title={`Báo giá ${category.name.toLowerCase()}`}
                description="Để lại thông tin, nhân viên sẽ gọi lại và hẹn lịch đo đạc tận nơi miễn phí."
              />
            </div>
            <a href={telHref(s.hotline)} className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-primary-foreground transition-colors hover:bg-brand-dark">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cta text-cta-foreground">
                <Phone className="size-5" />
              </span>
              <span>
                <span className="block text-xs text-primary-foreground/80">Gọi hotline tư vấn – báo giá</span>
                <span className="block text-xl font-bold">{s.hotline}</span>
              </span>
            </a>
          </aside>
        </div>
      </section>

      {/* Sản phẩm theo loại rèm */}
      {groups.length > 0 ? (
        groups.map((g, i) => (
          <section key={g.id} id={g.slug} className={`scroll-mt-24 py-14 md:py-20 ${i % 2 === 0 ? "bg-brand-light" : "bg-background"}`}>
            <div className="container-page">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <SectionHeading align="left" label={category.name} title={g.name} description={g.description ?? undefined} className="mb-0" />
                {g.id !== "khac" && (
                  <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold">
                    <Link href={`/san-pham?danh-muc=${category.slug}&loai=${g.slug}`}>
                      Lọc {g.name.toLowerCase()} <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        ))
      ) : (
        <section className="bg-brand-light py-14 md:py-20">
          <div className="container-page">
            <div className="rounded-2xl border border-dashed bg-background p-10 text-center">
              <p className="text-lg font-semibold">Mẫu {category.name.toLowerCase()} đang được cập nhật</p>
              <p className="mt-1 text-muted-foreground">Liên hệ để xem mẫu vải trực tiếp tại showroom hoặc nhận tư vấn tận nơi.</p>
              <Button asChild className="mt-5 h-11 bg-cta text-cta-foreground hover:bg-cta-hover">
                <a href="#bao-gia">Nhận tư vấn – báo giá</a>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Danh mục liên quan */}
      {related.length > 0 && (
        <section className="bg-background py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionHeading align="left" label="Danh mục khác" title="Có thể bạn quan tâm" className="mb-0" />
              <Button asChild variant="link" className="h-auto justify-start px-0 text-base font-semibold">
                <Link href="/danh-muc">
                  Tất cả danh mục <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection hotline={s.hotline} />
    </>
  );
}
