import Link from "next/link";
import { Folder, Layers, Search, Star } from "lucide-react";
import type { PostCardData } from "@/lib/queries/posts";
import type { ProductCardData } from "@/lib/queries/products";
import { formatPriceRange } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/public/post-card";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Category = { id: string; name: string; slug: string; postCount: number };

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
};

/** Sidebar tin tức: tìm kiếm, chuyên mục, bài nổi bật, sản phẩm nổi bật, danh mục rèm, hộp báo giá */
export function NewsSidebar({ categories, featured, products = [], productCategories = [], activeCategorySlug, query, hotline }: NewsSidebarProps) {
  return (
    <aside className="space-y-6">
      <form action="/tin-tuc" method="get" role="search" className="rounded-2xl border bg-card p-4 shadow-sm">
        <label htmlFor="news-search" className="mb-2 block text-sm font-semibold">
          Tìm bài viết
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="news-search" name="q" defaultValue={query ?? ""} placeholder="Nhập từ khóa..." className="h-11 pl-9 md:h-10" />
        </div>
        <Button type="submit" variant="secondary" className="mt-2 h-10 w-full">
          Tìm kiếm
        </Button>
      </form>

      {categories.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark">
            <Folder className="size-4 text-primary" /> Chuyên mục
          </h3>
          <ul className="divide-y">
            <li>
              <Link href="/tin-tuc" className={cn("flex items-center justify-between py-2.5 text-sm hover:text-primary", !activeCategorySlug && "font-semibold text-primary")}>
                Tất cả bài viết
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/tin-tuc/chuyen-muc/${c.slug}`}
                  className={cn("flex items-center justify-between py-2.5 text-sm hover:text-primary", activeCategorySlug === c.slug && "font-semibold text-primary")}
                >
                  <span>{c.name}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{c.postCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {featured.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark">
            <Star className="size-4 text-primary" /> Bài nổi bật
          </h3>
          <div className="space-y-4">
            {featured.map((p) => (
              <PostCard key={p.id} post={p} variant="horizontal" />
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-dark">
            <Layers className="size-4 text-primary" /> Mẫu rèm nổi bật
          </h3>
          <ul className="space-y-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link href={`/san-pham/${p.slug}`} className="group flex gap-3">
                  <span className="relative block aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {p.image ? (
                      <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
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
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-brand-dark">Danh mục rèm</h3>
          <div className="flex flex-wrap gap-1.5">
            {productCategories.map((c) => (
              <Link key={c.slug} href={`/danh-muc/${c.slug}`} className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary hover:text-primary">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm">
        <p className="text-lg font-bold">Cần báo giá rèm cửa?</p>
        <p className="mt-1 text-sm text-primary-foreground/85">Gọi hotline hoặc để lại thông tin, chúng tôi đo đạc tận nơi miễn phí và báo giá trong giờ làm việc.</p>
        <Button asChild className="mt-4 h-11 w-full bg-cta font-semibold text-cta-foreground hover:bg-cta-hover">
          <Link href="/bao-gia">Nhận báo giá</Link>
        </Button>
        <a href={`tel:${hotline.replace(/[^\d+]/g, "")}`} className="mt-2 block text-center text-sm font-semibold underline-offset-4 hover:underline">
          Hotline: {hotline}
        </a>
      </div>
    </aside>
  );
}
