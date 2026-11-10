import Link from "next/link";
import { ChevronRight, Folder, Layers, Phone, Search, Send, Star } from "lucide-react";
import type { PostCardData } from "@/lib/queries/posts";
import type { ProductCardData } from "@/lib/queries/products";
import { formatPriceRange } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/public/post-card";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Category = { id: string; name: string; slug: string; postCount: number };

const WIDGET_TITLE = "mb-3 inline-flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider text-brand-dark";
const WIDGET_ICON = "flex size-7 items-center justify-center rounded-lg bg-brand-light text-primary";
/** Mục chuyên mục: nền sáng + nhích sang phải khi rê chuột, mũi tên hiện ra */
const CATEGORY_LINK = "group -mx-2 flex items-center justify-between rounded-lg px-2 py-2.5 text-sm transition-all duration-300 hover:bg-brand-light/70 hover:text-primary";
const CHEVRON = "size-3.5 -ml-4 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100";

type NewsSidebarProps = {
  categories: Category[];
  featured: PostCardData[];
  /** Sản phẩm nổi bật (gợi ý mua) */
  products?: ProductCardData[];
  /** Danh mục rèm (liên kết nhanh) */
  productCategories?: { slug: string; name: string }[];
  activeCategorySlug?: string;
  query?: string;
  hotline: string;
  className?: string;
};

/** Sidebar tin tức: tìm kiếm, chuyên mục, bài nổi bật, sản phẩm nổi bật, danh mục rèm, hộp báo giá */
export function NewsSidebar({ categories, featured, products = [], productCategories = [], activeCategorySlug, query, hotline, className }: NewsSidebarProps) {
  return (
    <aside className={cn("space-y-6", className)}>
      <form action="/tin-tuc" method="get" role="search" className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <label htmlFor="news-search" className="mb-2 block text-sm font-semibold">
          Tìm bài viết
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="news-search" name="q" defaultValue={query ?? ""} placeholder="Nhập từ khóa..." className="h-11 pl-9 md:h-10" />
        </div>
        <Button type="submit" className="group mt-2 h-10 w-full hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/25">
          <Search className="size-4 transition-transform duration-300 group-hover:scale-110" /> Tìm kiếm
        </Button>
      </form>

      {categories.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h3 className={WIDGET_TITLE}>
            <span className={WIDGET_ICON}>
              <Folder className="size-4" />
            </span> Chuyên mục
          </h3>
          <ul className="divide-y">
            <li>
              <Link href="/tin-tuc" className={cn(CATEGORY_LINK, !activeCategorySlug && "font-semibold text-primary")}>
                <span className="inline-flex items-center gap-1.5">
                  <ChevronRight className={CHEVRON} /> Tất cả bài viết
                </span>
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/tin-tuc/chuyen-muc/${c.slug}`} className={cn(CATEGORY_LINK, activeCategorySlug === c.slug && "font-semibold text-primary")}>
                  <span className="inline-flex items-center gap-1.5">
                    <ChevronRight className={CHEVRON} /> {c.name}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                    {c.postCount}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {featured.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h3 className={WIDGET_TITLE}>
            <span className={WIDGET_ICON}>
              <Star className="size-4" />
            </span> Bài nổi bật
          </h3>
          <div className="space-y-4">
            {featured.map((p) => (
              <PostCard key={p.id} post={p} variant="horizontal" />
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h3 className={WIDGET_TITLE}>
            <span className={WIDGET_ICON}>
              <Layers className="size-4" />
            </span> Mẫu rèm nổi bật
          </h3>
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/san-pham/${p.slug}`} className="group flex gap-3">
                  <span className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    ) : (
                      <span className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{p.name}</span>
                    <span className="mt-1 block text-xs font-bold text-primary">{formatPriceRange(p.priceFrom, p.priceTo, p.priceUnit)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {productCategories.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h3 className={WIDGET_TITLE}>
            <span className={WIDGET_ICON}>
              <Layers className="size-4" />
            </span>
            Danh mục rèm
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {productCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/danh-muc/${c.slug}`}
                className="rounded-full border bg-background px-3 py-1 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:shadow-primary/20"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Hộp báo giá: nền xanh có quầng sáng, nút có vệt sáng lướt, chuông rung */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-brand-dark p-5 text-primary-foreground shadow-lg shadow-brand-dark/20">
        <div aria-hidden="true" className="absolute -right-10 -top-10 size-36 animate-glow rounded-full bg-cta/30 blur-2xl motion-reduce:animate-none" />
        <p className="relative text-lg font-bold">Cần báo giá rèm cửa?</p>
        <p className="relative mt-1 text-sm text-primary-foreground/85">Gọi hotline hoặc để lại thông tin, chúng tôi đo đạc tận nơi miễn phí và báo giá trong giờ làm việc.</p>
        <Button asChild className="group relative mt-4 h-11 w-full overflow-hidden bg-cta font-semibold text-cta-foreground shadow-md shadow-black/15 hover:-translate-y-0.5 hover:bg-cta-hover">
          <Link href="/bao-gia">
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden" />
            <Send className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /> Nhận báo giá
          </Link>
        </Button>
        <a
          href={`tel:${hotline.replace(/[^\d+]/g, "")}`}
          className="relative mt-3 flex items-center justify-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
        >
          <Phone className="size-4 animate-ring text-amber-300 motion-reduce:animate-none" /> Hotline: {hotline}
        </a>
      </div>
    </aside>
  );
}
