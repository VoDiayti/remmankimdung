import Image from "next/image";
import { Breadcrumbs, type Crumb } from "@/components/public/breadcrumbs";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string | null;
  crumbs: Crumb[];
  image?: string | null;
  children?: React.ReactNode;
  className?: string;
  /** Kích thước: compact cho trang danh sách, large cho trang chi tiết có ảnh */
  size?: "compact" | "large";
};

/** Hiện lên lần lượt lúc tải trang (CSS, không cần JS) */
const enter = (ms: number) => ({ className: "animate-hero-in motion-reduce:animate-none", style: { animationDelay: `${ms}ms` } });

/**
 * Banner đầu trang con: nền xanh đậm (hoặc ảnh), breadcrumb, tiêu đề, mô tả.
 * Hiệu ứng: chữ hiện lần lượt, gạch vàng dưới tiêu đề mọc ra, ảnh nền phóng chậm; nền không ảnh có quầng sáng chuyển động + nếp rèm mờ.
 */
export function PageHero({ title, description, crumbs, image, children, className, size = "compact" }: PageHeroProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-brand-dark text-white", className)}>
      {image ? (
        <>
          <Image
            src={image}
            alt=""
            fill
            // Next 16: `priority` đã bỏ – ảnh banner là LCP nên tải ngay, ưu tiên cao
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="scale-110 object-cover transition-transform duration-[14000ms] ease-out starting:scale-100 motion-reduce:transition-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/95 via-brand-dark/80 to-brand-dark/40" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-primary to-brand-dark" />
          {/* Nếp rèm mờ dần về bên phải */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-1/2 opacity-[0.07] [background-image:repeating-linear-gradient(90deg,#fff_0,transparent_14px,#000_28px,#fff_42px)] [mask-image:linear-gradient(to_left,black,transparent)] md:block"
          />
          <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 animate-glow rounded-full bg-white/10 blur-2xl motion-reduce:animate-none" />
          <div aria-hidden="true" className="absolute -bottom-32 left-1/4 size-80 animate-glow rounded-full bg-cta/20 blur-3xl [animation-delay:-3.5s] motion-reduce:animate-none" />
        </>
      )}
      {/* Lưới mảnh mờ góc trái */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top_left,black_10%,transparent_60%)]"
      />
      <div className={cn("container-page relative", size === "large" ? "py-12 md:py-20" : "py-10 md:py-14")}>
        <div {...enter(0)}>
          <Breadcrumbs items={crumbs} tone="light" className="mb-4" />
        </div>
        <h1
          className={cn("max-w-4xl text-balance font-bold leading-tight", size === "large" ? "text-3xl md:text-5xl" : "text-2xl md:text-4xl", enter(100).className)}
          style={enter(100).style}
        >
          {title}
        </h1>
        <span
          aria-hidden="true"
          className="mt-4 block h-1.5 w-20 origin-left animate-grow-x rounded-full bg-gradient-to-r from-cta to-amber-300 [animation-delay:450ms] motion-reduce:animate-none"
        />
        {description && (
          <p className={cn("mt-4 max-w-3xl text-base leading-relaxed text-white/85 md:text-lg", enter(220).className)} style={enter(220).style}>
            {description}
          </p>
        )}
        {children && <div {...enter(340)}>{children}</div>}
      </div>
    </section>
  );
}
