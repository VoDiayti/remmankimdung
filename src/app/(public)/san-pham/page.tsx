import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getSettings } from "@/lib/queries/settings";
import { getProductCategoryLinks } from "@/lib/queries/product-categories";
import { getActiveLineLinks } from "@/lib/queries/product-lines";
import { searchProducts } from "@/lib/queries/products";
import { paramPage, paramString, type SearchParams } from "@/lib/queries/params";
import { buildMetadata } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/public/page-hero";
import { ProductFilters } from "@/components/public/product-filters";
import { ProductCard } from "@/components/public/product-card";
import { PublicPagination } from "@/components/public/public-pagination";
import { PublicEmptyState } from "@/components/public/empty-state";
import { CtaSection } from "@/components/public/cta-section";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<SearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const hasFilter = ["danh-muc", "loai", "gia", "phong", "q", "page"].some((k) => paramString(sp[k]));
  return buildMetadata(s, {
    title: "Sản phẩm rèm cửa",
    description: "Tất cả mẫu rèm cửa đang bán: rèm vải, rèm cuốn, rèm cầu vồng, rèm roman, rèm sáo gỗ – nhôm, rèm văn phòng. Lọc theo danh mục, loại rèm, khoảng giá và không gian lắp đặt.",
    path: "/san-pham",
    // Trang có bộ lọc không cần index riêng từng tổ hợp
    noIndex: hasFilter,
  });
}

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = {
    category: paramString(sp["danh-muc"]),
    line: paramString(sp["loai"]),
    price: paramString(sp["gia"]),
    room: paramString(sp["phong"]),
    q: paramString(sp["q"]),
    page: paramPage(sp["page"]),
  };

  const [s, categories, lines, result] = await Promise.all([getSettings(), getProductCategoryLinks(), getActiveLineLinks(), searchProducts(filters)]);
  const activeCategory = categories.find((c) => c.slug === filters.category);
  const activeLine = lines.find((l) => l.slug === filters.line);

  return (
    <>
      <PageHero
        title={activeLine ? activeLine.name : activeCategory ? `Mẫu ${activeCategory.name.toLowerCase()}` : "Sản phẩm rèm cửa"}
        description="Hơn 500 mẫu vải, chất liệu có sẵn tại xưởng. Lọc theo danh mục, loại rèm, khoảng giá và không gian để tìm mẫu phù hợp – giá tham khảo theo m², báo giá chính thức sau khi đo đạc."
        crumbs={
          activeCategory
            ? [{ label: "Sản phẩm", href: "/san-pham" }, { label: activeCategory.name, href: activeLine ? `/san-pham?danh-muc=${activeCategory.slug}` : undefined }, ...(activeLine ? [{ label: activeLine.name }] : [])]
            : [{ label: "Sản phẩm" }]
        }
      />

      <section className="bg-muted py-10 md:py-14">
        <div className="container-page space-y-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl border bg-card" />}>
            <ProductFilters categories={categories} lines={lines} />
          </Suspense>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Tìm thấy <strong className="text-foreground">{result.total}</strong> sản phẩm
              {filters.q && (
                <>
                  {" "}
                  cho từ khóa “<strong className="text-foreground">{filters.q}</strong>”
                </>
              )}
              {result.totalPages > 1 && (
                <>
                  {" "}
                  – trang {result.page}/{result.totalPages}
                </>
              )}
            </p>
            {activeCategory && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/danh-muc/${activeCategory.slug}`}>Giới thiệu danh mục {activeCategory.name} →</Link>
              </Button>
            )}
          </div>

          {result.items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 3} />
              ))}
            </div>
          ) : (
            <PublicEmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Hãy thử bỏ một vài bộ lọc hoặc gửi yêu cầu để được tư vấn mẫu rèm theo nhu cầu của bạn."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild variant="outline" className="h-11">
                    <Link href="/san-pham">Xem tất cả sản phẩm</Link>
                  </Button>
                  <Button asChild className="h-11 bg-cta text-cta-foreground hover:bg-cta-hover">
                    <Link href="/bao-gia">Nhận báo giá</Link>
                  </Button>
                </div>
              }
            />
          )}

          <PublicPagination
            page={result.page}
            totalPages={result.totalPages}
            pathname="/san-pham"
            query={{ "danh-muc": filters.category, loai: filters.line, gia: filters.price, phong: filters.room, q: filters.q }}
          />
        </div>
      </section>

      <CtaSection hotline={s.hotline} title="Chưa tìm được mẫu rèm ưng ý?" description="Để lại thông tin, nhân viên sẽ mang bộ mẫu vải đầy đủ đến tận nhà cho bạn chọn – đo đạc, tư vấn miễn phí." />
    </>
  );
}
