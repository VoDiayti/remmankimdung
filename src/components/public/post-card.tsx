import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { PostCardData } from "@/lib/queries/posts";
import { cn } from "@/lib/utils";

type PostCardProps = {
  post: PostCardData;
  /** vertical: ảnh trên, nội dung dưới; horizontal: ảnh nhỏ bên trái (sidebar) */
  variant?: "vertical" | "horizontal";
  className?: string;
  priority?: boolean;
};

export function PostCard({ post, variant = "vertical", className, priority }: PostCardProps) {
  const href = `/tin-tuc/${post.slug}`;

  if (variant === "horizontal") {
    return (
      <article className={cn("group flex gap-3", className)}>
        <Link href={href} className="relative block aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-muted" aria-label={post.title}>
          {post.coverImage ? (
            <Image src={post.coverImage} alt={post.title} fill sizes="112px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
          )}
        </Link>
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            <Link href={href} className="hover:text-primary">
              {post.title}
            </Link>
          </h3>
          {post.publishedAt && <p className="mt-1 text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>}
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-brand-dark/10", className)}>
      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={post.title}>
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-brand-dark" />
        )}
        {post.category && (
          <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-colors duration-300 group-hover:bg-cta group-hover:text-cta-foreground">{post.category.name}</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {post.publishedAt && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" /> {formatDate(post.publishedAt)}
          </p>
        )}
        <h3 className="line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-primary md:text-lg">
          <Link href={href} className="hover:text-primary">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>}
        <Link href={href} className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-primary">
          Đọc tiếp <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
