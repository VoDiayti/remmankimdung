import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";
import type { ProductCategory, ProductLine } from "@/db/types";
import { cn } from "@/lib/utils";

export type CategoryCardData = Pick<ProductCategory, "name" | "slug" | "image" | "summary" | "priceNote"> & {
  lines: Pick<ProductLine, "id" | "name" | "slug">[];
};

/** Card danh mục rèm: ảnh, tên, tóm tắt, dòng giá, chip các loại rèm */
export function CategoryCard({ category, className, priority }: { category: CategoryCardData; className?: string; priority?: boolean }) {
  const href = `/danh-muc/${category.slug}`;
  const lines = category.lines.slice(0, 3);
  const more = category.lines.length - lines.length;

  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg", className)}>
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-muted" aria-label={category.name}>
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-14">
          <h3 className="text-xl font-bold text-white">{category.name}</h3>
        </div>
        {category.priceNote && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cta px-2.5 py-1 text-xs font-bold text-cta-foreground shadow-sm">
            <Tag className="size-3" /> {category.priceNote}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {category.summary && <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{category.summary}</p>}
        {lines.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lines.map((l) => (
              <Link key={l.id} href={`${href}#${l.slug}`} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                {l.name}
              </Link>
            ))}
            {more > 0 && <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">+{more}</span>}
          </div>
        )}
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary group-hover:gap-2">
          Xem mẫu & bảng giá <ArrowRight className="size-4 transition-transform" />
        </Link>
      </div>
    </article>
  );
}
