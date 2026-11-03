import Image from "next/image";
import Link from "next/link";
import { Layers, Ruler, ShieldCheck, Star } from "lucide-react";
import type { ProductCardData } from "@/lib/queries/products";
import { formatPriceRange } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Card sản phẩm dùng ở trang chủ, danh sách, danh mục, liên quan */
export function ProductCard({ product, className, priority }: { product: ProductCardData; className?: string; priority?: boolean }) {
  const href = `/san-pham/${product.slug}`;
  const price = formatPriceRange(product.priceFrom, product.priceTo, product.priceUnit);

  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg", className)}>
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-muted" aria-label={product.name}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Badge className="bg-white/95 text-foreground shadow-sm hover:bg-white">{product.category.name}</Badge>
        </div>
        {product.isFeatured && (
          <Badge className="absolute right-3 top-3 gap-1 bg-cta text-cta-foreground shadow-sm">
            <Star className="size-3 fill-current" /> Nổi bật
          </Badge>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {(product.code || product.line) && (
          <p className="mb-1.5 flex flex-wrap items-center gap-x-2 text-xs font-medium text-primary">
            {product.code && <span className="rounded bg-brand-light px-1.5 py-0.5 font-mono tracking-wide">{product.code}</span>}
            {product.line && <span className="text-muted-foreground">{product.line.name}</span>}
          </p>
        )}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground md:text-lg">
          <Link href={href} className="hover:text-primary">
            {product.name}
          </Link>
        </h3>

        <dl className="mt-3 space-y-1.5 text-sm">
          {product.material && (
            <div className="flex items-start gap-1.5">
              <Layers className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <dt className="sr-only">Chất liệu</dt>
              <dd className="line-clamp-1">{product.material}</dd>
            </div>
          )}
          {product.width && (
            <div className="flex items-start gap-1.5">
              <Ruler className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <dt className="sr-only">Khổ – kích thước</dt>
              <dd className="line-clamp-1">{product.width}</dd>
            </div>
          )}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Giá tham khảo</p>
            <p className="truncate text-base font-bold text-primary">{price}</p>
            {product.warrantyMonths ? (
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="size-3.5" /> Bảo hành {product.warrantyMonths} tháng
              </p>
            ) : null}
          </div>
          <Button asChild size="sm" className="h-9 shrink-0 bg-cta text-cta-foreground hover:bg-cta-hover">
            <Link href={`${href}#bao-gia`}>Báo giá</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
